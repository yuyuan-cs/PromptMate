/**
 * 系统字体选择器组件
 * 支持检测和选择用户系统中已安装的字体
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/hooks/use-toast';
import { fontDetector, SystemFont, FontCategory, FONT_CATEGORIES } from '@/lib/fontDetector';
import { useTranslation } from 'react-i18next';

interface SystemFontSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFont?: string;
  onFontSelect: (font: string) => void;
  title?: string;
}

export function SystemFontSelector({
  open,
  onOpenChange,
  currentFont = 'system-ui',
  onFontSelect,
  title
}: SystemFontSelectorProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [fonts, setFonts] = useState<SystemFont[]>([]);
  const [categories, setCategories] = useState<FontCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewText, setPreviewText] = useState('The quick brown fox jumps over the lazy dog. 敏捷的棕色狐狸跳过懒狗。');

  // 检测系统字体
  useEffect(() => {
    if (open && fonts.length === 0) {
      detectFonts();
    }
  }, [open, fonts.length]);

  const detectFonts = async () => {
    setIsLoading(true);
    try {
      const detectedFonts = await fontDetector.detectSystemFonts();
      setFonts(detectedFonts);
      
      const fontCategories = fontDetector.categorizeFonts(detectedFonts);
      setCategories(fontCategories);
      
      toast({
        title: t('font.detectionSuccess'),
        description: t('font.detectionSuccessDesc', { count: detectedFonts.length }),
        variant: 'success'
      });
    } catch (error) {
      console.error('字体检测失败:', error);
      toast({
        title: t('font.detectionFailed'),
        description: t('font.detectionFailedDesc'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 过滤字体
  const filteredFonts = useMemo(() => {
    let filtered = fonts;

    // 按分类过滤
    if (selectedCategory !== 'all') {
      const category = categories.find(cat => cat.name === selectedCategory);
      if (category) {
        filtered = category.fonts;
      }
    }

    // 按搜索词过滤
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(font => 
        font.family.toLowerCase().includes(term) ||
        font.fullName.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [fonts, categories, selectedCategory, searchTerm]);

  // 处理字体选择
  const handleFontSelect = (font: SystemFont) => {
    onFontSelect(font.family);
    onOpenChange(false);
    
    toast({
      title: t('font.fontSelected'),
      description: t('font.fontSelectedDesc', { font: font.family }),
      variant: 'success'
    });
  };

  // 渲染字体项
  const renderFontItem = (font: SystemFont) => (
    <div
      key={font.family}
      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={() => handleFontSelect(font)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span 
            className="font-medium truncate"
            style={{ fontFamily: font.family }}
          >
            {font.family}
          </span>
          {font.system && (
            <Badge variant="secondary" className="text-xs">
              {t('font.system')}
            </Badge>
          )}
          {font.monospace && (
            <Badge variant="outline" className="text-xs">
              {t('font.monospace')}
            </Badge>
          )}
        </div>
        
        <div 
          className="text-sm text-muted-foreground truncate"
          style={{ fontFamily: font.family }}
        >
          {previewText}
        </div>
      </div>
      
      <div className="flex items-center gap-2 ml-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setPreviewText(prev => prev === previewText ? 'AaBbCcDdEeFfGg' : previewText);
          }}
        >
          <Icons.refresh className="h-4 w-4" />
        </Button>
        
        {currentFont === font.family && (
          <Icons.check className="h-4 w-4 text-primary" />
        )}
      </div>
    </div>
  );

  // 渲染分类标签
  const renderCategoryTabs = () => (
    <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
      <TabsTrigger value="all" className="text-xs">
        {t('font.all')}
      </TabsTrigger>
      {categories.map(category => (
        <TabsTrigger key={category.name} value={category.name} className="text-xs">
          {t(`font.category.${category.name.toLowerCase().replace(/\s+/g, '')}`)}
        </TabsTrigger>
      ))}
    </TabsList>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Icons.font className="h-5 w-5" />
            {title || t('font.selectSystemFont')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-6 pt-4">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            {/* 搜索和分类 */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="font-search">{t('font.search')}</Label>
                  <Input
                    id="font-search"
                    placeholder={t('font.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={detectFonts}
                    disabled={isLoading}
                  >
                    <Icons.refresh className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    {t('font.redetect')}
                  </Button>
                </div>
              </div>

              {renderCategoryTabs()}
            </div>

            {/* 字体列表 */}
            <TabsContent value={selectedCategory} className="mt-0">
              <ScrollArea className="h-[50vh]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="flex items-center gap-2">
                      <Icons.loader className="h-4 w-4 animate-spin" />
                      <span>{t('font.detecting')}</span>
                    </div>
                  </div>
                ) : filteredFonts.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <Icons.font className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm ? t('font.noSearchResults') : t('font.noFontsFound')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredFonts.map(renderFontItem)}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="p-6 pt-0">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {t('font.totalFonts', { count: fonts.length })}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={() => onFontSelect('system-ui')}>
                {t('font.useDefault')}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SystemFontSelector;

