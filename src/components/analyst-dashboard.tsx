
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import BoletosTable from "./shared/boletos-table";
import { supabase } from "@/integrations/supabase/client";

interface Boleto {
  id: string;
  value: number;
  dueDate: string;
  status: string;
}

interface ApiConfig {
  api_key: string;
  webhook_url: string;
  is_prod: boolean;
}

const AnalystDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedDate, setSelectedDate] = useState('2025-02-14');
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isProd, setIsProd] = useState(false);

  const apiBaseUrl = isProd ? 'https://api.asaas.com/v3' : 'https://api-sandbox.asaas.com/api/v3';

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      loadConfiguration();
    };

    checkSession();
  }, [navigate]);

  const loadConfiguration = async () => {
    try {
      const { data: configs, error } = await supabase
        .from('api_configurations')
        .select('*')
        .single();

      if (error) {
        console.error('Error loading configurations:', error);
        return;
      }

      if (configs) {
        setApiKey(configs.api_key);
        setWebhookUrl(configs.webhook_url);
        setIsProd(configs.is_prod);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSaveConfig = async () => {
    if (!apiKey || !webhookUrl) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: existingConfig } = await supabase
        .from('api_configurations')
        .select('*')
        .single();

      const configData = {
        api_key: apiKey,
        webhook_url: webhookUrl,
        is_prod: isProd,
        user_id: (await supabase.auth.getUser()).data.user?.id
      };

      let error;

      if (existingConfig) {
        // Update existing configuration
        const { error: updateError } = await supabase
          .from('api_configurations')
          .update(configData)
          .eq('id', existingConfig.id);
        error = updateError;
      } else {
        // Insert new configuration
        const { error: insertError } = await supabase
          .from('api_configurations')
          .insert([configData]);
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnvironmentChange = async (checked: boolean) => {
    setIsProd(checked);
    setBoletos([]); // Limpa os boletos ao trocar de ambiente
    
    toast({
      title: "Ambiente Alterado",
      description: `Ambiente alterado para ${checked ? 'Produção' : 'Sandbox'}`,
    });
  };

  const handleQueryBoletos = async () => {
    const { data: config } = await supabase
      .from('api_configurations')
      .select('*')
      .single();

    if (!config?.api_key || !config?.webhook_url) {
      toast({
        title: "Erro",
        description: "Configure primeiro a Chave API e Webhook URL nas configurações.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/payments`, {
        headers: {
          'accept': 'application/json',
          'access_token': config.api_key,
          'Content-Type': 'application/json'
        },
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Erro ao consultar a API');
      }

      const data = await response.json();
      const formattedData = data.data.map((payment: any) => ({
        id: payment.id,
        value: payment.value,
        dueDate: payment.dueDate,
        status: payment.status,
        customer: payment.customer,
        billingType: payment.billingType,
        invoiceUrl: payment.invoiceUrl
      }));

      setBoletos(formattedData);
      
      toast({
        title: "Sucesso",
        description: "Boletos consultados com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao consultar boletos. Verifique suas configurações.",
        variant: "destructive",
      });
      setBoletos([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Asaas Webhook Dashboard</h1>
        <Link to="/login" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <span>Sair</span>
        </Link>
      </div>

      <div className="mb-6">
        <Tabs defaultValue="analyst" className="w-fit">
          <TabsList>
            <TabsTrigger value="analyst" className="px-6">Analyst</TabsTrigger>
            <TabsTrigger value="coordinator" className="px-6">Coordinator</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mb-6">
        <Tabs defaultValue="config" className="w-fit">
          <TabsList>
            <TabsTrigger value="config" className="px-6">Configurações</TabsTrigger>
            <TabsTrigger value="consultation" className="px-6">Consulta de Boletos</TabsTrigger>
          </TabsList>

          <TabsContent value="config">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-8">Configurações do Ambiente</h2>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg mb-1">Ambiente de Integração</h3>
                    <p className="text-gray-500 text-sm">
                      {isProd ? 'Modo de produção ativo' : 'Modo de testes ativo - Usando API Sandbox'}
                    </p>
                  </div>
                  <Switch 
                    checked={isProd}
                    onCheckedChange={handleEnvironmentChange}
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-2">
                  <span className="text-gray-500">ℹ️</span>
                  <p>
                    {isProd 
                      ? 'Ambiente de produção ativo. API Base: https://api.asaas.com/v3'
                      : 'Ambiente de testes ativo. API Base: https://api-sandbox.asaas.com/api/v3'
                    }
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-lg font-medium mb-2">Chave API do Asaas</label>
                <Input 
                  type="text" 
                  placeholder={`Digite sua chave API ${isProd ? 'de produção' : 'do Sandbox'}`}
                  className="w-full"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              <div className="mb-8">
                <label className="block text-lg font-medium mb-2">Webhook URL</label>
                <Input 
                  type="text" 
                  placeholder="Digite a URL do Webhook"
                  className="w-full"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>

              <Button 
                className="w-full bg-black text-white hover:bg-gray-800"
                onClick={handleSaveConfig}
                disabled={isSaving}
              >
                {isSaving ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="consultation">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-8">Consulta de Boletos</h2>
              <div className="flex items-center gap-4 mb-8">
                <Input
                  type="date"
                  className="flex-1"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                <Button 
                  className="bg-black text-white hover:bg-gray-800 px-6"
                  onClick={handleQueryBoletos}
                  disabled={isLoading}
                >
                  {isLoading ? "Consultando..." : "Consultar Boletos"}
                </Button>
              </div>

              <BoletosTable boletos={boletos} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalystDashboard;
