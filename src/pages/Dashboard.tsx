import { useAuth } from "@/integrations/supabase/auth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();

  // Mantendo a função de logout caso seja necessária em outro lugar, mas removendo o botão.
  // const handleLogout = async () => {
  //   await supabase.auth.signOut();
  // };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="mb-4">
        Bem-vindo, {user?.email}! Esta é a sua área restrita.
      </p>
      
      <Link to="/">
        <Button variant="default">
          <Plus className="mr-2 h-4 w-4" /> Adicionar Item
        </Button>
      </Link>
    </div>
  );
};

export default Dashboard;