import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";

export interface CardShare {
  card_id: string;
  shared_with_user_id: string;
  created_at: string;
  shared_with_email?: string; // Adicionado para exibição na UI
}

const EDGE_FUNCTION_URL_ID_BY_EMAIL = "https://rqwshksgnnzcdfiensjc.supabase.co/functions/v1/get-user-id-by-email";

// 1. Buscar compartilhamentos existentes para um card
const fetchCardShares = async (cardId: string): Promise<CardShare[]> => {
  const { data, error } = await supabase
    .from("icon_card_shares")
    .select("card_id, shared_with_user_id, created_at")
    .eq("card_id", cardId);

  if (error) {
    throw new Error(error.message);
  }
  return data as CardShare[];
};

// 2. Compartilhar um card com um email (requer Edge Function para mapear email -> ID)
interface ShareCardData {
  cardId: string;
  email: string;
}

const shareCard = async ({ cardId, email }: ShareCardData) => {
  const token = (await supabase.auth.getSession()).data.session?.access_token;

  // 1. Buscar ID do usuário pelo email usando Edge Function
  const response = await fetch(EDGE_FUNCTION_URL_ID_BY_EMAIL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error("Falha ao buscar ID do usuário para compartilhamento.");
  }

  const { user_id: sharedWithUserId } = await response.json();

  if (!sharedWithUserId) {
    throw new Error("Usuário com este email não encontrado.");
  }

  // 2. Inserir o compartilhamento na tabela
  const { error } = await supabase
    .from("icon_card_shares")
    .insert({
      card_id: cardId,
      shared_with_user_id: sharedWithUserId,
    });

  if (error) {
    // Tratar erro de duplicidade (já compartilhado)
    if (error.code === '23505') { // unique_violation
        throw new Error("Este card já foi compartilhado com este usuário.");
    }
    throw new Error(error.message);
  }
};

// 3. Remover compartilhamento
interface UnshareCardData {
  cardId: string;
  sharedWithUserId: string;
}

const unshareCard = async ({ cardId, sharedWithUserId }: UnshareCardData) => {
  const { error } = await supabase
    .from("icon_card_shares")
    .delete()
    .eq("card_id", cardId)
    .eq("shared_with_user_id", sharedWithUserId);

  if (error) {
    throw new Error(error.message);
  }
};


export const useCardShares = (cardId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["cardShares", cardId];

  const sharesQuery = useQuery<CardShare[], Error>({
    queryKey: queryKey,
    queryFn: () => fetchCardShares(cardId),
    enabled: !!user && !!cardId,
  });

  const shareMutation = useMutation({
    mutationFn: shareCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
      queryClient.invalidateQueries({ queryKey: ["iconCards", user?.id] }); // Refetch cards list in case RLS changes
    },
  });

  const unshareMutation = useMutation({
    mutationFn: unshareCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
      queryClient.invalidateQueries({ queryKey: ["iconCards", user?.id] }); // Refetch cards list
    },
  });

  return {
    shares: sharesQuery.data || [],
    isLoadingShares: sharesQuery.isLoading,
    isSharing: shareMutation.isPending,
    isUnsharing: unshareMutation.isPending,
    shareCard: shareMutation.mutate,
    unshareCard: unshareMutation.mutate,
    refetchShares: sharesQuery.refetch,
  };
};