import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const EDGE_FUNCTION_URL = "https://rqwshksgnnzcdfiensjc.supabase.co/functions/v1/get-user-email-by-id";

const fetchUserEmail = async (userId: string | undefined): Promise<string | null> => {
  if (!userId) return null;

  const token = (await supabase.auth.getSession()).data.session?.access_token;

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user email");
  }

  const data = await response.json();
  return data.email || null;
};

export const useUserEmail = (userId: string | undefined) => {
  return useQuery<string | null, Error>({
    queryKey: ["userEmail", userId],
    queryFn: () => fetchUserEmail(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};