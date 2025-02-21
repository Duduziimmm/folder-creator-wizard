
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, asaas-environment',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const dueDate = url.searchParams.get('dueDate')
    const environment = req.headers.get('asaas-environment') || 'sandbox'

    const apiBaseUrl = environment === 'prod' 
      ? 'https://api.asaas.com/v3'
      : 'https://api-sandbox.asaas.com/v3'

    const asaasKey = req.headers.get('access_token')
    if (!asaasKey) {
      return new Response(
        JSON.stringify({ error: 'API key não fornecida' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const apiUrl = `${apiBaseUrl}/payments?dueDate[ge]=${dueDate}&dueDate[le]=${dueDate}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'access_token': asaasKey
      }
    })

    const data = await response.json()

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
