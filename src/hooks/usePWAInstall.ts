import { useState, useEffect } from "react";

// Tipo para o evento de instalação do PWA
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verifica se já está instalado (modo standalone)
    const checkInstalled = () => {
      // Verifica se está em modo standalone (PWA instalado)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // Verifica se é iOS e está em modo fullscreen (PWA instalado via "Add to Home Screen")
      const isIOSStandalone = (navigator as any).standalone === true;
      
      setIsInstalled(isStandalone || isIOSStandalone);
    };

    checkInstalled();

    // Listener para o evento nativo de instalação
    const handler = (e: Event) => {
      e.preventDefault();
      // Armazena o evento para que possa ser disparado mais tarde
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listener para quando o app é instalado
    const appInstalledHandler = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };
    window.addEventListener('appinstalled', appInstalledHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', appInstalledHandler);
    };
  }, []);

  const promptInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      // O prompt só pode ser usado uma vez, então limpamos o estado
      setInstallPrompt(null); 
    }
  };

  return {
    canInstall: !!installPrompt, // Se o evento foi capturado, podemos disparar o prompt
    isInstalled,
    promptInstall,
  };
}