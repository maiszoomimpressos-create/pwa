import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/integrations/supabase/auth";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center text-center py-20 w-full">
      <h1 className="text-5xl font-extrabold tracking-tight mb-4">
        Bem-vindo ao App de Cards
      </h1>
      <p className="text-xl text-muted-foreground mb-10 max-w-xl">
        Organize seus links e ícones favoritos em um só lugar.
      </p>

      {!user ? (
        <div className="space-x-4">
          <Link to="/login">
            <Button size="lg">Entrar</Button>
          </Link>
          <Link to="/register">
            <Button size="lg" variant="outline">Cadastrar</Button>
          </Link>
        </div>
      ) : (
        <Link to="/dashboard">
          <Button size="lg">Ir para o Dashboard</Button>
        </Link>
      )}
    </div>
  );
};

export default Index;