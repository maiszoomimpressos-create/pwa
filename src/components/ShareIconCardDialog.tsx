import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { IconCard } from "@/hooks/useIconCards";

interface ShareIconCardDialogProps {
  card: IconCard;
  children: React.ReactNode;
  onShared: () => void;
}

// URL da Edge Function (usando o ID do projeto Supabase)
const EDGE_FUNCTION_URL = "https://rqwshksgnnzcdfiensjc.supabase.co/functions/v1/get-user-id-by-email";

const ShareIconCardDialog: React.FC<ShareIconCardDialogProps> = ({ card, children, onShared }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser) {
      showError("Você precisa estar logado para compartilhar.");
      setIsLoading(false);
      return;
    }
    
    const targetEmail = email.trim().toLowerCase();

    if (targetEmail === currentUser.email?.toLowerCase()) {
      showError("Você não pode compartilhar um item consigo mesmo.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Chamar a Edge Function para buscar o ID do usuário pelo email
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      if (!token) {
        throw new Error("Sessão não encontrada.");
      }

      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email: targetEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          throw new Error("Usuário com este email não encontrado.");
        }
        throw new Error(errorData.error || "Erro ao buscar usuário.");
      }

      const { user_id: sharedWithUserId } = await response.json();

      // 2. Inserir o registro de compartilhamento no banco de dados
      const { error: insertError } = await supabase.from("icon_card_shares").insert({
        card_id: card.id,
        shared_with_user_id: sharedWithUserId,
        shared_by_user_id: currentUser.id,
      });

      if (insertError) {
        if (insertError.code === '23505') { // Código de violação de UNIQUE constraint
          showError("Este card já foi compartilhado com este usuário.");
        } else {
          throw new Error("Erro ao registrar o compartilhamento: " + insertError.message);
        }
      } else {
        showSuccess(`Card compartilhado com sucesso com ${targetEmail}!`);
        setEmail("");
        setOpen(false);
        onShared();
      }

    } catch (error) {
      console.error("Erro de compartilhamento:", error);
      showError(error instanceof Error ? error.message : "Ocorreu um erro desconhecido ao compartilhar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Compartilhar Card: {card.name || card.icon_name}</DialogTitle>
          <DialogDescription>
            Insira o email do usuário com quem você deseja compartilhar este item.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleShare} className="grid gap-4 py-4">
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
          <Button type="submit" disabled={isLoading || !email.trim()}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" /> Compartilhar
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShareIconCardDialog;