import { useState, useEffect } from 'react';

interface UseSplashScreenOptions {
  duration?: number;
  minDuration?: number;
  onComplete?: () => void;
}

export const useSplashScreen = (options: UseSplashScreenOptions = {}) => {
  const {
    duration = 3000,
    minDuration = 2000,
    onComplete
  } = options;

  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    
    // 模拟应用初始化过程
    const initializeApp = async () => {
      // 这里可以添加实际的初始化逻辑
      // 比如：加载配置、初始化数据库、检查更新等
      
      // 模拟一些异步初始化任务
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 确保最小显示时间
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDuration - elapsed);
      
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining));
      }
      
      setIsLoading(false);
    };

    initializeApp();
  }, [minDuration]);

  useEffect(() => {
    if (!isLoading) {
      // 延迟隐藏启动页面，让用户看到完成状态
      const timer = setTimeout(() => {
        setShowSplash(false);
        onComplete?.();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, onComplete]);

  return {
    showSplash,
    isLoading,
    progress: isLoading ? 0 : 100
  };
};
