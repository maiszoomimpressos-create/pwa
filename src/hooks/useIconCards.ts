import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";

export interface IconCard {
  id: string;
  user_id: string; // ID do proprietário do card
  icon_name: string | null; // Pode ser nulo se icon_url for usado
  icon_url: string | null; // Caminho do arquivo no storage
  color: string;
  name: string | null;
  link: string | null;
  created_at: string;
}

// A função de busca agora confia no RLS para retornar cards próprios e compartilhados.
const fetchIconCards = async (): Promise<IconCard[]> => {
  const { data, error } = await supabase
    .from("icon_cards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

export const useIconCards = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery<IconCard[], Error>({
    queryKey: ["iconCards", userId],
    queryFn: () => fetchIconCards(),
    enabled: !!userId, // Só executa a query se o usuário estiver logado
  });
};