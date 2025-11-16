import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";

export interface IconCard {
  id: string;
  user_id: string;
  icon_name: string;
  color: string;
  created_at: string;
}

const fetchIconCards = async (userId: string): Promise<IconCard[]> => {
  const { data, error } = await supabase
    .from("icon_cards")
    .select("*")
    .eq("user_id", userId)
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
    queryFn: () => fetchIconCards(userId!),
    enabled: !!userId, // Só executa a query se o usuário estiver logado
  });
};