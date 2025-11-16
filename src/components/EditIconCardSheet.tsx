import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import IconGallery from "./IconGallery";
import { IconCard } from "@/hooks/useIconCards";

interface EditIconCardSheetProps {
  card: IconCard;
  children: React.ReactNode;
  onIconUpdated: () => void;
}

const EditIconCardSheet: React.FC<EditIconCardSheetProps> = ({ card, children, onIconUpdated }) => {
  const [open, setOpen] = useState(false);
  
  // Estados internos inicializados com os valores do card
  const [selectedIconName, setSelectedIconName] = useState<string>(card.icon_name);
  const [color, setColor] = useState<string>(card.color);
  const [name, setName] = useState<string>(card.name || "");
  const [link, setLink] = useState<string>(card.link || "");
  const [isLoading, setIsLoading] = useState(false);

  // Função para resetar os estados para os valores atuais do card
  const resetForm = () => {
    setSelectedIconName(card.icon_name);
    setColor(card.color);
    setName(card.name || "");
    setLink(card.link || "");
  };

  // Sincroniza o estado interno com as props do card quando o sheet abre
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, card.id, card.icon_name, card.color, card.name, card.link]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIconName) {
      showError("Por favor, selecione um ícone.");
      return;
    }
    if (!name.trim()) {
      showError("Por favor, insira um nome para o item.");
      return;
    }

    setIsLoading(true);
    
    const { error } = await supabase.from("icon_cards").update({
      icon_name: selectedIconName,
      color: color,
      name: name.trim(),
      link: link.trim() || null,
    })
    .eq('id', card.id);

    if (error) {
      console.error("Erro ao atualizar ícone:", error);
      showError("Erro ao atualizar o item: " + error.message);
    } else {
      showSuccess(`Item '${name}' atualizado com sucesso!`);
      setOpen(false);
      onIconUpdated(); // Notifica o pai para atualizar a lista
    }

    setIsLoading(false);
  };

  return (
    <Sheet 
      open={open} 
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        // Se estiver fechando, resetamos o formulário para o estado original do card
        if (!newOpen) {
          resetForm();
        }
      }}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Editar Card: {card.name || card.icon_name}</SheetTitle>
          <SheetDescription>
            Altere o ícone, cor, nome ou link deste item.
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Item</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Meu Link Favorito"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Selecione um Ícone</Label>
            <IconGallery 
              selectedIconName={selectedIconName}
              onSelectIcon={setSelectedIconName}
              color={color}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Cor do Ícone</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-10 p-0 cursor-pointer"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="link">Link (URL)</Label>
            <Input
              id="link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://exemplo.com"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !selectedIconName || !name.trim()}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <Pencil className="mr-2 h-4 w-4" /> Salvar Alterações
              </>
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default EditIconCardSheet;