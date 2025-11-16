import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { IconCard } from "@/hooks/useIconCards";
import * as LucideIcons from "lucide-react";

interface IconCardComponentProps {
  card: IconCard;
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

const IconCardComponent: React.FC<IconCardComponentProps> = ({ card }) => {
  const cardClasses = "flex flex-col items-center justify-center p-4 h-32 w-32 transition-shadow hover:shadow-lg cursor-pointer";

  if (card.link) {
    return (
      <a href={card.link} target="_blank" rel="noopener noreferrer" className="block">
        <Card className={cardClasses}>
          <CardContent className="p-0 pt-4 h-full w-full">
            <IconCardContent card={card} />
          </CardContent>
        </Card>
      </a>
    );
  }

  return (
    <Card className={cardClasses}>
      <CardContent className="p-0 pt-4 h-full w-full">
        <IconCardContent card={card} />
      </CardContent>
    </Card>
  );
};

export default IconCardComponent;