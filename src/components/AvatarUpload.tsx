import React, { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/integrations/supabase/auth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Button } from "@/components/ui/button";

interface AvatarUploadProps {
  onAvatarUpdated: () => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ onAvatarUpdated }) => {
  const { user } = useAuth();
  const { profile, isLoading, refetchProfile } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Gera a URL pública do avatar
  const currentAvatarUrl = profile?.avatar_url 
    ? supabase.storage.from('avatars').getPublicUrl(profile.avatar_url).data.publicUrl
    : null;

  const userInitials = profile?.first_name && profile.last_name 
    ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || "US";

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      if (!fileExt) {
        throw new Error("Formato de arquivo inválido.");
      }
      
      // Usamos um caminho fixo para o avatar principal do usuário, permitindo upsert (substituição)
      const fixedPath = `${user.id}/avatar.${fileExt}`;
      
      // 1. Upload/Upsert do arquivo no Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fixedPath, file, {
          cacheControl: '3600',
          upsert: true, // Substitui o arquivo existente
        });

      if (uploadError) {
        throw new Error("Erro ao fazer upload da imagem: " + uploadError.message);
      }
      
      // 2. Atualizar o perfil com o novo caminho do avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: fixedPath, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) {
        throw new Error("Erro ao atualizar o perfil com a URL do avatar: " + updateError.message);
      }
      
      showSuccess("Avatar atualizado com sucesso!");
      refetchProfile(); // Força a atualização do perfil no hook
      onAvatarUpdated(); // Notifica o componente pai (se necessário)

    } catch (error) {
      console.error(error);
      showError(error instanceof Error ? error.message : "Erro desconhecido ao atualizar o avatar.");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleRemoveAvatar = async () => {
    if (!user || !profile?.avatar_url) return;

    setIsUploading(true);
    
    try {
      // 1. Delete file from Supabase Storage
      // O caminho é o valor armazenado em profile.avatar_url
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([profile.avatar_url]);

      // Ignoramos o erro se o recurso não for encontrado (pode ter sido deletado manualmente)
      if (deleteError && deleteError.message !== 'The resource was not found') {
        throw new Error("Erro ao deletar a imagem: " + deleteError.message);
      }
      
      // 2. Update profile to set avatar_url to null
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) {
        throw new Error("Erro ao atualizar o perfil após remoção: " + updateError.message);
      }
      
      showSuccess("Avatar removido com sucesso!");
      refetchProfile();
      onAvatarUpdated();

    } catch (error) {
      console.error(error);
      showError(error instanceof Error ? error.message : "Erro desconhecido ao remover o avatar.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current && !isUploading) {
      fileInputRef.current.click();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div 
        className={`relative group cursor-pointer ${isUploading ? 'opacity-60' : ''}`} 
        onClick={handleAvatarClick}
      >
        <Avatar className="h-24 w-24 border-4 border-primary/50 shadow-md">
          {currentAvatarUrl ? (
            <AvatarImage src={currentAvatarUrl} alt="Avatar" className="object-cover" />
          ) : (
            <AvatarFallback className="text-3xl font-semibold bg-primary text-primary-foreground">
              {userInitials}
            </AvatarFallback>
          )}
        </Avatar>
        
        {/* Overlay de upload */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </div>
      </div>
      
      <Label htmlFor="avatar-upload" className={`text-sm text-muted-foreground ${!isUploading ? 'cursor-pointer hover:text-primary' : ''}`}>
        {isUploading ? "Enviando..." : "Clique para alterar a foto"}
      </Label>
      
      <Input
        id="avatar-upload"
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      
      {/* Botão de Remover Avatar */}
      {currentAvatarUrl && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRemoveAvatar} 
          disabled={isUploading}
          className="text-destructive hover:bg-destructive/10"
        >
          {isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          Remover Avatar
        </Button>
      )}
    </div>
  );
};

export default AvatarUpload;