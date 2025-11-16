import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share, Download, CheckCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const InstallPWAInstructions: React.FC = () => {
  const isMobile = useIsMobile();
  const { canInstall, isInstalled, promptInstall } = usePWAInstall();
  
  // 1. Determina se é provável que seja iOS (Safari) ou Android (Chrome)
  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  // 2. Se já estiver instalado, não exibe nada.
  if (isInstalled) {
    return null;
  }

  // 3. Se não for móvel E não puder instalar (Android/Chrome), não exibe nada.
  // Se for iOS, ou se puder instalar (Android/Chrome), ou se estiver em modo móvel, exibimos.
  // No ambiente do iframe, isMobile pode ser false, mas queremos mostrar as instruções se for iOS.
  const shouldShowButton = isMobile || isIOS || canInstall;

  if (!shouldShowButton) {
    return null;
  }

  // 4. Se for Android e o prompt nativo estiver disponível, usamos o botão direto.
  if (canInstall && !isIOS) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        title="Instalar App"
        onClick={promptInstall}
      >
        <Download className="h-5 w-5" />
      </Button>
    );
  }

  // 5. Caso contrário (iOS ou Android sem prompt nativo disponível), mostramos o diálogo de instruções.
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Instalar App">
          <Download className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Download className="mr-2 h-5 w-5" /> Instalar Aplicativo
          </DialogTitle>
          <DialogDescription>
            Adicione este aplicativo à sua tela inicial para uma experiência completa e rápida.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          {isIOS ? (
            <>
              <h3 className="font-semibold text-lg">Instruções para iOS (Safari):</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Toque no ícone de <Share className="inline h-4 w-4 align-text-bottom" /> (Compartilhar) na barra de navegação.</li>
                <li>Role para baixo e selecione "Adicionar à Tela de Início".</li>
                <li>Confirme o nome e toque em "Adicionar".</li>
              </ol>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-lg">Instruções para Android (Chrome):</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Toque no menu de três pontos (<span className="font-bold">⋮</span>) no canto superior direito.</li>
                <li>Selecione "Instalar aplicativo" ou "Adicionar à tela inicial".</li>
                <li>Confirme a instalação.</li>
              </ol>
            </>
          )}
        </div>
        
        <p className="text-xs text-center text-muted-foreground mt-4">
          Se o prompt de instalação não aparecer automaticamente, siga as instruções acima.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default InstallPWAInstructions;