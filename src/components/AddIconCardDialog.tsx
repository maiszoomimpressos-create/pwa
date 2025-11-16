import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import IconSelectionForm from "./IconSelectionForm";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddIconCardDialogProps {
  children: React.ReactNode;
  onIconAdded: () => void;
}

const AddIconCardDialog: React.FC<AddIconCardDialogProps> = ({ children, onIconAdded }) => {
  const [open, setOpen] = useState(false);

  const handleIconAdded = () => {
    onIconAdded();
    setOpen(false); // Fecha o dialog após adicionar
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Ícone</DialogTitle>
          <DialogDescription>
            Selecione um ícone e uma cor para criar um novo card na sua tela inicial.
          </DialogDescription>
        </DialogHeader>
        
        {/* Envolve o formulário inteiro na ScrollArea */}
        <ScrollArea className="h-full overflow-y-auto pr-4">
          <div className="py-4">
            <IconSelectionForm onIconAdded={handleIconAdded} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AddIconCardDialog;