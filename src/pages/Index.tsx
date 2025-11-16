import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/integrations/supabase/auth";
import AddIconCardSheet from "@/components/AddIconCardSheet";
import { Plus } from "lucide-react";
import React, { useState } from "react";

const Index = () => {
  const { user } = useAuth();
  // Estado para forçar a atualização da lista de cards após a adição
  const [cardRefreshKey, setCardRefreshKey] = useState(0);

  const handleIconAdded = () => {
    setCardRefreshKey(prev => prev + 1);
    // Futuramente, aqui chamaremos a função para buscar os cards
  };

  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      {user ? (
        <>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            Bem-vindo ao Seu Aplicativo
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-xl">
            Você está logado.
          </p>
          <Link to="/dashboard">
            <Button size="lg">Ir para o Dashboard</Button>
          </Link>
          
          {/* Floating Action Button (FAB) */}
          <div className="fixed bottom-8 right-8 z-40">
            <AddIconCardSheet onIconAdded={handleIconAdded}>
              <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
                <Plus className="h-6 w-6" />
              </Button>
            </AddIconCardSheet>
          </div>
        </>
      ) : (
        // Conteúdo vazio quando não autenticado, conforme solicitado.
        <div className="h-64 flex items-center justify-center">
          {/* Conteúdo vazio */}
        </div>
      )}
    </div>
  );
};

export default Index;