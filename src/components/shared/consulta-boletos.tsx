
import React, { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import BoletosTable from './boletos-table';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ConsultaBoletosProps {
  apiKey?: string;
  webhookUrl?: string;
  environment?: 'sandbox' | 'production';
}

const ConsultaBoletos = ({ apiKey, webhookUrl, environment = 'sandbox' }: ConsultaBoletosProps) => {
  const [date, setDate] = React.useState<Date>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [boletos, setBoletos] = React.useState([]);
  const { toast } = useToast();

  const handleConsultarBoletos = async () => {
    if (!date) {
      toast({
        title: "Data não selecionada",
        description: "Por favor, selecione uma data para consultar os boletos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Chamada para a Edge Function
      const response = await fetch('/api/asaas-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          environment,
          requestType: 'payments',
          dueDate: format(date, 'yyyy-MM-dd')
        })
      });

      const responseData = await response.json();
      console.info('Resposta da Edge Function:', responseData);

      if (responseData.data) {
        // Mapear os dados dos pagamentos para o formato esperado
        const boletosData = responseData.data.map(payment => ({
          id: payment.customer,
          customer: payment.description.split(' - ')[1] || 'Nome não disponível',
          value: payment.value,
          dueDate: payment.dueDate,
          status: payment.status,
          email: '', // Será preenchido depois
          phone: '', // Será preenchido depois
        }));

        // Buscar informações adicionais dos clientes
        for (const boleto of boletosData) {
          const customerResponse = await fetch('/api/asaas-proxy', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              apiKey,
              environment,
              requestType: 'customer',
              customerId: boleto.id
            })
          });

          const customerData = await customerResponse.json();
          if (customerData) {
            boleto.customer = customerData.name || boleto.customer;
            boleto.email = customerData.email || '';
            boleto.phone = customerData.mobilePhone || customerData.phone || '';
          }
        }

        // Salvar os registros no Supabase
        for (const boleto of boletosData) {
          await supabase.from('payment_records').upsert({
            customer_id: boleto.id,
            customer_name: boleto.customer,
            customer_email: boleto.email,
            customer_phone: boleto.phone,
            payment_value: boleto.value,
            due_date: boleto.dueDate,
            consulted_at: new Date().toISOString(),
            user_id: (await supabase.auth.getUser()).data.user?.id
          }, {
            onConflict: 'customer_id,payment_value,due_date'
          });
        }

        setBoletos(boletosData);
      }

      setIsLoading(false);
      toast({
        title: "Sucesso",
        description: "Boletos consultados com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao consultar boletos:', error);
      setIsLoading(false);
      toast({
        title: "Erro",
        description: "Falha ao consultar boletos. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
        <Button onClick={handleConsultarBoletos} disabled={isLoading}>
          {isLoading ? 'Consultando...' : 'Consultar Boletos'}
        </Button>
      </div>
      <BoletosTable boletos={boletos} webhookUrl={webhookUrl} />
    </div>
  );
};

export default ConsultaBoletos;
