import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";

export interface IconCard {
  id: string;
  user_id: string;
  icon_name: string | null;
  icon_url: string | null;
  color: string;
  name: string;
  link: string | null;
  created_at: string;
  is_owner: boolean; // Adicionado para diferenciar cards próprios de compartilhados
}

// Função para buscar todos os cards (próprios e compartilhados)
const fetchIconCards = async (userId: string): Promise<IconCard[]> => {
  const { data, error } = await supabase
    .from("icon_cards")
    .select("*"); // RLS garante que apenas cards próprios ou compartilhados sejam retornados

  if (error) {
    throw new Error(error.message);
  }

  // Adiciona a flag is_owner
  return data.map(card => ({
    ...card,
    is_owner: card.user_id === userId,
  })) as IconCard[];
};

// Função para criar um novo card
const createIconCard = async (cardData: Omit<IconCard, 'id' | 'user_id' | 'created_at' | 'is_owner'>) => {
  const { data, error } = await supabase
    .from("icon_cards")
    .insert(cardData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// Função para deletar um card
const deleteIconCard = async (cardId: string) => {
  const { error } = await supabase
    .from("icon_cards")
    .delete()
    .eq("id", cardId);

  if (error) {
    throw new Error(error.message);
  }
};

// Função para atualizar um card
const updateIconCard = async (cardData: Partial<IconCard> & { id: string }) => {
  const { data, error } = await supabase
    .from("icon_cards")
    .update({
      icon_name: cardData.icon_name,
      icon_url: cardData.icon_url,
      color: cardData.color,
      name: cardData.name,
      link: cardData.link,
    })
    .eq("id", cardData.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};


export const useIconCards = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const queryKey = ["iconCards", userId];

  const cardsQuery = useQuery<IconCard[], Error>({
    queryKey: queryKey,
    queryFn: () => fetchIconCards(userId!),
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: createIconCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteIconCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: updateIconCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
  });

  return {
    cards: cardsQuery.data || [],
    isLoading: cardsQuery.isLoading,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUpdating: updateMutation.isPending,
    createCard: createMutation.mutate,
    deleteCard: deleteMutation.mutate,
    updateCard: updateMutation.mutate,
    refetchCards: cardsQuery.refetch,
  };
};