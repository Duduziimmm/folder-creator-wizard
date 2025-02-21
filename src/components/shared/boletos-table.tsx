
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Boleto {
  id: string;
  value: number;
  dueDate: string;
  status: string;
  customer: string;
  email?: string;
  phone?: string;
}

interface BoletosTableProps {
  boletos: Boleto[];
  webhookUrl?: string;
}

const BoletosTable = ({ boletos, webhookUrl }: BoletosTableProps) => {
  const { toast } = useToast();

  const handleSendReminder = async (boleto: Boleto) => {
    try {
      if (!webhookUrl) {
        toast({
          title: "Erro",
          description: "URL do Webhook não configurada",
          variant: "destructive",
        });
        return;
      }

      // Buscar o user_id atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      // Preparar dados para enviar ao webhook em formato JSON
      const webhookData = {
        tipo: "lembrete_pagamento",
        dados: {
          payment_id: boleto.id,
          customer: {
            name: boleto.customer,
            email: boleto.email,
            phone: boleto.phone
          },
          payment: {
            value: boleto.value,
            due_date: boleto.dueDate,
            status: boleto.status
          },
          metadata: {
            sent_by: user.id,
            timestamp: new Date().toISOString()
          }
        }
      };

      console.log('Enviando dados para webhook:', JSON.stringify(webhookData, null, 2));

      // Enviar para o webhook com headers JSON explícitos
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Resposta do webhook:', errorText);
        throw new Error('Falha ao enviar lembrete');
      }

      // Verificar se existe um registro para este boleto
      const { data: existingRecord } = await supabase
        .from('payment_records')
        .select('id, webhook_send_count')
        .eq('customer_id', boleto.id)
        .eq('payment_value', boleto.value)
        .eq('due_date', boleto.dueDate)
        .single();

      // Atualizar ou criar registro do envio
      if (existingRecord) {
        await supabase
          .from('payment_records')
          .update({
            webhook_send_count: (existingRecord.webhook_send_count || 0) + 1,
            last_webhook_send: new Date().toISOString()
          })
          .eq('id', existingRecord.id);
      } else {
        await supabase
          .from('payment_records')
          .insert({
            customer_id: boleto.id,
            customer_name: boleto.customer,
            customer_email: boleto.email,
            customer_phone: boleto.phone,
            payment_value: boleto.value,
            due_date: boleto.dueDate,
            webhook_send_count: 1,
            last_webhook_send: new Date().toISOString(),
            user_id: user.id
          });
      }

      toast({
        title: "Sucesso",
        description: "Lembrete enviado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao enviar lembrete:', error);
      toast({
        title: "Erro",
        description: "Falha ao enviar lembrete",
        variant: "destructive",
      });
    }
  };

  if (!boletos?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum boleto encontrado para a data selecionada.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[800px] table-auto">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Nome</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">E-mail</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Telefone</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Valor</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Vencimento</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Status</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Ações</th>
          </tr>
        </thead>
        <tbody>
          {boletos.map((boleto) => (
            <tr key={boleto.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-sm text-gray-600">{boleto.customer}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{boleto.email || '-'}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{boleto.phone || '-'}</td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(boleto.value)}
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {new Date(boleto.dueDate).toLocaleDateString('pt-BR')}
              </td>
              <td className="py-3 px-4">
                <span 
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${boleto.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                    boleto.status === 'RECEIVED' ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-800'}`}
                >
                  {boleto.status}
                </span>
              </td>
              <td className="py-3 px-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendReminder(boleto)}
                  className="flex items-center gap-2"
                >
                  <Bell className="h-4 w-4" />
                  <span>Enviar Lembrete</span>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BoletosTable;
