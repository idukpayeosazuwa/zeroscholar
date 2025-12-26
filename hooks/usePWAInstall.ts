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

    console.log('Device detected - iOS:', iOS, 'Android:', Android);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      setShowInstallButton(false);
      console.log('App already installed');
      return;
    }

    // Listen for the beforeinstallprompt event (Android Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      setShowInstallButton(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('App installed successfully');
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
        console.log('Showing install prompt after 3 seconds');
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
    console.log('Install clicked, installPrompt:', !!installPrompt);
    
    if (installPrompt) {
      // Android: Use native prompt
      try {
        console.log('Calling prompt()');
        await installPrompt.prompt();
        console.log('Prompt shown');
        
        const { outcome } = await installPrompt.userChoice;
        console.log('User choice:', outcome);

        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
          setIsInstalled(true);
          setShowInstallButton(false);
        } else {
          console.log('User dismissed the install prompt');
          // Don't hide the banner if they dismiss - keep showing it
        }

        setInstallPrompt(null);
      } catch (error) {
        console.error('Error during install:', error);
      }
    } else {
      console.log('No install prompt available');
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
