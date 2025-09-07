import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/ui/icons';
import { useTranslation } from 'react-i18next';

interface LoadingTask {
  id: string;
  name: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  progress?: number;
}

interface SplashScreenProps {
  isLoading?: boolean;
  progress?: number;
  currentTask?: string;
  tasks?: LoadingTask[];
  onComplete?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  isLoading = true,
  progress = 0,
  currentTask,
  tasks = [],
  onComplete 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const { t } = useTranslation();

  // 动态设置进度CSS变量
  useEffect(() => {
    document.documentElement.style.setProperty('--progress', `${progress / 100}`);
  }, [progress]);

  // 当加载完成时，延迟隐藏启动页面
  useEffect(() => {
    if (!isLoading && progress >= 100) {
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onComplete?.();
        }, 300); 
      }, 500);
    }
  }, [isLoading, progress, onComplete]);

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
        <div className="w-80 space-y-4 pt-4">
          {/* 当前任务显示 */}
          {currentTask && (
            <div className="text-center">
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                {currentTask}
              </p>
            </div>
          )}
          
          <div className="flex justify-between text-xs font-mono">
            {/* 加载文字颜色变化 */}
            <span className="text-neutral-600 dark:text-neutral-300">
              {isLoading ? t('splashScreen.loading') : t('splashScreen.completed')}
            </span>
            <span className="text-neutral-600 dark:text-neutral-300">{Math.round(progress)}%</span>
          </div>
          
          {/* 进度条轨道颜色变化 */}
          <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            {/* 进度条填充颜色变化 */}
            <div 
              className="h-full bg-neutral-800 dark:bg-white rounded-full transition-transform duration-300 ease-out progress-bar-fill"
            />
          </div>
          
          {/* 任务列表显示 */}
          {tasks.length > 0 && (
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-2 text-xs">
                  <div className="w-3 h-3 flex items-center justify-center">
                    {task.status === 'completed' && (
                      <Icons.check className="w-2 h-2 text-green-500" />
                    )}
                    {task.status === 'loading' && (
                      <Icons.loader className="w-2 h-2 animate-spin text-blue-500" />
                    )}
                    {task.status === 'error' && (
                      <Icons.x className="w-2 h-2 text-red-500" />
                    )}
                    {task.status === 'pending' && (
                      <div className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                    )}
                  </div>
                  <span className={cn(
                    "text-neutral-500 dark:text-neutral-400",
                    task.status === 'completed' && "text-green-600 dark:text-green-400",
                    task.status === 'error' && "text-red-600 dark:text-red-400"
                  )}>
                    {task.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SplashScreen;