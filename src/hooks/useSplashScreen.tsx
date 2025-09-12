import { useState, useEffect, useRef } from 'react';
import { getInitializationManager, InitializationProgress } from '@/lib/initializationManager';
import { useSplashScreenContext } from '@/hooks/useSplashScreenContext';

interface UseSplashScreenOptions {
  onComplete?: () => void;
}

export const useSplashScreen = (options: UseSplashScreenOptions = {}) => {
  const { onComplete } = options;
  const { isAppReady } = useSplashScreenContext();
  
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

  useEffect(() => {
    if (!initializationProgress.isLoading && isAppReady) {
      // 等待一小段时间确保内容完全稳定
      setTimeout(() => {
        setShowSplash(false);
        onCompleteRef.current?.();
      }, 300);
    }
  }, [initializationProgress.isLoading, isAppReady]);

  return {
    showSplash,
    isLoading: initializationProgress.isLoading,
    progress: initializationProgress.progress,
    currentTask: initializationProgress.currentTask,
    tasks: initializationProgress.tasks,
    error: initializationProgress.error
  };
};


