import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Loader2, Trash2, CheckCircle, Share2 } from "lucide-react";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { showError, showSuccess } from "@/utils/toast";

const NotificationItem: React.FC<{ notification: Notification, onDelete: (id: string) => void, onMarkRead: (id: string) => void }> = ({ notification, onDelete, onMarkRead }) => {
  const { type, content, read, created_at, id, sharer_profile } = notification;
  
  const timeAgo = formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: ptBR });
  
  let icon = <Bell className="h-5 w-5 text-primary" />;
  let title = "Nova Notificação";
  let description = "Detalhes da atividade.";
  let actionLink = null;
  
  const sharerName = sharer_profile?.first_name || "Um usuário";
  
  switch (type) {
    case 'card_shared':
      icon = <Share2 className="h-5 w-5 text-green-600" />;
      title = "Card Compartilhado";
      description = `${sharerName} compartilhou o card "${content.card_name}" com você.`;
      actionLink = `/dashboard`; // Redireciona para o dashboard onde o card aparecerá
      break;
    default:
      // Fallback
  }
  
  const handleDelete = () => {
    onDelete(id);
  };
  
  const handleMarkRead = () => {
    if (!read) {
      onMarkRead(id);
    }
  };

  return (
    <div 
      className={cn(
        "flex items-start p-4 border-b last:border-b-0 transition-colors",
        !read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"
      )}
    >
      <div className="flex-shrink-0 mr-4 mt-1">
        {icon}
      </div>
      
      <div className="flex-grow space-y-1">
        <div className="flex justify-between items-center">
          <h3 className={cn("font-semibold", !read ? "text-primary" : "text-foreground")}>{title}</h3>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
        
        <div className="pt-2 space-x-2">
          {actionLink && (
            <Link to={actionLink} onClick={handleMarkRead}>
              <Button variant="link" size="sm" className="h-auto p-0">
                Ver Item
              </Button>
            </Link>
          )}
          
          {!read && (
            <Button variant="ghost" size="sm" onClick={handleMarkRead} className="h-auto p-0 text-xs text-green-600 hover:text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" /> Marcar como lida
            </Button>
          )}
        </div>
      </div>
      
      <Button variant="ghost" size="icon" onClick={handleDelete} className="flex-shrink-0 ml-4 h-8 w-8 text-muted-foreground hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

const NotificationsPage: React.FC = () => {
  const { notifications, isLoading, deleteNotification, markAsRead, refetchNotifications } = useNotifications();
  
  const handleDelete = (id: string) => {
    deleteNotification(id, {
      onSuccess: () => showSuccess("Notificação excluída."),
      onError: (error) => showError("Erro ao excluir notificação: " + error.message),
    });
  };
  
  const handleMarkRead = (id: string) => {
    markAsRead(id, {
      onSuccess: () => {}, // Silencioso
      onError: (error) => showError("Erro ao marcar como lida: " + error.message),
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold flex items-center">
        <Bell className="mr-3 h-7 w-7" /> Central de Notificações
      </h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Suas Notificações</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                  onDelete={handleDelete}
                  onMarkRead={handleMarkRead}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-10 text-muted-foreground">
              <p>Nenhuma notificação recente.</p>
              <p className="text-sm mt-2">Aqui você verá alertas sobre compartilhamentos e atividades importantes.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Botão de Recarregar para debug/teste */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => refetchNotifications()}>
          Recarregar Notificações
        </Button>
      </div>
    </div>
  );
};

export default NotificationsPage;