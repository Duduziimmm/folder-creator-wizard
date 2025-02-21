
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, asaas-environment, access_token, request-type, customer-id, due-date',
  'Content-Type': 'application/json'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const environment = req.headers.get('asaas-environment') || 'sandbox'
    const accessToken = req.headers.get('access_token')
    const requestType = req.headers.get('request-type')

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'API key não fornecida' }),
        { 
          status: 400,
          headers: corsHeaders
        }
      )
    }

    const apiBaseUrl = environment === 'prod' 
      ? 'https://api.asaas.com/v3'
      : 'https://api-sandbox.asaas.com/v3'

    let apiUrl = '';
    
    if (requestType === 'customer') {
      const customerId = req.headers.get('customer-id');
      if (!customerId) {
        return new Response(
          JSON.stringify({ error: 'ID do cliente não fornecido' }),
          { 
            status: 400,
            headers: corsHeaders
          }
        )
      }
      apiUrl = `${apiBaseUrl}/customers/${customerId}`;
      console.log('Consultando cliente:', apiUrl);
    } 
    else if (requestType === 'payments') {
      const dueDate = req.headers.get('due-date');
      if (!dueDate) {
        return new Response(
          JSON.stringify({ error: 'Data de vencimento não fornecida' }),
          { 
            status: 400,
            headers: corsHeaders
          }
        )
      }
      apiUrl = `${apiBaseUrl}/payments?dueDate[ge]=${dueDate}&dueDate[le]=${dueDate}`;
      console.log('Consultando pagamentos:', apiUrl);
    }
    else {
      return new Response(
        JSON.stringify({ error: 'Tipo de requisição inválido' }),
        { 
          status: 400,
          headers: corsHeaders
        }
      )
    }
    
    console.log('Fazendo requisição para:', apiUrl);
    console.log('Headers:', {
      'accept': 'application/json',
      'access_token': accessToken.substring(0, 10) + '...'
    });

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'access_token': accessToken
      }
    });

    console.log('Status da resposta:', response.status);
    
    const responseData = await response.json();
    console.log('Resposta processada:', responseData);

    return new Response(
      JSON.stringify(responseData),
      { 
        headers: corsHeaders,
        status: response.status
      }
    )

  } catch (error) {
    console.error('Erro na Edge Function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno no servidor',
        details: error.message
      }),
      { 
        headers: corsHeaders,
        status: 500
      }
    )
  }
})
