import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BoletosTable from "./shared/boletos-table";

interface Boleto {
  id: string;
  value: number;
  dueDate: string;
  status: string;
  customer: string;
}

interface ApiLog {
  id: string;
  request_url: string;
  request_method: string;
  response_status: number | null;
  response_body: string | null;
  created_at: string;
}

const AnalystDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedDate, setSelectedDate] = useState('2025-02-14');
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProd, setIsProd] = useState(false);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [configId, setConfigId] = useState<string | null>(null);

  const apiBaseUrl = isProd ? 'https://api.asaas.com/v3' : 'https://api-sandbox.asaas.com/v3';

  useEffect(() => {
    loadConfiguration();
    loadApiLogs();
  }, []);

  const loadConfiguration = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: configs, error } = await supabase
      .from('api_configurations')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar configurações",
        description: "Ocorreu um erro ao carregar suas configurações."
      });
      return;
    }

    if (configs) {
      setApiKey(configs.api_key);
      setWebhookUrl(configs.webhook_url);
      setIsProd(configs.is_prod);
      setConfigId(configs.id);
    }
  };

  const loadApiLogs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: logs, error } = await supabase
      .from('api_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar logs",
        description: "Ocorreu um erro ao carregar o histórico de consultas."
      });
      return;
    }

    setApiLogs(logs || []);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado com sucesso",
        description: "Até logo!"
      });
      navigate('/login');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: "Ocorreu um erro ao tentar fazer logout."
      });
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const configData = {
      user_id: user.id,
      api_key: apiKey,
      webhook_url: webhookUrl,
      is_prod: isProd
    };

    let operation;
    if (configId) {
      operation = supabase
        .from('api_configurations')
        .update(configData)
        .eq('id', configId);
    } else {
      operation = supabase
        .from('api_configurations')
        .insert([configData]);
    }

    const { error } = await operation;

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações.",
        variant: "destructive",
      });
      return;
    }

    if (!configId) {
      await loadConfiguration();
    }

    toast({
      title: "Sucesso",
      description: "Configurações salvas com sucesso!",
    });
  };

  const handleEnvironmentChange = (checked: boolean) => {
    setIsProd(checked);
    setBoletos([]);
    
    toast({
      title: "Ambiente Alterado",
      description: `Ambiente alterado para ${checked ? 'Produção' : 'Sandbox'}`,
    });
  };

  const fetchCustomerDetails = async (customerId: string, apiKey: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/customers/${customerId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'access_token': apiKey
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao consultar dados do cliente');
      }

      const data = await response.json();
      console.log('Dados do cliente:', data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar detalhes do cliente:', error);
      throw error;
    }
  };

  const savePaymentRecord = async (payment: any, customerData: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const paymentRecord = {
      customer_id: customerData.id,
      customer_name: customerData.name,
      customer_email: customerData.email || null,
      customer_phone: customerData.mobilePhone || customerData.phone || null,
      payment_value: payment.value,
      due_date: payment.dueDate,
      user_id: user.id
    };

    const { error } = await supabase
      .from('payment_records')
      .insert([paymentRecord]);

    if (error) {
      console.error('Erro ao salvar registro:', error);
      throw new Error('Erro ao salvar registro no banco de dados');
    }
  };

  const saveApiLog = async (url: string, method: string, status: number | null, responseBody: string | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Usuário não autenticado ao tentar salvar log');
        return;
      }

      console.log('Tentando salvar log com dados:', {
        user_id: user.id,
        api_configuration_id: configId,
        request_url: url,
        request_method: method,
        response_status: status,
        response_body: responseBody
      });

      const { data, error } = await supabase
        .from('api_logs')
        .insert([{
          user_id: user.id,
          api_configuration_id: configId,
          request_url: url,
          request_method: method,
          response_status: status,
          response_body: responseBody
        }])
        .select();

      if (error) {
        console.error('Erro ao salvar log:', error);
        throw error;
      }

      console.log('Log salvo com sucesso:', data);
      return data;
    } catch (error) {
      console.error('Erro ao salvar log:', error);
      throw error;
    }
  };

  const handleQueryBoletos = async () => {
    if (!configId || !apiKey) {
      toast({
        title: "Erro",
        description: "Configure primeiro a Chave API e Webhook URL nas configurações.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const queryParams = new URLSearchParams({
      'dueDate[ge]': selectedDate,
      'dueDate[le]': selectedDate
    });

    const requestUrl = `${apiBaseUrl}/payments?${queryParams}`;
    console.log('Iniciando consulta de boletos...');
    console.log('URL da requisição:', requestUrl);
    console.log('API Key (primeiros 4 caracteres):', apiKey.substring(0, 4));

    try {
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'access_token': apiKey
        }
      });

      console.log('Status da resposta:', response.status);
      const responseText = await response.text();
      console.log('Resposta da API:', responseText);

      try {
        await saveApiLog(
          requestUrl,
          'GET',
          response.status,
          responseText
        );
      } catch (logError) {
        console.error('Erro ao salvar log:', logError);
      }

      if (!response.ok) {
        throw new Error(`Erro ao consultar a API: ${responseText}`);
      }

      const responseData = JSON.parse(responseText);
      console.log('Dados dos pagamentos:', responseData);

      const processedPayments = [];
      for (const payment of responseData.data) {
        try {
          console.log('Processando pagamento:', payment.id);
          const customerData = await fetchCustomerDetails(payment.customer, apiKey);
          await savePaymentRecord(payment, customerData);
          processedPayments.push({
            id: payment.id,
            value: payment.value,
            dueDate: payment.dueDate,
            status: payment.status,
            customer: customerData.name || payment.customer
          });
        } catch (error) {
          console.error(`Erro ao processar pagamento ${payment.id}:`, error);
          processedPayments.push({
            id: payment.id,
            value: payment.value,
            dueDate: payment.dueDate,
            status: payment.status,
            customer: payment.customer
          });
        }
      }

      setBoletos(processedPayments);
      
      toast({
        title: "Sucesso",
        description: "Boletos consultados e dados salvos com sucesso!",
      });

      await loadApiLogs();

    } catch (error) {
      console.error('Erro completo na requisição:', error);
      
      let errorMessage = "Erro ao consultar boletos. ";
      if (error instanceof Error) {
        errorMessage += error.message;
      }

      toast({
        title: "Erro",
        description: errorMessage,
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
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          Sair
        </Button>
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
            <TabsTrigger value="logs" className="px-6">Histórico de Consultas</TabsTrigger>
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
              >
                Salvar Configurações
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

          <TabsContent value="logs">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-8">Histórico de Consultas</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left">Data/Hora</th>
                      <th className="py-3 px-4 text-left">URL</th>
                      <th className="py-3 px-4 text-left">Método</th>
                      <th className="py-3 px-4 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiLogs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">{log.request_url}</td>
                        <td className="py-3 px-4">{log.request_method}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded ${
                            log.response_status && log.response_status < 400 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {log.response_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {apiLogs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">
                          Nenhuma consulta realizada ainda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalystDashboard;
