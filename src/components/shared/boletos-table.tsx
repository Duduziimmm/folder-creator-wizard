
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
}

interface BoletosTableProps {
  boletos: Boleto[];
  webhookUrl?: string;
}

const BoletosTable = ({ boletos, webhookUrl }: BoletosTableProps) => {
  const { toast } = useToast();

  const handleSendReminder = async (boleto: Boleto) => {
    try {
      // Verificar se existe um registro para este boleto
      const { data: existingRecord } = await supabase
        .from('payment_records')
        .select('id, webhook_send_count')
        .eq('customer_id', boleto.id)
        .eq('payment_value', boleto.value)
        .eq('due_date', boleto.dueDate)
        .single();

      if (!webhookUrl) {
        toast({
          title: "Erro",
          description: "URL do Webhook não configurada",
          variant: "destructive",
        });
        return;
      }

      // Preparar dados para enviar ao webhook
      const webhookData = {
        payment_id: boleto.id,
        customer: boleto.customer,
        value: boleto.value,
        due_date: boleto.dueDate,
        status: boleto.status,
        timestamp: new Date().toISOString()
      };

      // Enviar para o webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar lembrete');
      }

      // Atualizar o contador de envios
      if (existingRecord) {
        await supabase
          .from('payment_records')
          .update({
            webhook_send_count: (existingRecord.webhook_send_count || 0) + 1
          })
          .eq('id', existingRecord.id);
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
      <table className="w-full min-w-[640px] table-auto">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Número</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Cliente</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Valor</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Vencimento</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Status</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Ações</th>
          </tr>
        </thead>
        <tbody>
          {boletos.map((boleto) => (
            <tr key={boleto.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-sm text-gray-600">{boleto.id}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{boleto.customer}</td>
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
