import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/integrations/supabase/auth";
import AddIconCardSheet from "@/components/AddIconCardSheet";
import { Plus, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useIconCards } from "@/hooks/useIconCards";
import IconCardComponent from "@/components/IconCardComponent";

const Index = () => {
  const { user } = useAuth();
  // Estado para forçar a atualização da lista de cards após a adição
  const [cardRefreshKey, setCardRefreshKey] = useState(0);
  
  const { data: iconCards, isLoading, refetch } = useIconCards();

  const handleIconAction = () => {
    refetch(); // Busca os cards novamente após a adição, compartilhamento ou exclusão
    setCardRefreshKey(prev => prev + 1); // Mantém o estado de refreshKey se necessário para outros usos
  };

  if (!user) {
    // Conteúdo vazio quando não autenticado
    return (
      <div className="h-64 flex items-center justify-center">
        {/* Conteúdo vazio */}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center py-10 w-full">
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">
        Seus Cards de Ícones
      </h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-xl">
        Adicione e gerencie seus cards de ícones personalizados.
      </p>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full max-w-4xl">
          {iconCards && iconCards.length > 0 ? (
            iconCards.map((card) => (
              <IconCardComponent key={card.id} card={card} onCardAction={handleIconAction} />
            ))
          ) : (
            <div className="col-span-full text-center p-10 border border-dashed rounded-lg text-muted-foreground">
              Nenhum card adicionado ainda. Clique no '+' para começar!
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button (FAB) */}
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

export default Index;