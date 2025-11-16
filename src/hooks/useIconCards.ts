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
  
  // Novo campo para o perfil do proprietário (usado para cards compartilhados)
  owner_profile?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

// A função de busca agora confia no RLS para retornar cards próprios e compartilhados.
const fetchIconCards = async (): Promise<IconCard[]> => {
  // Buscamos os cards e fazemos um JOIN com a tabela 'profiles'
  // Nota: A RLS na tabela 'profiles' permite que usuários autenticados vejam todos os perfis.
  const { data, error } = await supabase
    .from("icon_cards")
    .select(`
      *,
      owner_profile:profiles (first_name, last_name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  
  // Mapeamos os dados para garantir que o owner_profile seja associado corretamente
  return data.map(card => ({
    ...card,
    owner_profile: card.owner_profile ? card.owner_profile : null,
  })) as IconCard[] || [];
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