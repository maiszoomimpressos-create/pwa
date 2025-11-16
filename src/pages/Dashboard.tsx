import { useAuth } from "@/integrations/supabase/auth";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import AddIconCardSheet from "@/components/AddIconCardSheet";
import { useIconCards } from "@/hooks/useIconCards";
import IconCardComponent from "@/components/IconCardComponent";

const Dashboard = () => {
  const { user } = useAuth();
  
  const { data: iconCards, isLoading, refetch } = useIconCards();

  const handleIconAction = () => {
    refetch(); // Busca os cards novamente após a adição, compartilhamento ou exclusão
  };

  return (
    <div className="p-0"> {/* Removendo padding aqui, pois AppLayout já aplica p-4/p-8 */}
      <h1 className="text-3xl font-bold mb-6">Seus Cards de Ícones</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-xl">
        Bem-vindo, {user?.email}! Adicione e gerencie seus cards de ícones personalizados.
      </p>
      
      {/* Botão de Adicionar Item (mantido no topo, mas o FAB também existe) */}
      <div className="mb-8">
        <AddIconCardSheet onIconAdded={handleIconAction}>
          <Button variant="default">
            <Plus className="mr-2 h-4 w-4" /> Adicionar Item
          </Button>
        </AddIconCardSheet>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 w-full">
          {iconCards && iconCards.length > 0 ? (
            iconCards.map((card) => (
              <IconCardComponent key={card.id} card={card} onCardAction={handleIconAction} />
            ))
          ) : (
            <div className="col-span-full text-center p-10 border border-dashed rounded-lg text-muted-foreground">
              Nenhum card adicionado ainda. Clique em 'Adicionar Item' para começar!
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button (FAB) - Movido para o Dashboard */}
      <div className="fixed bottom-8 right-8 z-40">
        <AddIconCardSheet onIconAdded={handleIconAction}>
          <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
            <Plus className="h-6 w-6" />
          </Button>
        </AddIconCardSheet>
      </div>
    </div>
  );
};

export default Dashboard;