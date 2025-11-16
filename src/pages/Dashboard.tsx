import { useAuth } from "@/integrations/supabase/auth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="mb-4">
        Bem-vindo, {user?.email}! Esta é a sua área restrita.
      </p>
      <Button onClick={handleLogout} variant="destructive">
        <LogOut className="mr-2 h-4 w-4" /> Sair
      </Button>
    </div>
  );
};

export default Dashboard;