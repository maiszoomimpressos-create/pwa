import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileForm from "@/components/ProfileForm";
import { useAuth } from "@/integrations/supabase/auth";

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Configurações de Perfil</h1>
      
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