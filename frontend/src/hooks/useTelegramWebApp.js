import { useEffect, useState } from 'react';

export const useTelegramWebApp = () => {
  const [webApp, setWebApp] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setWebApp(tg);
      setUser(tg.initDataUnsafe?.user || null);
      tg.ready();
    } else {
      setError('Telegram WebApp is not available');
    }
    setIsLoading(false);
  }, []);

  return { webApp, user, isLoading, error };
};