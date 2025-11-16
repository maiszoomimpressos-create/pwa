import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image, Loader2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/integrations/supabase/auth";

interface CardIconImageUploadProps {
  cardId?: string; // ID do card é necessário para o caminho do storage
  currentIconUrl: string | null; // Caminho atual no storage (e.g., 'user_id/card_id.png')
  onUploadComplete: (storagePath: string) => void;
  onRemove: () => void;
}

const CardIconImageUpload: React.FC<CardIconImageUploadProps> = ({
  cardId,
  currentIconUrl,
  onUploadComplete,
  onRemove,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Gera a URL pública para exibição
  const publicUrl = currentIconUrl 
    ? supabase.storage.from('card_icons').getPublicUrl(currentIconUrl).data.publicUrl
    : null;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !cardId) return;

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      if (!fileExt) {
        throw new Error("Formato de arquivo inválido.");
      }
      
      // Caminho: user_id/card_id.ext
      // Usamos o ID do card para garantir que cada card tenha um ícone único
      const storagePath = `${user.id}/${cardId}.${fileExt}`;
      
      // 1. Upload/Upsert do arquivo no Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('card_icons')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true, // Substitui o arquivo existente
        });

      if (uploadError) {
        throw new Error("Erro ao fazer upload da imagem: " + uploadError.message);
      }
      
      showSuccess("Imagem enviada com sucesso!");
      onUploadComplete(storagePath); // Notifica o pai com o caminho do storage

    } catch (error) {
      console.error(error);
      showError(error instanceof Error ? error.message : "Erro desconhecido ao enviar a imagem.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleRemoveImage = async () => {
    if (!user || !currentIconUrl) return;

    setIsUploading(true);
    
    try {
      // 1. Delete file from Supabase Storage
      const { error: deleteError } = await supabase.storage
        .from('card_icons')
        .remove([currentIconUrl]);

      if (deleteError && deleteError.message !== 'The resource was not found') {
        throw new Error("Erro ao deletar a imagem: " + deleteError.message);
      }
      
      showSuccess("Imagem removida com sucesso!");
      onRemove(); // Notifica o pai para limpar o campo icon_url no DB

    } catch (error) {
      console.error(error);
      showError(error instanceof Error ? error.message : "Erro desconhecido ao remover a imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Imagem Personalizada</Label>
      
      {publicUrl ? (
        <div className="flex items-center space-x-4 p-3 border rounded-md bg-muted/50">
          <img src={publicUrl} alt="Ícone do Card" className="h-10 w-10 object-contain rounded" />
          <span className="text-sm flex-1 truncate">Imagem atual</span>
          <Button 
            variant="destructive" 
            size="icon" 
            onClick={handleRemoveImage} 
            disabled={isUploading}
            className="h-8 w-8"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
          </Button>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <Input
            id="card-icon-upload"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="flex-1"
            disabled={isUploading || !cardId}
          />
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !cardId}
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
          </Button>
        </div>
      )}
      
      {!cardId && (
        <p className="text-xs text-muted-foreground">
          O upload de imagem é habilitado após a criação do card (na tela de edição).
        </p>
      )}
    </div>
  );
};

export default CardIconImageUpload;