
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
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'access_token': accessToken
      }
    })

    const responseData = await response.text()
    console.log(`Resposta da API (${requestType}):`, responseData)

    // Retornar a resposta da API
    return new Response(
      responseData,
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status
      }
    )

  } catch (error) {
    console.error('Erro na Edge Function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
