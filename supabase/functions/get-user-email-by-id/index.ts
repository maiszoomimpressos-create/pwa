import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { user_id } = await req.json()
    
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: corsHeaders,
      })
    }

    // Initialize Supabase client with Service Role Key for accessing auth schema
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    // Query the auth.users table (requires Service Role Key)
    const { data, error } = await supabase.from('users').select('email').eq('id', user_id).single()

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase query error:', error)
      return new Response(JSON.stringify({ error: 'Database query failed' }), {
        status: 500,
        headers: corsHeaders,
      })
    }

    if (!data) {
      return new Response(JSON.stringify({ email: null }), {
        status: 200,
        headers: corsHeaders,
      })
    }

    return new Response(JSON.stringify({ email: data.email }), {
      status: 200,
      headers: corsHeaders,
    })

  } catch (error) {
    console.error('General error:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})