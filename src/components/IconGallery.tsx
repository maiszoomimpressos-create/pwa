import React, { useState, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Lista de ícones Lucide que queremos exibir
const iconNames = Object.keys(LucideIcons).filter(name => 
  typeof (LucideIcons as any)[name] === 'function' && // Garante que é um componente (função)
  name !== 'createReactComponent' && 
  name !== 'Icon' && 
  name !== 'default'
);

interface IconGalleryProps {
  selectedIconName: string | null;
  onSelectIcon: (iconName: string) => void;
  color: string;
}

const IconGallery: React.FC<IconGalleryProps> = ({ selectedIconName, onSelectIcon, color }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredIcons = useMemo(() => {
    if (!searchTerm) return iconNames;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return iconNames.filter(name => name.toLowerCase().includes(lowerCaseSearch));
  }, [searchTerm]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar ícone..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
        <div className="grid grid-cols-6 gap-2">
          {filteredIcons.map((name) => {
            // Acessa o componente de ícone diretamente
            const IconComponent = (LucideIcons as any)[name];
            const isSelected = selectedIconName === name;
            
            // Não precisamos mais da verificação aqui, pois já filtramos a lista.
            if (!IconComponent) return null; 

            return (
              <button
                key={name}
                type="button"
                onClick={() => onSelectIcon(name)}
                className={cn(
                  "flex items-center justify-center p-2 rounded-md transition-colors border",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-muted/50 text-muted-foreground border-transparent",
                )}
                style={isSelected ? { backgroundColor: color, borderColor: color, color: '#FFFFFF' } : {}}
                title={name}
              >
                <IconComponent className="h-5 w-5" style={isSelected ? { color: '#FFFFFF' } : { color: color }} />
              </button>
            );
          })}
        </div>
        {filteredIcons.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">Nenhum ícone encontrado.</p>
        )}
      </ScrollArea>
    </div>
  );
};

export default IconGallery;