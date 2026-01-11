import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWAInstall = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect device OS
    const userAgent = navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(userAgent);
    const Android = /Android/.test(userAgent);
    
    setIsIOS(iOS);
    setIsAndroid(Android);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      setShowInstallButton(false);
      return;
    }

    // Listen for the beforeinstallprompt event (Android Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      setShowInstallButton(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallButton(false);
      setInstallPrompt(null);
      setShowSuccessMessage(true);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show custom prompt after 3 seconds on first visit (for all devices)
    const timer = setTimeout(() => {
      if (!isInstalled) {
        setShowInstallButton(true);
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    
    if (installPrompt) {
      // Android: Use native prompt
      try {
        await installPrompt.prompt();
        
        const { outcome } = await installPrompt.userChoice;

        if (outcome === 'accepted') {
          setIsInstalled(true);
          setShowInstallButton(false);
        } else {
          // Don't hide the banner if they dismiss - keep showing it
        }

        setInstallPrompt(null);
      } catch (error) {
        console.error('Error during install:', error);
      }
    } else {
    }
  };

  return {
    installPrompt,
    isInstalled,
    showInstallButton,
    showSuccessMessage,
    handleInstall,
    canInstall: !!installPrompt && !isInstalled,
    isIOS,
    isAndroid,
  };
};
