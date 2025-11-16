import { useAuth } from "@/integrations/supabase/auth";
import { useIconCards } from "@/hooks/useIconCards";
import AddIconCardSheet from "@/components/AddIconCardSheet";
import IconCardComponent from "@/components/IconCardComponent";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { cards, isLoading, refetchCards } = useIconCards();
  
  return (
    <div className="p-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meus Itens</h1>
        <AddIconCardSheet onCardCreated={refetchCards} />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : cards.length === 0 ? (
        <div className="p-10 border border-dashed rounded-lg text-muted-foreground text-center">
          Você ainda não tem nenhum item. Clique em "Adicionar Item" para começar!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cards.map((card) => (
            <IconCardComponent 
              key={card.id} 
              card={card} 
              onCardAction={refetchCards} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;