import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Search, X } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";

// Mapeamento de nomes de string para componentes Lucide
const IconMap: { [key: string]: React.ElementType } = LucideIcons;

// Filtra apenas os ícones (componentes que começam com letra maiúscula e não são utilitários)
const allIconNames = Object.keys(IconMap).filter(
  (name) => name[0] === name[0].toUpperCase() && name !== "Icon"
);

interface IconGalleryProps {
  selectedIconName: string | null;
  onSelectIcon: (iconName: string) => void;
  color: string;
}

const IconGallery: React.FC<IconGalleryProps> = ({ selectedIconName, onSelectIcon, color }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredIcons = useMemo(() => {
    if (!searchTerm) return allIconNames;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return allIconNames.filter((name) =>
      name.toLowerCase().includes(lowerCaseSearch)
    );
  }, [searchTerm]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar ícone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground"
            onClick={() => setSearchTerm("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="h-64 overflow-y-auto pr-2">
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {filteredIcons.length > 0 ? (
            filteredIcons.map((iconName) => {
              const Icon = IconMap[iconName];
              const isSelected = selectedIconName === iconName;

              return (
                <Card
                  key={iconName}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary ring-2 ring-primary"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => onSelectIcon(iconName)}
                >
                  <CardContent className="flex flex-col items-center justify-center p-3 relative h-full">
                    <Icon size={24} style={{ color: isSelected ? color : 'currentColor' }} />
                    <span className="text-xs mt-1 text-center truncate w-full px-1 text-muted-foreground">
                      {iconName}
                    </span>
                    {isSelected && (
                      <Check className="absolute top-1 right-1 h-4 w-4 text-primary" />
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <p className="col-span-full text-center text-muted-foreground mt-4">
              Nenhum ícone encontrado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default IconGallery;