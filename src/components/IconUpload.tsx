import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { useAuth } from "@/integrations/supabase/auth";

interface IconUploadProps {
  onUploadSuccess: (url: string) => void;
  currentIconUrl: string | null;
}

const IconUpload: React.FC<IconUploadProps> = ({ onUploadSuccess, currentIconUrl }) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 1024 * 1024 * 2) { // 2MB limit
      showError("O arquivo deve ter no máximo 2MB.");
      return;
    }

    setIsUploading(true);
    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    try {
      // 1. Upload para o bucket 'icons'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('icons')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // 2. Obter a URL pública
      const { data: publicUrlData } = supabase.storage
        .from('icons')
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) {
        throw new Error("Falha ao obter URL pública.");
      }

      onUploadSuccess(publicUrlData.publicUrl);
      showSuccess("Ícone customizado carregado com sucesso!");

    } catch (error: any) {
      console.error("Erro no upload:", error);
      showError("Erro ao carregar ícone: " + error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Limpa o input
      }
    }
  };

  const handleRemoveCustomIcon = async () => {
    if (!currentIconUrl || !user) return;

    // Tentativa de extrair o caminho do arquivo (path)
    const pathSegments = currentIconUrl.split('/icons/');
    if (pathSegments.length < 2) {
        showError("Não foi possível determinar o caminho do arquivo para exclusão.");
        return;
    }
    const filePath = pathSegments[1];

    setIsUploading(true);
    try {
        const { error } = await supabase.storage
            .from('icons')
            .remove([filePath]);

        if (error) {
            throw error;
        }
        
        onUploadSuccess(""); // Limpa o URL no formulário pai
        showSuccess("Ícone customizado removido.");

    } catch (error: any) {
        console.error("Erro ao remover ícone:", error);
        showError("Erro ao remover ícone: " + error.message);
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label>Upload de Ícone (PNG, JPG, SVG - Máx 2MB)</Label>
      
      {currentIconUrl ? (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted">
          <div className="flex items-center space-x-3">
            <img src={currentIconUrl} alt="Ícone customizado" className="h-8 w-8 object-contain" />
            <span className="text-sm truncate">Ícone carregado</span>
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleRemoveCustomIcon}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remover"}
          </Button>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <Input
            id="icon-upload"
            type="file"
            accept="image/png, image/jpeg, image/svg+xml"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
            disabled={isUploading}
          />
          <Button 
            type="button" 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> Selecionar Arquivo
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default IconUpload;