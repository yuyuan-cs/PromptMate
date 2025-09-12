import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'
import { SplashScreenProvider } from '@/hooks/useSplashScreenContext';

createRoot(document.getElementById("root")!).render(
  <SplashScreenProvider>
    <App />
  </SplashScreenProvider>
);
