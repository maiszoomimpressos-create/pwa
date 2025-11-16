import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { IconCard } from "@/hooks/useIconCards";
import * as LucideIcons from "lucide-react";

interface IconCardComponentProps {
  card: IconCard;
}

// Mapeamento de nomes de string para componentes Lucide
const IconMap: { [key: string]: React.ElementType } = LucideIcons;

const IconCardComponent: React.FC<IconCardComponentProps> = ({ card }) => {
  const IconComponent = IconMap[card.icon_name];

  if (!IconComponent) {
    return (
      <Card className="flex flex-col items-center justify-center p-4 h-32 w-32 bg-destructive/10">
        <p className="text-sm text-destructive">Ícone não encontrado</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col items-center justify-center p-4 h-32 w-32 transition-shadow hover:shadow-lg cursor-pointer">
      <CardContent className="flex flex-col items-center justify-center p-0 pt-4">
        <IconComponent size={48} style={{ color: card.color }} />
        <span className="text-sm mt-2 font-medium text-center text-foreground">
          {card.icon_name}
        </span>
      </CardContent>
    </Card>
  );
};

export default IconCardComponent;