import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconCard, useIconCards } from "@/hooks/useIconCards";
import * as LucideIcons from "lucide-react";
import { Pencil, Share2, Trash2, Loader2, ExternalLink, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { showError, showSuccess } from "@/utils/toast";
import EditIconCardSheet from "./EditIconCardSheet";
import ShareIconCardDialog from "./ShareIconCardDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface IconCardComponentProps {
  card: IconCard;
  onCardAction: () => void;
}

const IconCardComponent: React.FC<IconCardComponentProps> = ({ card, onCardAction }) => {
  const { deleteCard, isDeleting } = useIconCards();
  
  const IconComponent = card.icon_name ? (LucideIcons as any)[card.icon_name] : null;
  const iconColor = card.icon_name ? card.color : undefined;

  const handleDelete = () => {
    deleteCard(card.id, {
      onSuccess: () => {
        showSuccess(`Item '${card.name}' excluído com sucesso.`);
        onCardAction();
      },
      onError: (error) => {
        showError("Erro ao excluir item: " + error.message);
      },
    });
  };

  const handleCardClick = () => {
    if (card.link) {
      window.open(card.link, '_blank');
    }
  };

  return (
    <Card className="flex flex-col justify-between h-full transition-shadow hover:shadow-lg">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle 
          className="text-lg font-semibold cursor-pointer hover:underline"
          onClick={handleCardClick}
        >
          {card.name}
        </CardTitle>
        {card.link && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCardClick}>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Abrir Link</TooltipContent>
          </Tooltip>
        )}
      </CardHeader>
      
      <CardContent className="flex flex-col items-center justify-center p-4 pt-0 flex-grow">
        <div 
          className="w-20 h-20 flex items-center justify-center rounded-xl mb-4"
          style={{ backgroundColor: iconColor ? `${iconColor}1A` : 'transparent' }} // Cor de fundo suave
        >
          {IconComponent ? (
            <IconComponent className="h-10 w-10" style={{ color: iconColor }} />
          ) : card.icon_url ? (
            <img src={card.icon_url} alt={card.name} className="h-10 w-10 object-contain" />
          ) : (
            <HelpCircle className="h-10 w-10 text-gray-400" />
          )}
        </div>
        
        {!card.is_owner && (
          <p className="text-xs text-muted-foreground mt-2">Compartilhado</p>
        )}
      </CardContent>

      <div className="flex justify-end p-4 pt-0 space-x-2 border-t">
        {card.is_owner && (
          <>
            {/* 1. Botão de Edição */}
            <EditIconCardSheet card={card} onIconUpdated={onCardAction}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar</TooltipContent>
              </Tooltip>
            </EditIconCardSheet>

            {/* 2. Botão de Compartilhamento */}
            <ShareIconCardDialog card={card} onShareAction={onCardAction}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Compartilhar</TooltipContent>
              </Tooltip>
            </ShareIconCardDialog>

            {/* 3. Botão de Excluir */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Excluir</TooltipContent>
                </Tooltip>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o item "{card.name}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Excluir"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </Card>
  );
};

export default IconCardComponent;