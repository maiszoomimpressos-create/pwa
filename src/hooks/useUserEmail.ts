import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";

// URL da Edge Function (usando o ID do projeto Supabase)
const EDGE_FUNCTION_URL = "https://rqwshksgnnzcdfiensjc.supabase.co/functions/v1/get-user-email-by-id";

const fetchUserEmail = async (userId: string): Promise<string> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  if (!token) {
    throw new Error("Sessão não encontrada.");
  }

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao buscar email do usuário.");
  }

  const { email } = await response.json();
  return email;
};

export const useUserEmail = (userId: string | undefined) => {
  const { user } = useAuth();
  
  return useQuery<string, Error>({
    queryKey: ["userEmail", userId],
    queryFn: () => fetchUserEmail(userId!),
    enabled: !!userId && !!user, // Só executa se o ID e o usuário logado existirem
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });
};