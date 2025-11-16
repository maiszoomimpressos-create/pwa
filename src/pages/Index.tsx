import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/integrations/supabase/auth";
import InstallPWAInstructions from "@/components/InstallPWAInstructions";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const { isInstalled, canPrompt, needsManualInstall, promptInstall } = usePWAInstall();

  const renderInstallButton = () => {
    if (isInstalled) {
      return null; // Já instalado
    }

    if (canPrompt) {
      // Prompt nativo (Chrome/Android/Desktop)
      return (
        <Button size="lg" onClick={promptInstall} className="w-full sm:w-auto">
          <Download className="mr-2 h-5 w-5" /> Instalar App
        </Button>
      );
    }

    if (needsManualInstall) {
      // iOS (Instruções manuais)
      return (
        <InstallPWAInstructions>
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-5 w-5" /> Como Instalar (iOS)
          </Button>
        </InstallPWAInstructions>
      );
    }
    
    // Desktop/Outros (Instruções manuais)
    return (
      <InstallPWAInstructions>
        <Button size="lg" variant="outline" className="w-full sm:w-auto">
          <Download className="mr-2 h-5 w-5" /> Como Instalar
        </Button>
      </InstallPWAInstructions>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center text-center py-20 w-full">
      <h1 className="text-5xl font-extrabold tracking-tight mb-4">
        Bem-vindo ao App de Cards
      </h1>
      <p className="text-xl text-muted-foreground mb-10 max-w-xl">
        Organize seus links e ícones favoritos em um só lugar.
      </p>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full max-w-sm sm:max-w-none justify-center">
        {renderInstallButton()}
        
        {!user ? (
          <>
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto">Entrar</Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">Cadastrar</Button>
            </Link>
          </>
        ) : (
          <Link to="/dashboard">
            <Button size="lg" className="w-full sm:w-auto">Ir para o Dashboard</Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Index;