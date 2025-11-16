import React, { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import IconSelectionForm from "./IconSelectionForm";

interface AddIconCardSheetProps {
  children: React.ReactNode;
  onIconAdded: () => void;
}

const AddIconCardSheet: React.FC<AddIconCardSheetProps> = ({ children, onIconAdded }) => {
  const [open, setOpen] = useState(false);

  const handleIconAdded = () => {
    onIconAdded();
    setOpen(false); // Fecha o sheet após adicionar
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Adicionar Novo Ícone</SheetTitle>
          <SheetDescription>
            Selecione um ícone e uma cor para criar um novo card na sua tela inicial.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-4">
          <IconSelectionForm onIconAdded={handleIconAdded} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddIconCardSheet;