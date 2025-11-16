import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Trash2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { IconCard } from "@/hooks/useIconCards";
import { useCardShares, CardShare } from "@/hooks/useCardShares";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ManageSharesDialogProps {
  card: IconCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSharesUpdated: () => void;
}

const ManageSharesDialog: React.FC<ManageSharesDialogProps> = ({ card, open, onOpenChange, onSharesUpdated }) => {
  const { data: shares, isLoading, refetch } = useCardShares(card.id);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);

  // Refetch quando o diálogo abre
  React.useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  const handleRevokeShare = async (share: CardShare) => {
    setIsRevoking(share.id);

    // RLS garante que apenas o usuário que compartilhou (proprietário do card) pode deletar este registro.
    const { error } = await supabase
      .from("icon_card_shares")
      .delete()
      .eq("id", share.id);

    if (error) {
      console.error("Erro ao revogar compartilhamento:", error);
      showError("Erro ao revogar o acesso: " + error.message);
    } else {
      showSuccess("Acesso revogado com sucesso.");
      refetch();
      onSharesUpdated();
    }
    setIsRevoking(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Compartilhamentos</DialogTitle>
          <DialogDescription>
            Lista de usuários com acesso ao card: <strong>{card.name || card.icon_name}</strong>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : shares && shares.length > 0 ? (
            <ScrollArea className="h-60 w-full rounded-md border">
              <div className="p-4">
                {shares.map((share) => {
                  const recipientProfile = share.profiles;
                  
                  let recipientName = "Usuário Desconhecido";
                  let recipientInitials = "??";

                  if (recipientProfile) {
                    const firstName = recipientProfile.first_name;
                    const lastName = recipientProfile.last_name;
                    
                    if (firstName && lastName) {
                      recipientName = `${firstName} ${lastName}`;
                      recipientInitials = `${firstName[0]}${lastName[0]}`.toUpperCase();
                    } else if (firstName) {
                      recipientName = firstName;
                      recipientInitials = firstName.substring(0, 2).toUpperCase();
                    }
                  }
                  
                  // Nota: Não podemos exibir o email aqui diretamente via RLS/JOIN, 
                  // mas o nome do perfil é o melhor que podemos fazer.

                  return (
                    <div key={share.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{recipientInitials}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {recipientName}
                        </span>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevokeShare(share)}
                        disabled={isRevoking === share.id}
                      >
                        {isRevoking === share.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center p-6 border border-dashed rounded-lg text-muted-foreground">
              <Users className="h-6 w-6 mx-auto mb-2" />
              Nenhum compartilhamento ativo para este card.
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageSharesDialog;