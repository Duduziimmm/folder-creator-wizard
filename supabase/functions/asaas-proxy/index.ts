
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, asaas-environment, access_token, request-type, customer-id, due-date',
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
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const apiBaseUrl = environment === 'prod' 
      ? 'https://api.asaas.com/v3'
      : 'https://api-sandbox.asaas.com/v3'

    let apiUrl = '';
    
    // Determinar a URL da API baseado no tipo de requisição
    if (requestType === 'customer') {
      const customerId = req.headers.get('customer-id');
      if (!customerId) {
        return new Response(
          JSON.stringify({ error: 'ID do cliente não fornecido' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Fazer a requisição para a API do Asaas
    console.log('Fazendo requisição para:', apiUrl);
    console.log('Headers:', {
      'accept': 'application/json',
      'access_token': accessToken.substring(0, 10) + '...' // Log parcial do token por segurança
    });

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'access_token': accessToken
      }
    });

    console.log('Status da resposta:', response.status);
    
    // Primeiro tentar ler a resposta como texto
    const responseText = await response.text();
    console.log('Resposta bruta:', responseText);

    // Se não for um sucesso, retornar o erro
    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Erro na API do Asaas', 
          status: response.status,
          details: responseText 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status
        }
      )
    }

    // Tentar fazer o parse do JSON
    try {
      const jsonData = JSON.parse(responseText);
      console.log('Dados processados:', jsonData);
      
      return new Response(
        JSON.stringify(jsonData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    } catch (error) {
      console.error('Erro ao fazer parse do JSON:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Resposta inválida da API', 
          details: responseText
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

  } catch (error) {
    console.error('Erro na Edge Function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno no servidor',
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
