import { createContext, useContext, useState, useMemo, ReactNode, useCallback } from 'react';

interface SplashScreenContextType {
  isAppReady: boolean;
  setAppReady: () => void;
}

const SplashScreenContext = createContext<SplashScreenContextType | undefined>(undefined);

export const SplashScreenProvider = ({ children }: { children: ReactNode }) => {
  const [isAppReady, setIsAppReady] = useState(false);

  const setAppReady = useCallback(() => {
    setIsAppReady(true);
  }, []);

  const value = useMemo(() => ({ isAppReady, setAppReady }), [isAppReady, setAppReady]);

  return (
    <SplashScreenContext.Provider value={value}>
      {children}
    </SplashScreenContext.Provider>
  );
};

export const useSplashScreenContext = () => {
  const context = useContext(SplashScreenContext);
  if (!context) {
    throw new Error('useSplashScreenContext must be used within a SplashScreenProvider');
  }
  return context;
};
