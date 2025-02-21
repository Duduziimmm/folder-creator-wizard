
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const AnalystDashboard = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedDate, setSelectedDate] = useState('2025-02-14');

  // Carregar configurações salvas
  useEffect(() => {
    const savedApiKey = localStorage.getItem('asaasApiKey');
    const savedWebhookUrl = localStorage.getItem('webhookUrl');
    
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedWebhookUrl) setWebhookUrl(savedWebhookUrl);
  }, []);

  const handleSaveConfig = () => {
    if (!apiKey || !webhookUrl) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('asaasApiKey', apiKey);
    localStorage.setItem('webhookUrl', webhookUrl);

    toast({
      title: "Sucesso",
      description: "Configurações salvas com sucesso!",
    });
  };

  const handleQueryBoletos = async () => {
    const savedApiKey = localStorage.getItem('asaasApiKey');
    const savedWebhookUrl = localStorage.getItem('webhookUrl');

    if (!savedApiKey || !savedWebhookUrl) {
      toast({
        title: "Erro",
        description: "Configure primeiro a Chave API e Webhook URL nas configurações.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Aqui você implementaria a chamada real para a API do Asaas
      toast({
        title: "Consulta iniciada",
        description: "Consultando boletos com a chave API configurada...",
      });
      
      // Exemplo de como seria a chamada (pseudocódigo)
      // const response = await fetch('https://api-sandbox.asaas.com/api/v3/payments', {
      //   headers: {
      //     'access_token': savedApiKey
      //   }
      // });
      // const data = await response.json();
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao consultar boletos. Verifique suas configurações.",
        variant: "destructive",
      });
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

      {/* Role Tabs */}
      <div className="mb-6">
        <Tabs defaultValue="analyst" className="w-fit">
          <TabsList>
            <TabsTrigger value="analyst" className="px-6">Analyst</TabsTrigger>
            <TabsTrigger value="coordinator" className="px-6">Coordinator</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Section Tabs */}
      <div className="mb-6">
        <Tabs defaultValue="config" className="w-fit">
          <TabsList>
            <TabsTrigger value="config" className="px-6">Configurações</TabsTrigger>
            <TabsTrigger value="consultation" className="px-6">Consulta de Boletos</TabsTrigger>
          </TabsList>

          <TabsContent value="config">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-8">Configurações do Ambiente</h2>

              {/* Sandbox Environment Switch */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg mb-1">Ambiente de Sandbox</h3>
                    <p className="text-gray-500 text-sm">Modo de testes ativo - Usando API Sandbox</p>
                  </div>
                  <Switch />
                </div>
              </div>

              {/* API Base URL Info */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-2">
                  <span className="text-gray-500">ℹ️</span>
                  <p>Ambiente de testes ativo. API Base: https://api-sandbox.asaas.com/api/v3</p>
                </div>
              </div>

              {/* API Key Input */}
              <div className="mb-6">
                <label className="block text-lg font-medium mb-2">Chave API do Asaas</label>
                <Input 
                  type="text" 
                  placeholder="Digite sua chave API do Sandbox"
                  className="w-full"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              {/* Webhook URL Input */}
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

              {/* Save Button */}
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
              <div className="flex items-center gap-4">
                <Input
                  type="date"
                  className="flex-1"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                <Button 
                  className="bg-black text-white hover:bg-gray-800 px-6"
                  onClick={handleQueryBoletos}
                >
                  Consultar Boletos
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalystDashboard;
