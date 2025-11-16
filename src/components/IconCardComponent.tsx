import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { IconCard } from "@/hooks/useIconCards";
import * as LucideIcons from "lucide-react";
import { Share2, Trash2, Pencil, Users, XCircle, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ShareIconCardDialog from "./ShareIconCardDialog";
import ManageSharesDialog from "./ManageSharesDialog";
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
    <div className="flex flex-col items-center justify-center h-full w-full p-2">
      <IconComponent size={36} style={{ color: card.color }} />
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
  
  // Estados para controlar a abertura dos diálogos
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isManageSharesDialogOpen, setIsManageSharesDialogOpen] = useState(false);

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
        .eq("shared_with_user_id", user?.id);

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
  
  const cardClasses = "relative flex flex-col justify-between p-0 h-40 w-36 transition-shadow hover:shadow-lg";

  const CardContentArea = (
    <CardContent className="p-0 flex-grow flex items-center justify-center">
      <IconCardContent card={card} />
    </CardContent>
  );

  return (
    <>
      <Card className={cardClasses}>
        {/* Badge para cards compartilhados */}
        {!isOwner && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute top-1 left-1 p-1 rounded-full bg-secondary/80 text-secondary-foreground z-10">
                <Users className="h-3 w-3" />
              </div>
            </TooltipTrigger>
            <TooltipContent>Compartilhado com você</TooltipContent>
          </Tooltip>
        )}

        {/* Conteúdo Principal (Clicável se houver link) */}
        {card.link ? (
          <a href={card.link} target="_blank" rel="noopener noreferrer" className="block flex-grow">
            {CardContentArea}
          </a>
        ) : (
          <div className="flex-grow">
            {CardContentArea}
          </div>
        )}

        {/* Ações (Sempre Visíveis) */}
        <div className="flex justify-center space-x-1 p-1 border-t bg-muted/30">
          
          {/* Ações do Proprietário: Edição e Compartilhamento */}
          {isOwner && (
            <>
              {/* Botão de Edição */}
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

              {/* Menu de Gerenciamento de Compartilhamento */}
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Compartilhar / Gerenciar</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-56">
                  {/* Compartilhar */}
                  <DropdownMenuItem 
                    onSelect={(e) => {
                      e.preventDefault(); // Impede o fechamento do DropdownMenu
                      setIsShareDialogOpen(true);
                    }}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Compartilhar com...
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {/* Gerenciar */}
                  <DropdownMenuItem 
                    onSelect={(e) => {
                      e.preventDefault(); // Impede o fechamento do DropdownMenu
                      setIsManageSharesDialogOpen(true);
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Gerenciar Compartilhamentos
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
      
      {/* Diálogos Controlados (Renderizados fora do Card) */}
      {isOwner && (
        <>
          <ShareIconCardDialog 
            card={card} 
            open={isShareDialogOpen} 
            onOpenChange={setIsShareDialogOpen} 
            onShared={onCardAction} 
          />
          <ManageSharesDialog 
            card={card} 
            open={isManageSharesDialogOpen} 
            onOpenChange={setIsManageSharesDialogOpen} 
            onSharesUpdated={onCardAction} 
          />
        </>
      )}
    </>
  );
};

export default IconCardComponent;