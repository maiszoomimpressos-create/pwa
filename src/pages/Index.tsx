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
        // Removendo os botões de Login/Cadastro conforme solicitado.
        <p className="text-lg text-gray-500">
          Faça login ou cadastre-se usando o menu superior.
        </p>
      )}
    </div>
  );
};

export default Index;