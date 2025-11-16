import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import IconGallery from "./IconGallery"; // Importando a nova galeria

interface IconSelectionFormProps {
  onIconAdded: () => void;
}

const IconSelectionForm: React.FC<IconSelectionFormProps> = ({ onIconAdded }) => {
  const [selectedIconName, setSelectedIconName] = useState<string | null>(null);
  const [color, setColor] = useState<string>("#000000");
  const [name, setName] = useState<string>("");
  const [link, setLink] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

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
    
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      showError("Usuário não autenticado.");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.from("icon_cards").insert([
      {
        user_id: user.id,
        icon_name: selectedIconName,
        icon_url: null, // Sempre nulo na criação
        color: color,
        name: name.trim(),
        link: link.trim() || null, // Salva link ou null se vazio
      },
    ]);

    if (error) {
      console.error("Erro ao salvar ícone:", error);
      showError("Erro ao adicionar o item: " + error.message);
    } else {
      showSuccess(`Item '${name}' adicionado com sucesso!`);
      setSelectedIconName(null);
      setColor("#000000");
      setName("");
      setLink("");
      onIconAdded(); // Notifica o pai para fechar o sheet ou atualizar a lista
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
        <Label>Selecione um Ícone</Label>
        <IconGallery 
          selectedIconName={selectedIconName}
          onSelectIcon={setSelectedIconName}
          color={color}
        />
        <p className="text-xs text-muted-foreground">
          Você poderá adicionar uma imagem personalizada após a criação, editando o card.
        </p>
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
          "Salvar Item"
        )}
      </Button>
    </form>
  );
};

export default IconSelectionForm;