import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import IconGallery from "./IconGallery";
import { IconCard } from "@/hooks/useIconCards";
import CardIconImageUpload from "./CardIconImageUpload";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditIconCardSheetProps {
  card: IconCard;
  children: React.ReactNode;
  onIconUpdated: () => void;
}

const EditIconCardDialog: React.FC<EditIconCardSheetProps> = ({ card, children, onIconUpdated }) => {
  const [open, setOpen] = useState(false);
  const [selectedIconName, setSelectedIconName] = useState<string | null>(card.icon_name);
  const [iconUrl, setIconUrl] = useState<string | null>(card.icon_url);
  const [color, setColor] = useState<string>(card.color);
  const [name, setName] = useState<string>(card.name || "");
  const [link, setLink] = useState<string>(card.link || "");
  const [isLoading, setIsLoading] = useState(false);

  // Sincroniza o estado interno com as props do card sempre que o dialog for aberto
  useEffect(() => {
    if (open) {
      setSelectedIconName(card.icon_name);
      setIconUrl(card.icon_url);
      setColor(card.color);
      setName(card.name || "");
      setLink(card.link || "");
    }
  }, [open, card]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!iconUrl && !selectedIconName) {
      showError("Por favor, selecione um ícone ou faça upload de uma imagem.");
      return;
    }
    if (!name.trim()) {
      showError("Por favor, insira um nome para o item.");
      return;
    }

    setIsLoading(true);
    
    const updateData = {
      icon_name: selectedIconName,
      icon_url: iconUrl,
      color: color,
      name: name.trim(),
      link: link.trim() || null,
    };

    const { error } = await supabase.from("icon_cards").update(updateData)
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
  
  // Handlers para o CardIconImageUpload
  const handleImageUploadComplete = (storagePath: string) => {
    setIconUrl(storagePath);
    setSelectedIconName(null); // Limpa o ícone Lucide se uma imagem for carregada
  };

  const handleImageRemove = () => {
    setIconUrl(null);
    // Não limpamos selectedIconName aqui, permitindo que o usuário selecione um Lucide icon em seguida.
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Card: {card.name || card.icon_name}</DialogTitle>
          <DialogDescription>
            Altere o ícone, cor, nome ou link deste item.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow pr-4">
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

            {/* Opção de Upload de Imagem */}
            <CardIconImageUpload 
              cardId={card.id}
              currentIconUrl={iconUrl}
              onUploadComplete={handleImageUploadComplete}
              onRemove={handleImageRemove}
            />

            {/* Galeria de Ícones Lucide (Visível apenas se não houver imagem) */}
            {!iconUrl && (
              <div className="space-y-2">
                <Label>Ou Selecione um Ícone Lucide</Label>
                <IconGallery 
                  selectedIconName={selectedIconName}
                  onSelectIcon={(iconName) => {
                    setSelectedIconName(iconName);
                    setIconUrl(null); // Limpa a URL se um ícone Lucide for selecionado
                  }}
                  color={color}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="color">Cor do Ícone</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-10 p-0 cursor-pointer"
                  disabled={!!iconUrl} // Desabilita se houver imagem
                />
                <Input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                  disabled={!!iconUrl} // Desabilita se houver imagem
                />
              </div>
              {!!iconUrl && (
                <p className="text-xs text-muted-foreground">A cor é ignorada ao usar uma imagem personalizada.</p>
              )}
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

            <Button type="submit" className="w-full" disabled={isLoading || (!selectedIconName && !iconUrl) || !name.trim()}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Pencil className="mr-2 h-4 w-4" /> Salvar Alterações
                </>
              )}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EditIconCardDialog;