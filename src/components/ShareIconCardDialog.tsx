import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Send, Users } from "lucide-react";
import { IconCard } from "@/hooks/useIconCards";
import { useCardShares } from "@/hooks/useCardShares";
import { showError, showSuccess } from "@/utils/toast";
import ManageSharesDialog from "./ManageSharesDialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface ShareIconCardDialogProps {
  card: IconCard;
  children: React.ReactNode;
  onShareAction: () => void;
}

const ShareIconCardDialog: React.FC<ShareIconCardDialogProps> = ({ card, children, onShareAction }) => {
  const { shareCard, isSharing } = useCardShares(card.id);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState<'share' | 'manage'>('share');
  const [isManageOpen, setIsManageOpen] = useState(false);

  const handleShareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showError("O email é obrigatório.");
      return;
    }

    shareCard({ cardId: card.id, email: email.trim() }, {
      onSuccess: () => {
        showSuccess(`Card compartilhado com ${email.trim()}!`);
        setEmail("");
        onShareAction();
      },
      onError: (error) => {
        showError("Falha ao compartilhar: " + error.message);
      }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
        setEmail("");
        setTab('share');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Compartilhar Card: {card.name}</DialogTitle>
            <DialogDescription>
              Compartilhe este item com outro usuário por email.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={tab} onValueChange={(value) => setTab(value as 'share' | 'manage')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="share">
                <Send className="h-4 w-4 mr-2" /> Compartilhar
              </TabsTrigger>
              <TabsTrigger value="manage" onClick={() => setIsManageOpen(true)}>
                <Users className="h-4 w-4 mr-2" /> Gerenciar
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="share" className="mt-4">
              <form onSubmit={handleShareSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email do Destinatário</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@exemplo.com"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSharing}>
                  {isSharing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Enviar Compartilhamento
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="manage" className="mt-4">
                {/* O conteúdo de gerenciamento é movido para um diálogo separado para melhor UX */}
                <Button 
                    type="button" 
                    className="w-full" 
                    onClick={() => setIsManageOpen(true)}
                >
                    Abrir Gerenciamento de Compartilhamentos
                </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de Gerenciamento de Compartilhamentos */}
      <ManageSharesDialog 
        card={card} 
        open={isManageOpen} 
        onOpenChange={setIsManageOpen} 
      />
    </>
  );
};

export default ShareIconCardDialog;