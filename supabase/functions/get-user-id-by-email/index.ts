import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Edge Function started.");
    
    // 1. Verificar autenticação do usuário que está fazendo a requisição
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Unauthorized: Missing Authorization header.");
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }
    
    // 2. Inicializar o cliente Supabase com a Service Role Key (para acesso privilegiado)
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 3. Obter o email do corpo da requisição
    const { email } = await req.json();
    console.log("Received email:", email);
    
    if (!email) {
      console.error("Bad Request: Email is required.");
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400, headers: corsHeaders });
    }

    // 4. Buscar o usuário na tabela auth.users (acessível apenas com Service Role Key)
    const filterQuery = `email eq '${email}'`;
    console.log("Searching users with filter:", filterQuery);
    
    const { data: users, error: userError } = await supabaseServiceRole.auth.admin.listUsers({
      filter: filterQuery,
    });

    if (userError) {
      console.error("Error listing users:", userError);
      return new Response(JSON.stringify({ error: 'Database error' }), { status: 500, headers: corsHeaders });
    }

    if (!users || users.users.length === 0) {
      console.log("User not found for email:", email);
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: corsHeaders });
    }

    const targetUserId = users.users[0].id;
    console.log("Found user ID:", targetUserId);

    return new Response(JSON.stringify({ user_id: targetUserId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Edge Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});