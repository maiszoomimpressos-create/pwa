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
    // 1. Verificar autenticação do usuário que está fazendo a requisição (o sharer)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
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

    // 3. Obter dados do corpo da requisição
    const { card_id, card_name, shared_with_user_id, shared_by_user_id } = await req.json();
    
    if (!card_id || !shared_with_user_id || !shared_by_user_id || !card_name) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: corsHeaders });
    }

    // 4. Inserir a notificação usando o cliente Service Role (ignora RLS)
    const { error: insertError } = await supabaseServiceRole
      .from('notifications')
      .insert({
        user_id: shared_with_user_id,
        type: 'card_shared',
        content: {
          card_id: card_id,
          card_name: card_name,
          sharer_id: shared_by_user_id,
        },
      });

    if (insertError) {
      console.error("Error inserting notification:", insertError);
      return new Response(JSON.stringify({ error: 'Failed to insert notification' }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ message: 'Notification created successfully' }), {
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