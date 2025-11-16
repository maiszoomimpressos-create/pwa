import React, { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Image, Zap } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import IconGallery from "./IconGallery";
import IconUpload from "./IconUpload";
import { useIconCards } from "@/hooks/useIconCards";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface AddIconCardSheetProps {
  onCardCreated: () => void;
}

const DEFAULT_COLOR = "#000000";

const AddIconCardSheet: React.FC<AddIconCardSheetProps> = ({ onCardCreated }) => {
  const { createCard, isCreating } = useIconCards();
  const [open, setOpen] = useState(false);
  
  const [selectedIconName, setSelectedIconName] = useState<string | null>(null);
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [color, setColor] = useState<string>(DEFAULT_COLOR);
  const [name, setName] = useState<string>("");
  const [link, setLink] = useState<string>("");
  const [tab, setTab] = useState<'lucide' | 'custom'>('lucide');

  const resetForm = () => {
    setSelectedIconName(null);
    setIconUrl(null);
    setColor(DEFAULT_COLOR);
    setName("");
    setLink("");
    setTab('lucide');
  };

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

    createCard(
      {
        icon_name: finalIconName,
        icon_url: finalIconUrl,
        color: color,
        name: name.trim(),
        link: link.trim() || null,
      },
      {
        onSuccess: () => {
          showSuccess(`Item '${name}' criado com sucesso!`);
          resetForm();
          setOpen(false);
          onCardCreated();
        },
        onError: (error) => {
          showError("Erro ao criar item: " + error.message);
        },
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Adicionar Item
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Adicionar Novo Item</SheetTitle>
          <SheetDescription>
            Crie um novo card com um ícone, nome e link.
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
            disabled={isCreating || (!selectedIconName && !iconUrl) || !name.trim()}
          >
            {isCreating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Criar Item
              </>
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddIconCardSheet;