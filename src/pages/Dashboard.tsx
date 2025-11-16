import { useAuth } from "@/integrations/supabase/auth";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddIconCardSheet from "@/components/AddIconCardSheet";
import { useIconCards } from "@/hooks/useIconCards"; // Importado para forçar o refetch se necessário

const Dashboard = () => {
  const { user } = useAuth();
  // Usamos o refetch do useIconCards para garantir que a lista na Index seja atualizada
  const { refetch } = useIconCards(); 

  const handleIconAdded = () => {
    refetch();
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="mb-4">
        Bem-vindo, {user?.email}! Esta é a sua área restrita.
      </p>
      
      <AddIconCardSheet onIconAdded={handleIconAdded}>
        <Button variant="default">
          <Plus className="mr-2 h-4 w-4" /> Adicionar Item
        </Button>
      </AddIconCardSheet>
    </div>
  );
};

export default Dashboard;