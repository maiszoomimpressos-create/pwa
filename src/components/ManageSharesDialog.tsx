import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconCard } from "@/hooks/useIconCards";
import { useCardShares } from "@/hooks/useCardShares";
import { Loader2, Trash2, User } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { useUserEmail } from "@/hooks/useUserEmail";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ManageSharesDialogProps {
  card: IconCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Componente auxiliar para exibir um compartilhamento
const ShareItem: React.FC<{ userId: string, cardId: string, onUnshare: (userId: string) => void }> = ({ userId, cardId, onUnshare }) => {
    const { data: email, isLoading: isLoadingEmail } = useUserEmail(userId);
    const { unshareCard, isUnsharing } = useCardShares(cardId);
    const [isRemoving, setIsRemoving] = useState(false);

    const handleUnshare = () => {
        setIsRemoving(true);
        unshareCard({ cardId, sharedWithUserId: userId }, {
            onSuccess: () => {
                showSuccess(`Compartilhamento com ${email || userId} removido.`);
                onUnshare(userId);
            },
            onError: (error) => {
                showError("Erro ao remover compartilhamento: " + error.message);
                setIsRemoving(false);
            }
        });
    };

    return (
        <div className="flex items-center justify-between p-3 border rounded-md">
            <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">
                    {isLoadingEmail ? "Carregando email..." : email || "Usuário Desconhecido"}
                </span>
            </div>
            <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleUnshare}
                disabled={isUnsharing || isRemoving}
            >
                {isUnsharing || isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
        </div>
    );
};


const ManageSharesDialog: React.FC<ManageSharesDialogProps> = ({ card, open, onOpenChange }) => {
  const { shares, isLoadingShares, refetchShares } = useCardShares(card.id);
  
  // Estado local para gerenciar a lista de compartilhamentos (para remoção otimista/visual)
  const [localShares, setLocalShares] = useState(shares);

  useEffect(() => {
    setLocalShares(shares);
  }, [shares]);

  const handleUnshareSuccess = (userId: string) => {
    // Remove o item localmente e refetch para garantir a consistência
    setLocalShares(prev => prev.filter(s => s.shared_with_user_id !== userId));
    refetchShares();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Compartilhamentos</DialogTitle>
          <DialogDescription>
            Usuários que têm acesso ao card: <span className="font-semibold">{card.name}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isLoadingShares ? (
            <div className="flex justify-center items-center h-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : localShares.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhum compartilhamento ativo.</p>
          ) : (
            <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-3">
                    {localShares.map((share) => (
                        <ShareItem 
                            key={share.shared_with_user_id}
                            userId={share.shared_with_user_id}
                            cardId={card.id}
                            onUnshare={handleUnshareSuccess}
                        />
                    ))}
                </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageSharesDialog;