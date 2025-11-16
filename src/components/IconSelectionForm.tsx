import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Image, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import IconGallery from "./IconGallery";
import IconUpload from "./IconUpload"; // Importando o novo componente
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface IconSelectionFormProps {
  onIconAdded: () => void;
  initialIconName?: string | null;
  initialIconUrl?: string | null;
}

const IconSelectionForm: React.FC<IconSelectionFormProps> = ({ 
  onIconAdded,
  initialIconName = null,
  initialIconUrl = null,
}) => {
  const [selectedIconName, setSelectedIconName] = useState<string | null>(initialIconName);
  const [iconUrl, setIconUrl] = useState<string | null>(initialIconUrl);
  const [color, setColor] = useState<string>("#000000");
  const [name, setName] = useState<string>("");
  const [link, setLink] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState<'lucide' | 'custom'>(initialIconUrl ? 'custom' : 'lucide');

  // Lógica para garantir que apenas um tipo de ícone esteja ativo
  const handleSelectLucideIcon = (iconName: string) => {
    setSelectedIconName(iconName);
    setIconUrl(null); // Limpa o URL customizado
  };

  const handleUploadSuccess = (url: string) => {
    setIconUrl(url);
    setSelectedIconName(null); // Limpa o ícone Lucide
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      showError("Usuário não autenticado.");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.from("icon_cards").insert([
      {
        user_id: user.id,
        icon_name: finalIconName,
        icon_url: finalIconUrl, // Novo campo
        color: color,
        name: name.trim(),
        link: link.trim() || null,
      },
    ]);

    if (error) {
      console.error("Erro ao salvar ícone:", error);
      showError("Erro ao adicionar o item: " + error.message);
    } else {
      showSuccess(`Item '${name}' adicionado com sucesso!`);
      // Resetar estados
      setSelectedIconName(null);
      setIconUrl(null);
      setColor("#000000");
      setName("");
      setLink("");
      setTab('lucide');
      onIconAdded();
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
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
            {iconUrl && (
              <div className="mt-4 p-3 border rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium">Ícone Customizado Selecionado:</span>
                <img src={iconUrl} alt="Ícone customizado" className="h-8 w-8 object-contain" />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* A cor só é relevante para ícones Lucide, mas mantemos o campo */}
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
        disabled={isLoading || (!selectedIconName && !iconUrl) || !name.trim()}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          "Salvar Item"
        )}
      </Button>
    </form>
  );
};

export default IconSelectionForm;