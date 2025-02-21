
import React from 'react';
import BoletosTable from './shared/boletos-table';
import { supabase } from '@/integrations/supabase/client';

const CoordinatorDashboard = () => {
  // Inicializando um array vazio de boletos
  const [boletos, setBoletos] = React.useState([]);
  const [webhookUrl, setWebhookUrl] = React.useState('');

  React.useEffect(() => {
    const fetchBoletos = async () => {
      // Buscar os registros de pagamento
      const { data: payments, error } = await supabase
        .from('payment_records')
        .select(`
          customer_id,
          customer_name,
          customer_email,
          customer_phone,
          payment_value,
          due_date
        `)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Erro ao buscar boletos:', error);
        return;
      }

      if (payments) {
        setBoletos(payments.map(payment => ({
          id: payment.customer_id,
          customer: payment.customer_name,
          email: payment.customer_email,
          phone: payment.customer_phone,
          value: payment.payment_value,
          dueDate: payment.due_date,
          status: 'PENDING'
        })));
      }

      // Buscar configuração do webhook
      const { data: config } = await supabase
        .from('api_configurations')
        .select('webhook_url')
        .single();

      if (config) {
        setWebhookUrl(config.webhook_url);
      }
    };

    fetchBoletos();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard do Coordenador</h1>
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Total de Boletos</h3>
            <p className="text-2xl font-bold">{boletos.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Boletos Pendentes</h3>
            <p className="text-2xl font-bold">
              {boletos.filter(b => b.status === 'PENDING').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Boletos Pagos</h3>
            <p className="text-2xl font-bold">
              {boletos.filter(b => b.status === 'RECEIVED').length}
            </p>
          </div>
        </div>
        <BoletosTable boletos={boletos} webhookUrl={webhookUrl} />
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
