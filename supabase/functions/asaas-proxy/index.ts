
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, access_token, asaas-environment, request-type, customer-id, due-date',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    const accessToken = req.headers.get('access_token')
    const environment = req.headers.get('asaas-environment')
    const requestType = req.headers.get('request-type')
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Access token não fornecido' }),
        { headers: corsHeaders, status: 400 }
      )
    }

    const baseUrl = environment === 'prod' 
      ? 'https://api.asaas.com/v3'
      : 'https://api-sandbox.asaas.com/v3'

    let url: string
    
    if (requestType === 'payments') {
      const dueDate = req.headers.get('due-date')
      if (!dueDate) {
        return new Response(
          JSON.stringify({ error: 'Data de vencimento não fornecida' }),
          { headers: corsHeaders, status: 400 }
        )
      }
      url = `${baseUrl}/payments?dueDate[ge]=${dueDate}&dueDate[le]=${dueDate}`
    } else if (requestType === 'customer') {
      const customerId = req.headers.get('customer-id')
      if (!customerId) {
        return new Response(
          JSON.stringify({ error: 'ID do cliente não fornecido' }),
          { headers: corsHeaders, status: 400 }
        )
      }
      url = `${baseUrl}/customers/${customerId}`
    } else {
      return new Response(
        JSON.stringify({ error: 'Tipo de requisição inválido' }),
        { headers: corsHeaders, status: 400 }
      )
    }

    console.log(`Fazendo requisição para: ${url}`)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'access_token': accessToken
      }
    })

    const data = await response.json()

    return new Response(
      JSON.stringify(data),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: response.status
      }
    )
  } catch (error) {
    console.error('Erro na Edge Function:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { headers: corsHeaders, status: 500 }
    )
  }
})
