import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

interface IconUploadProps {
  onUploadSuccess: (url: string) => void;
  currentIconUrl: string | null;
}

const IconUpload: React.FC<IconUploadProps> = ({ onUploadSuccess, currentIconUrl }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        showError("Por favor, selecione um arquivo de imagem.");
        setFile(null);
        return;
      }
      if (selectedFile.size > 1024 * 1024 * 2) { // Limite de 2MB
        showError("O arquivo é muito grande (máx: 2MB).");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setUploadStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showError("Nenhum arquivo selecionado.");
      return;
    }

    setIsLoading(true);
    setUploadStatus('idle');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError("Usuário não autenticado.");
      setIsLoading(false);
      return;
    }

    // Define o caminho do arquivo no storage: card_icons/user_id/timestamp_filename
    const filePath = `${user.id}/${Date.now()}_${file.name}`;

    const { data, error } = await supabase.storage
      .from('card_icons')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error("Erro de upload:", error);
      showError("Erro ao fazer upload do ícone: " + error.message);
      setUploadStatus('error');
    } else {
      // Obtém a URL pública
      const { data: publicUrlData } = supabase.storage
        .from('card_icons')
        .getPublicUrl(data.path);
      
      if (publicUrlData?.publicUrl) {
        showSuccess("Ícone enviado com sucesso!");
        onUploadSuccess(publicUrlData.publicUrl);
        setUploadStatus('success');
        setFile(null); // Limpa o arquivo selecionado após o sucesso
      } else {
        showError("Erro ao obter URL pública.");
        setUploadStatus('error');
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-3 border p-4 rounded-lg">
      <Label htmlFor="icon-upload" className="font-semibold">
        Upload de Ícone Customizado (Imagem)
      </Label>
      
      <div className="flex items-center space-x-2">
        <Input
          id="icon-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="flex-1"
        />
        <Button 
          onClick={handleUpload} 
          disabled={isLoading || !file}
          className="flex-shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : uploadStatus === 'success' ? (
            <CheckCircle className="h-4 w-4 text-white" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {currentIconUrl && uploadStatus !== 'success' && (
        <div className="text-sm text-muted-foreground flex items-center space-x-2">
          <img src={currentIconUrl} alt="Ícone atual" className="h-6 w-6 object-contain rounded" />
          <span>Ícone customizado atual selecionado.</span>
        </div>
      )}
      
      {file && !isLoading && uploadStatus !== 'success' && (
        <p className="text-sm text-muted-foreground">
          Arquivo pronto para upload: {file.name}
        </p>
      )}
    </div>
  );
};

export default IconUpload;