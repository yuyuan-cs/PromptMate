import { useState, useEffect, useRef } from 'react';
import { getInitializationManager, InitializationProgress } from '@/lib/initializationManager';

interface UseSplashScreenOptions {
  onComplete?: () => void;
}

export const useSplashScreen = (options: UseSplashScreenOptions = {}) => {
  const { onComplete } = options;
  
  // 使用useRef来存储onComplete回调，避免依赖项变化
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [showSplash, setShowSplash] = useState(true);
  const [initializationProgress, setInitializationProgress] = useState<InitializationProgress>({
    isLoading: true,
    progress: 0,
    tasks: []
  });

  useEffect(() => {
    const initManager = getInitializationManager();
    
    // 订阅初始化进度更新
    const unsubscribe = initManager.subscribe((progress) => {
      setInitializationProgress(progress);
      
      // 如果初始化完成，延迟隐藏启动页面
      if (!progress.isLoading) {
        // 等待主应用内容完全加载
        const waitForAppContent = async () => {
          // 检查主应用是否已经渲染
          const checkAppRendered = () => {
            const appElement = document.querySelector('[data-testid="main-app"]');
            const appContent = document.querySelector('.app-content');
            return !!(appElement && appContent);
          };
          
          // 等待主应用渲染，最多等待3秒
          let attempts = 0;
          const maxAttempts = 30; // 3秒 / 100ms = 30次
          
          while (!checkAppRendered() && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
          
          console.log('主应用内容渲染完成，隐藏启动屏幕');
          
          // 再等待一小段时间确保内容完全稳定
          setTimeout(() => {
            setShowSplash(false);
            onCompleteRef.current?.();
          }, 300);
        };
        
        waitForAppContent();
      }
    });

    // 开始初始化
    initManager.startInitialization().catch((error) => {
      console.error('初始化失败:', error);
      // 即使初始化失败，也要隐藏启动页面
      setTimeout(() => {
        setShowSplash(false);
        onCompleteRef.current?.();
      }, 1000);
    });

    return unsubscribe;
  }, []); // 移除onComplete依赖项

  return {
    showSplash,
    isLoading: initializationProgress.isLoading,
    progress: initializationProgress.progress,
    currentTask: initializationProgress.currentTask,
    tasks: initializationProgress.tasks,
    error: initializationProgress.error
  };
};


