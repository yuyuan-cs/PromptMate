import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PromptTemplate } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Copy, Download, Star, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateDetailDialogProps {
  template: PromptTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseTemplate?: (template: PromptTemplate) => void;
}

export function TemplateDetailDialog({
  template,
  open,
  onOpenChange,
  onUseTemplate,
}: TemplateDetailDialogProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.startsWith('zh') ? 'zh' : 'en';

  const [copying, setCopying] = useState(false);

  if (!template) return null;

  const title = language === 'zh' ? template.title_zh : template.title_en;
  const description = language === 'zh' ? template.description_zh : template.description_en;
  const content = language === 'zh' ? template.content_zh : template.content_en;

  const handleCopy = async () => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(content);
      toast.success(t('template.copySuccess'));
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error(t('template.copyError'));
    } finally {
      setCopying(false);
    }
  };

  const handleUseTemplate = () => {
    onUseTemplate?.(template);
    onOpenChange(false);
    toast.success(t('template.useSuccess'));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{title}</DialogTitle>
              <DialogDescription className="mt-2">
                {description}
              </DialogDescription>
            </div>
            {template.is_featured && (
              <Star className="w-5 h-5 text-yellow-500 fill-current ml-2" />
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {template.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            {template.usage_count > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>{t('template.usageCount', { count: template.usage_count })}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span>{t('template.version')}: v{template.version}</span>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <ScrollArea className="flex-1 mt-4">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">{t('template.content')}</h4>
              <div className="p-4 bg-muted rounded-lg">
                <pre className="whitespace-pre-wrap text-sm font-mono">{content}</pre>
              </div>
            </div>
          </div>
        </ScrollArea>

        <Separator />

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCopy} disabled={copying}>
            <Copy className="w-4 h-4 mr-2" />
            {t('template.copy')}
          </Button>
          <Button onClick={handleUseTemplate}>
            <Download className="w-4 h-4 mr-2" />
            {t('template.useTemplate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
