
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, asaas-environment, access_token',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const dueDate = url.searchParams.get('dueDate')
    const environment = req.headers.get('asaas-environment') || 'sandbox'
    const accessToken = req.headers.get('access_token')

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

    console.log(`Fazendo requisição para ${apiBaseUrl}/payments com dueDate=${dueDate}`)

    const apiUrl = `${apiBaseUrl}/payments?dueDate[ge]=${dueDate}&dueDate[le]=${dueDate}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'access_token': accessToken
      }
    })

    const data = await response.json()
    console.log('Resposta da API Asaas:', data)

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
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
