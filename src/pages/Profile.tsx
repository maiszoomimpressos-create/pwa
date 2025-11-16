import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileForm from "@/components/ProfileForm";
import { useAuth } from "@/integrations/supabase/auth";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Configurações de Perfil</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 border rounded-md bg-muted/50">
            <p className="text-sm font-medium text-muted-foreground">Email:</p>
            <p className="text-lg font-semibold">{user?.email}</p>
          </div>
          <ProfileForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;