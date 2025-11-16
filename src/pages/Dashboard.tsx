import { useAuth } from "@/integrations/supabase/auth";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="p-0">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-xl">
        Bem-vindo, {user?.email}! Esta é a sua área de trabalho.
      </p>
      
      <div className="p-10 border border-dashed rounded-lg text-muted-foreground text-center">
        A funcionalidade de cards foi removida.
      </div>
    </div>
  );
};

export default Dashboard;