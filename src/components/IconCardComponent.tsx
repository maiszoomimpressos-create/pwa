import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { IconCard } from "@/hooks/useIconCards";
import * as LucideIcons from "lucide-react";
import { MoreVertical, Share2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ShareIconCardDialog from "./ShareIconCardDialog";

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
    <div className="flex flex-col items-center justify-center p-0 pt-4 h-full">
      <IconComponent size={48} style={{ color: card.color }} />
      <span className="text-sm mt-2 font-medium text-center text-foreground px-1 truncate w-full">
        {card.name || card.icon_name}
      </span>
    </div>
  );
};

const IconCardComponent: React.FC<IconCardComponentProps> = ({ card, onCardAction = () => {} }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const cardClasses = "relative flex flex-col items-center justify-center p-4 h-32 w-32 transition-shadow hover:shadow-lg cursor-pointer group";

  const CardWrapper = card.link ? (
    <a href={card.link} target="_blank" rel="noopener noreferrer" className="block">
      <Card className={cardClasses}>
        <CardContent className="p-0 pt-4 h-full w-full">
          <IconCardContent card={card} />
        </CardContent>
      </Card>
    </a>
  ) : (
    <Card className={cardClasses}>
      <CardContent className="p-0 pt-4 h-full w-full">
        <IconCardContent card={card} />
      </CardContent>
    </Card>
  );

  return (
    <div className="relative">
      {CardWrapper}
      
      {/* Dropdown Menu para Ações */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-full bg-background/80 hover:bg-background border">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <ShareIconCardDialog card={card} onShared={onCardAction}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Share2 className="mr-2 h-4 w-4" /> Compartilhar
              </DropdownMenuItem>
            </ShareIconCardDialog>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default IconCardComponent;