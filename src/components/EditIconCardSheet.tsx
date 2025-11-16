import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil, Image, Zap } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import IconGallery from "./IconGallery";
import { IconCard, useIconCards } from "@/hooks/useIconCards";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import IconUpload from "./IconUpload";

interface EditIconCardSheetProps {
  card: IconCard;
  children: React.ReactNode;
  onIconUpdated: () => void;
}

const EditIconCardSheet: React.FC<EditIconCardSheetProps> = ({ card, children, onIconUpdated }) => {
  const { updateCard, isUpdating } = useIconCards();
  const [open, setOpen] = useState(false);
  
  // Estados internos inicializados com os valores do card
  const [selectedIconName, setSelectedIconName] = useState<string | null>(card.icon_name);
  const [iconUrl, setIconUrl] = useState<string | null>(card.icon_url);
  const [color, setColor] = useState<string>(card.color);
  const [name, setName] = useState<string>(card.name || "");
  const [link, setLink] = useState<string>(card.link || "");
  const [tab, setTab] = useState<'lucide' | 'custom'>(card.icon_url ? 'custom' : 'lucide');

  // Função para resetar os estados para os valores atuais do card
  const resetForm = () => {
    setSelectedIconName(card.icon_name);
    setIconUrl(card.icon_url);
    setColor(card.color);
    setName(card.name || "");
    setLink(card.link || "");
    setTab(card.icon_url ? 'custom' : 'lucide');
  };

  // Sincroniza o estado interno com as props do card quando o sheet abre
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, card.id, card.icon_name, card.icon_url, card.color, card.name, card.link]);

  // Lógica para garantir que apenas um tipo de ícone esteja ativo
  const handleSelectLucideIcon = (iconName: string) => {
    setSelectedIconName(iconName);
    setIconUrl(null); // Limpa o URL customizado
  };

  const handleUploadSuccess = (url: string) => {
    setIconUrl(url);
    setSelectedIconName(null); // Limpa o ícone Lucide
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalIconName = tab === 'lucide' ? selectedIconName : null;
    const finalIconUrl = tab === 'custom' ? iconUrl : null;

    if (!finalIconName && !finalIconUrl) {
      showError("Por favor, selecione ou faça upload de um ícone.");
      return;
    }
    if (!name.trim()) {
      showError("Por favor, insira um nome para o item.");
      return;
    }

    updateCard(
      {
        id: card.id,
        icon_name: finalIconName,
        icon_url: finalIconUrl,
        color: color,
        name: name.trim(),
        link: link.trim() || null,
      },
      {
        onSuccess: () => {
          showSuccess(`Item '${name}' atualizado com sucesso!`);
          setOpen(false);
          onIconUpdated(); // Notifica o pai para atualizar a lista
        },
        onError: (error) => {
          showError("Erro ao atualizar perfil: " + error.message);
        },
      }
    );
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
            <Label>Selecione o Tipo de Ícone</Label>
            <Tabs value={tab} onValueChange={(value) => setTab(value as 'lucide' | 'custom')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="lucide">
                  <Zap className="h-4 w-4 mr-2" /> Ícones Padrão
                </TabsTrigger>
                <TabsTrigger value="custom">
                  <Image className="h-4 w-4 mr-2" /> Ícone Customizado
                </TabsTrigger>
              </TabsList>
              <TabsContent value="lucide" className="mt-4">
                <IconGallery 
                  selectedIconName={selectedIconName}
                  onSelectIcon={handleSelectLucideIcon}
                  color={color}
                />
              </TabsContent>
              <TabsContent value="custom" className="mt-4">
                <IconUpload 
                  onUploadSuccess={handleUploadSuccess} 
                  currentIconUrl={iconUrl}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Cor do Ícone (Apenas para Ícones Padrão)</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-10 p-0 cursor-pointer"
                disabled={tab === 'custom'}
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#000000"
                className="flex-1"
                disabled={tab === 'custom'}
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

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isUpdating || (!selectedIconName && !iconUrl) || !name.trim()}
          >
            {isUpdating ? (
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