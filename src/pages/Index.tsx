import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/integrations/supabase/auth";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <h1 className="text-5xl font-extrabold tracking-tight mb-4">
        Bem-vindo ao Seu Aplicativo
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-xl">
        Um sistema completo com autenticação, layout responsivo e PWA.
      </p>
      
      {user ? (
        <Link to="/dashboard">
          <Button size="lg">Ir para o Dashboard</Button>
        </Link>
      ) : (
        <div className="space-x-4">
          <Link to="/login">
            <Button size="lg">Entrar Agora</Button>
          </Link>
          <Link to="/register">
            <Button size="lg" variant="outline">Cadastrar</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Index;