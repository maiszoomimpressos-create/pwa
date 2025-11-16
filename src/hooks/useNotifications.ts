import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";

export interface NotificationContent {
  card_id: string;
  card_name: string;
  sharer_id: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'card_shared';
  content: NotificationContent;
  read: boolean;
  created_at: string;
  
  // Dados do remetente (sharer) obtidos via busca secundária
  sharer_profile: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  const { data: notificationsData, error: fetchError } = await supabase
    .from("notifications")
    .select(`
      id, user_id, type, content, read, created_at
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
    
  if (fetchError) {
    throw new Error(fetchError.message);
  }
  
  const notificationsList = notificationsData as unknown as Omit<Notification, 'sharer_profile'>[];
  
  // Coleta IDs dos remetentes para buscar seus perfis em lote
  const sharerIds = Array.from(new Set(notificationsList.map(n => (n.content as NotificationContent).sharer_id)));
  
  let sharerProfiles: Record<string, { first_name: string | null, last_name: string | null }> = {};
  
  if (sharerIds.length > 0) {
    // Busca perfis dos remetentes (possível devido à RLS relaxada)
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', sharerIds);
      
    if (profilesError) {
      console.error("Error fetching sharer profiles:", profilesError);
    } else {
      profilesData.forEach(p => {
        sharerProfiles[p.id] = { first_name: p.first_name, last_name: p.last_name };
      });
    }
  }
  
  // Combina notificações com dados do perfil do remetente
  return notificationsList.map(n => ({
    ...n,
    sharer_profile: sharerProfiles[(n.content as NotificationContent).sharer_id] || null,
    content: n.content as NotificationContent,
  })) as Notification[];
};

const markAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId);

  if (error) {
    throw new Error(error.message);
  }
};

const deleteNotification = async (notificationId: string) => {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId);

  if (error) {
    throw new Error(error.message);
  }
};

const fetchUnreadCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: 'exact', head: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) {
    throw new Error(error.message);
  }
  return count || 0;
};


export const useNotifications = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery<Notification[], Error>({
    queryKey: ["notifications", userId],
    queryFn: () => fetchNotifications(userId!),
    enabled: !!userId,
  });
  
  const unreadCountQuery = useQuery<number, Error>({
    queryKey: ["notificationsUnreadCount", userId],
    queryFn: () => fetchUnreadCount(userId!),
    enabled: !!userId,
    refetchInterval: 30000, // Verifica novas notificações a cada 30 segundos
  });

  const markAsReadMutation = useMutation<void, Error, string>({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
      queryClient.invalidateQueries({ queryKey: ["notificationsUnreadCount", userId] });
    },
  });
  
  const deleteNotificationMutation = useMutation<void, Error, string>({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
      queryClient.invalidateQueries({ queryKey: ["notificationsUnreadCount", userId] });
    },
  });

  return {
    notifications: notificationsQuery.data || [],
    isLoading: notificationsQuery.isLoading,
    unreadCount: unreadCountQuery.data || 0,
    markAsRead: markAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    refetchNotifications: notificationsQuery.refetch,
  };
};