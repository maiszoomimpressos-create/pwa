import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CardShare {
  id: string;
  card_id: string;
  shared_with_user_id: string;
  shared_by_user_id: string;
  created_at: string;
  // Adicionamos o perfil do destinatário para exibição
  profiles: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

const fetchCardShares = async (cardId: string): Promise<CardShare[]> => {
  // Buscamos os compartilhamentos e fazemos um JOIN com a tabela 'profiles'
  // A relação é feita automaticamente via shared_with_user_id -> profiles.id
  const { data, error } = await supabase
    .from("icon_card_shares")
    .select(`
      id,
      card_id,
      shared_with_user_id,
      shared_by_user_id,
      created_at,
      profiles (first_name, last_name, avatar_url)
    `)
    .eq("card_id", cardId)
    .order("created_at", { ascending: false });

  if (error) {
    // Logamos o erro para ajudar na depuração
    console.error("Supabase fetchCardShares error:", error);
    throw new Error(error.message);
  }
  return data as CardShare[] || [];
};

export const useCardShares = (cardId: string) => {
  return useQuery<CardShare[], Error>({
    queryKey: ["cardShares", cardId],
    queryFn: () => fetchCardShares(cardId),
    enabled: !!cardId,
  });
};