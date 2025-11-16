import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { IconCard } from "@/hooks/useIconCards";
import * as LucideIcons from "lucide-react";
import { Share2, Trash2, Pencil } from "lucide-react";
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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const { error } = await supabase.from("icon_cards").delete().eq("id", card.id);

    if (error) {
      console.error("Erro ao excluir card:", error);
      showError("Erro ao excluir o item: " + error.message);
    } else {
      showSuccess(`Item '${card.name || card.icon_name}' excluído com sucesso.`);
      onCardAction();
    }
    setIsDeleting(false);
  };
  
  // Aumentando o tamanho do card para acomodar as ações
  const cardClasses = "relative flex flex-col justify-between p-2 h-36 w-36 transition-shadow hover:shadow-lg group";

  const CardInner = (
    <Card className={cardClasses}>
      {/* Conteúdo Principal do Ícone */}
      <CardContent className="p-0 flex-grow flex items-center justify-center">
        <IconCardContent card={card} />
      </CardContent>

      {/* Ações (Visíveis no hover ou em telas pequenas) */}
      <div className="flex justify-center space-x-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
        
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

        {/* Botão de Compartilhamento */}
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

        {/* Botão de Exclusão */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Excluir</TooltipContent>
            </Tooltip>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o card "{card.name || card.icon_name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                {isDeleting ? "Excluindo..." : "Excluir"}
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