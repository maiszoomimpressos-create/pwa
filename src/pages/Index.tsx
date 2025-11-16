import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/integrations/supabase/auth";

const Index = () => {
  const { user } = useAuth();

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
        </>
      ) : (
        // Conteúdo vazio quando não autenticado, conforme solicitado.
        <div className="h-64 flex items-center justify-center">
          {/* Opcionalmente, você pode adicionar um placeholder visual aqui se necessário, mas por enquanto, está vazio. */}
        </div>
      )}
    </div>
  );
};

export default Index;