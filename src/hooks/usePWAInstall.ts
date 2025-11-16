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
      if (window.matchMedia('(display-mode: standalone)').matches || 
          // Para iOS, verifica se está rodando em um navegador nativo (não Safari)
          (navigator as any).standalone === true) {
        setIsInstalled(true);
      } else {
        setIsInstalled(false);
      }
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
    window.addEventListener('appinstalled', () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', () => {});
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
      setInstallPrompt(null); // O prompt só pode ser usado uma vez
    }
  };

  return {
    canInstall: !!installPrompt, // Se o evento foi capturado, podemos disparar o prompt
    isInstalled,
    promptInstall,
  };
}