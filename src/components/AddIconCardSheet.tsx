import React from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddIconCardSheetProps {
  children: React.ReactNode;
}

const AddIconCardSheet: React.FC<AddIconCardSheetProps> = ({ children }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Adicionar Novo Ícone</SheetTitle>
          <SheetDescription>
            Selecione um ícone da biblioteca para adicionar à sua tela inicial.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-4">
          {/* Conteúdo futuro para seleção de ícones */}
          <p className="text-sm text-muted-foreground">
            Aqui será a interface para buscar e selecionar ícones.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddIconCardSheet;