
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AnalystDashboard = () => {
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
        </Tabs>
      </div>

      {/* Main Content */}
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
          />
        </div>

        {/* Webhook URL Input */}
        <div className="mb-8">
          <label className="block text-lg font-medium mb-2">Webhook URL</label>
          <Input 
            type="text" 
            placeholder="Digite a URL do Webhook"
            className="w-full"
          />
        </div>

        {/* Save Button */}
        <Button className="w-full bg-black text-white hover:bg-gray-800">
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

export default AnalystDashboard;
