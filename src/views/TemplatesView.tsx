import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PromptTemplate } from '@/types';
import { TemplateBrowser } from '@/components/TemplateBrowser';
import { TemplateDetailDialog } from '@/components/TemplateDetailDialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { usePrompts } from '@/hooks/usePrompts';
import { toast } from 'sonner';

export function TemplatesView() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { addPrompt } = usePrompts();
  const language = i18n.language.startsWith('zh') ? 'zh' : 'en';

  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const handleSelectTemplate = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    setDetailDialogOpen(true);
  };

  const handleUseTemplate = async (template: PromptTemplate) => {
    try {
      const title = language === 'zh' ? template.title_zh : template.title_en;
      const content = language === 'zh' ? template.content_zh : template.content_en;

      const newPrompt = {
        id: `template-${Date.now()}`,
        title: title,
        content: content,
        category: 'general',
        tags: template.tags,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      };

      await addPrompt(newPrompt);
      toast.success(t('template.addedToPrompts'));
      navigate('/');
    } catch (error) {
      console.error('Error adding template as prompt:', error);
      toast.error(t('template.addError'));
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{t('template.title')}</h1>
          <p className="text-muted-foreground">{t('template.subtitle')}</p>
        </div>
      </div>

      <TemplateBrowser onSelectTemplate={handleSelectTemplate} />

      <TemplateDetailDialog
        template={selectedTemplate}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onUseTemplate={handleUseTemplate}
      />
    </div>
  );
}
