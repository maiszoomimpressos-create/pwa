import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { showError, showSuccess } from "@/utils/toast";

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone: string | null;
}

const fetchProfile = async (userId: string): Promise<Profile> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url, phone")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as Profile;
};

const updateProfile = async (profileData: Partial<Omit<Profile, 'id' | 'avatar_url'>>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  // O RLS garante que o usuário só pode atualizar seu próprio perfil.
  const { error } = await supabase
    .from("profiles")
    .update(profileData)
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }
};

export const useProfile = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const profileQuery = useQuery<Profile, Error>({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId, // Só executa a query se o usuário estiver logado
  });

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      showSuccess("Perfil atualizado com sucesso!");
    },
    onError: (error) => {
      showError("Erro ao atualizar perfil: " + error.message);
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isUpdating: profileMutation.isPending,
    updateProfile: profileMutation.mutate,
  };
};