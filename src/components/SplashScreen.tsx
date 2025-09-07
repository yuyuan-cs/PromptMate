import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/ui/icons';
import { useTranslation } from 'react-i18next';

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onComplete, 
  duration = 500 
}) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { t } = useTranslation();

  // 进度和消失逻辑保持不变
  useEffect(() => {
    const startTime = Date.now();
    let animationFrameId: number;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            onComplete?.();
          }, 300); 
        }, 500);
      } else {
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [duration, onComplete]);

  return (
    <div className={cn(
      "fixed inset-0 z-[9999]",
      // 核心颜色变化: 浅色模式为白底黑字，深色模式为黑底白字
      "bg-white text-neutral-900 dark:bg-black dark:text-white",
      "flex flex-col items-center justify-center",
      "transition-opacity duration-300 ease-in-out",
      isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      
      {/* 主要内容 */}
      <div className="flex flex-col items-center space-y-8">
        
        {/* Logo 和标题 */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-24 h-24 flex items-center justify-center">
            {/* 图标颜色会继承父元素的 text-color */}
            <Icons.fileText className="w-16 h-16 animate-pulse" style={{ animationDuration: '1.5s' }}/>
          </div>
          <h1 className="text-4xl font-bold tracking-wider">
            PromptMate
          </h1>
          {/* 副标题颜色变化 */}
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            {t('splashScreen.description')}
          </p>
        </div>

        {/* 进度条和状态 */}
        <div className="w-64 space-y-3 pt-4">
          <div className="flex justify-between text-xs font-mono">
            {/* 加载文字颜色变化 */}
            <span className="text-neutral-600 dark:text-neutral-300">{t('splashScreen.loading')}...</span>
            <span className="text-neutral-600 dark:text-neutral-300">{Math.round(progress)}%</span>
          </div>
          {/* 进度条轨道颜色变化 */}
          <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            {/* 进度条填充颜色变化 */}
            <div 
              className="h-full bg-neutral-800 dark:bg-white rounded-full transition-transform duration-300 ease-out"
              style={{ transform: `scaleX(${progress / 100})`, transformOrigin: 'left' }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default SplashScreen;