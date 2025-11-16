import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share, Download, Smartphone, Chrome, Safari } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

interface InstallPWAInstructionsProps {
  children: React.ReactNode;
}

const InstallPWAInstructions: React.FC<InstallPWAInstructionsProps> = ({ children }) => {
  const { canPrompt, needsManualInstall, isIOS, promptInstall } = usePWAInstall();

  const renderInstructions = () => {
    if (canPrompt) {
      // Chrome/Android/Desktop (Prompt nativo)
      return (
        <div className="space-y-4">
          <p>Seu navegador suporta a instalação automática. Clique no botão abaixo para adicionar o aplicativo à sua tela inicial.</p>
          <Button onClick={promptInstall} className="w-full">
            <Download className="mr-2 h-4 w-4" /> Instalar Aplicativo
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Se o botão não funcionar, procure pelo ícone de "Instalar" ou "Adicionar à tela inicial" na barra de endereço do seu navegador.
          </p>
        </div>
      );
    }

    if (needsManualInstall) {
      // iOS (Safari)
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-lg font-semibold">
            <Safari className="h-6 w-6 text-blue-500" />
            <span>Instalação no iOS (Safari)</span>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Toque no ícone de <Share className="inline h-4 w-4" /> (Compartilhar) na barra de navegação inferior.</li>
            <li>Role para baixo e selecione "Adicionar à Tela de Início".</li>
            <li>Confirme o nome e toque em "Adicionar".</li>
          </ol>
          <p className="text-xs text-muted-foreground">
            O Safari não permite prompts automáticos, siga os passos acima.
          </p>
        </div>
      );
    }
    
    // Desktop (Manual)
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-lg font-semibold">
          <Chrome className="h-6 w-6 text-green-600" />
          <span>Instalação no Desktop (Chrome/Edge)</span>
        </div>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Procure pelo ícone de <Download className="inline h-4 w-4" /> (Instalar) ou <Smartphone className="inline h-4 w-4" /> (Computador com seta) na barra de endereço do seu navegador.</li>
          <li>Clique no ícone e confirme a instalação.</li>
        </ol>
        <p className="text-xs text-muted-foreground">
          Se você estiver usando um navegador diferente, procure a opção "Instalar aplicativo" ou "Adicionar à tela inicial" no menu principal.
        </p>
      </div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Instalar App de Cards</DialogTitle>
          <DialogDescription>
            Adicione este aplicativo à sua tela inicial para uma experiência de tela cheia e acesso rápido.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {renderInstructions()}
        </div>
        
        <div className="text-center text-xs text-muted-foreground mt-2">
          {isIOS ? "Dispositivo iOS detectado." : "Dispositivo Android/Desktop detectado."}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstallPWAInstructions;