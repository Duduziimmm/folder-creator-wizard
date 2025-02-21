
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
    const customerId = url.searchParams.get('customerId')
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

    // Se tiver customerId, consulta dados do cliente
    if (customerId) {
      console.log(`Consultando dados do cliente ${customerId}`)
      const customerUrl = `${apiBaseUrl}/customers/${customerId}`
      
      const customerResponse = await fetch(customerUrl, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'access_token': accessToken
        }
      })

      if (!customerResponse.ok) {
        throw new Error(`Erro ao consultar cliente: ${customerResponse.status}`)
      }

      const customerData = await customerResponse.json()
      console.log('Dados do cliente:', customerData)

      return new Response(
        JSON.stringify(customerData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: customerResponse.status
        }
      )
    }

    // Se não tiver customerId, consulta cobranças por data
    if (!dueDate) {
      return new Response(
        JSON.stringify({ error: 'Data de vencimento não fornecida' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Consultando cobranças para a data ${dueDate}`)
    const paymentsUrl = `${apiBaseUrl}/payments?dueDate[ge]=${dueDate}&dueDate[le]=${dueDate}`
    
    const paymentsResponse = await fetch(paymentsUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'access_token': accessToken
      }
    })

    if (!paymentsResponse.ok) {
      throw new Error(`Erro ao consultar cobranças: ${paymentsResponse.status}`)
    }

    const paymentsData = await paymentsResponse.json()
    console.log('Dados das cobranças:', paymentsData)

    return new Response(
      JSON.stringify(paymentsData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: paymentsResponse.status
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
