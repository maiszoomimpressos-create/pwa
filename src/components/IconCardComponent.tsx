import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { IconCard } from "@/hooks/useIconCards";
import * as LucideIcons from "lucide-react";
import { Share2, Trash2, Pencil, Users, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ShareIconCardDialog from "./ShareIconCardDialog";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import EditIconCardSheet from "./EditIconCardSheet";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/integrations/supabase/auth";

interface IconCardComponentProps {
  card: IconCard;
  onCardAction?: () => void; // Para forçar o refetch após uma ação (e.g., exclusão, compartilhamento)
}

// Mapeamento de nomes de string para componentes Lucide
const IconMap: { [key: string]: React.ElementType } = LucideIcons;

const IconCardContent: React.FC<{ card: IconCard }> = ({ card }) => {
  const IconComponent = IconMap[card.icon_name];

  if (!IconComponent) {
    return (
      <div className="flex flex-col items-center justify-center p-4 h-full w-full bg-destructive/10">
        <p className="text-sm text-destructive">Ícone não encontrado</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <IconComponent size={40} style={{ color: card.color }} />
      <span className="text-sm mt-1 font-medium text-center text-foreground px-1 truncate w-full">
        {card.name || card.icon_name}
      </span>
    </div>
  );
};

const IconCardComponent: React.FC<IconCardComponentProps> = ({ card, onCardAction = () => {} }) => {
  const { user } = useAuth(); // Obtém o usuário logado
  const isOwner = user?.id === card.user_id;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    let error: { message: string } | null = null;
    let successMessage = "";

    if (isOwner) {
      // Excluir o card original (RLS garante que apenas o proprietário pode fazer isso)
      const { error: deleteError } = await supabase.from("icon_cards").delete().eq("id", card.id);
      error = deleteError;
      successMessage = `Item '${card.name || card.icon_name}' excluído com sucesso.`;
    } else {
      // Remover o registro de compartilhamento (RLS garante que apenas o destinatário pode fazer isso)
      const { error: removeError } = await supabase
        .from("icon_card_shares")
        .delete()
        .eq("card_id", card.id)
        .eq("shared_with_user_id", user?.id); // Garantia extra, mas o RLS já faz isso

      error = removeError;
      successMessage = `Compartilhamento do item '${card.name || card.icon_name}' removido com sucesso.`;
    }

    if (error) {
      console.error("Erro na ação do card:", error);
      showError("Erro ao realizar a ação: " + error.message);
    } else {
      showSuccess(successMessage);
      onCardAction();
    }
    setIsDeleting(false);
  };
  
  // Aumentando o tamanho do card para acomodar as ações
  const cardClasses = "relative flex flex-col justify-between p-2 h-36 w-36 transition-shadow hover:shadow-lg group";

  const CardInner = (
    <Card className={cardClasses}>
      {/* Badge para cards compartilhados */}
      {!isOwner && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute top-1 left-1 p-1 rounded-full bg-secondary/80 text-secondary-foreground">
              <Users className="h-3 w-3" />
            </div>
          </TooltipTrigger>
          <TooltipContent>Compartilhado com você</TooltipContent>
        </Tooltip>
      )}

      {/* Conteúdo Principal do Ícone */}
      <CardContent className="p-0 flex-grow flex items-center justify-center">
        <IconCardContent card={card} />
      </CardContent>

      {/* Ações (Visíveis no hover ou em telas pequenas) */}
      <div className="flex justify-center space-x-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
        
        {/* Ações do Proprietário: Edição e Compartilhamento */}
        {isOwner && (
          <>
            <EditIconCardSheet card={card} onIconUpdated={onCardAction}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar</TooltipContent>
              </Tooltip>
            </EditIconCardSheet>

            <ShareIconCardDialog card={card} onShared={onCardAction}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Compartilhar</TooltipContent>
              </Tooltip>
            </ShareIconCardDialog>
          </>
        )}

        {/* Ação de Exclusão/Remoção (Diferente para Proprietário vs. Destinatário) */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10">
                  {isOwner ? <Trash2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isOwner ? "Excluir Card" : "Remover Compartilhamento"}</TooltipContent>
            </Tooltip>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isOwner ? "Tem certeza que deseja excluir este card?" : "Tem certeza que deseja remover este compartilhamento?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isOwner 
                  ? `Esta ação excluirá permanentemente o card "${card.name || card.icon_name}" para todos.`
                  : `Esta ação apenas removerá o card "${card.name || card.icon_name}" do seu Dashboard. O card original não será afetado.`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                {isDeleting ? "Processando..." : (isOwner ? "Excluir Permanentemente" : "Remover")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );

  return (
    <div className="relative">
      {card.link ? (
        <a href={card.link} target="_blank" rel="noopener noreferrer" className="block">
          {CardInner}
        </a>
      ) : (
        CardInner
      )}
    </div>
  );
};

export default IconCardComponent;