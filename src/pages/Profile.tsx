import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileForm from "@/components/ProfileForm";
import { useAuth } from "@/integrations/supabase/auth";
import AvatarUpload from "@/components/AvatarUpload";
import { useProfile } from "@/hooks/useProfile";

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { refetchProfile } = useProfile();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Configurações de Perfil</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Foto de Perfil</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <AvatarUpload onAvatarUpdated={refetchProfile} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Conta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p><strong>Email:</strong> {user?.email}</p>
            <p className="text-sm text-muted-foreground">
              Para alterar seu email ou senha, use as ferramentas de autenticação do Supabase.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;