import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  updated_at: string | null;
}

const fetchProfile = async (userId: string): Promise<Profile> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const updateProfile = async (profileData: Partial<Profile>) => {
  const { data, error } = await supabase
    .from("profiles")
    .update(profileData)
    .eq("id", profileData.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const useProfile = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const profileQuery = useQuery<Profile, Error>({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  });

  const profileMutation = useMutation<Profile, Error, Partial<Profile>>({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isUpdating: profileMutation.isPending,
    updateProfile: profileMutation.mutate,
  };
};