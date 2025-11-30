import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TemplateService } from '@/services/templateService';
import { AuthService } from '@/services/authService';
import { TemplateCategory, PromptTemplate } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Upload, X, Plus } from 'lucide-react';

interface TemplateUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TemplateUploadDialog({ open, onOpenChange, onSuccess }: TemplateUploadDialogProps) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [form, setForm] = useState({
    category_id: '',
    title_zh: '',
    title_en: '',
    content_zh: '',
    content_en: '',
    description_zh: '',
    description_en: '',
    tags: [] as string[],
    is_featured: false,
    is_active: true,
    sort_order: 0,
    version: 1,
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (open) {
      loadCategories();
      loadCurrentUser();
    }
  }, [open]);

  const loadCategories = async () => {
    try {
      const data = await TemplateService.getCategories();
      setCategories(data);
      if (data.length > 0 && !form.category_id) {
        setForm({ ...form, category_id: data[0].id });
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error(t('template.loadCategoriesError'));
    }
  };

  const loadCurrentUser = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    const newTag = tagInput.trim();
    if (!form.tags.includes(newTag)) {
      setForm({ ...form, tags: [...form.tags, newTag] });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter(t => t !== tag) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error(t('auth.pleaseLoginFirst'));
      return;
    }

    if (!form.category_id || !form.title_zh || !form.title_en || !form.content_zh || !form.content_en) {
      toast.error(t('template.pleaseEnterRequiredFields'));
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await TemplateService.createTemplate(form);

      if (error) {
        toast.error(t('template.uploadFailed') + ': ' + error.message);
        return;
      }

      if (data) {
        toast.success(t('template.uploadSuccess'));
        onOpenChange(false);
        resetForm();
        onSuccess?.();
      }
    } catch (error) {
      console.error('Upload template error:', error);
      toast.error(t('template.uploadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      category_id: categories.length > 0 ? categories[0].id : '',
      title_zh: '',
      title_en: '',
      content_zh: '',
      content_en: '',
      description_zh: '',
      description_en: '',
      tags: [],
      is_featured: false,
      is_active: true,
      sort_order: 0,
      version: 1,
    });
    setTagInput('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            {t('template.uploadTemplate')}
          </DialogTitle>
          <DialogDescription>
            {t('template.uploadDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">{t('template.category')} *</Label>
            <Select
              value={form.category_id}
              onValueChange={(value) => setForm({ ...form, category_id: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('template.selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {i18n.language.startsWith('zh') ? category.name_zh : category.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title-zh">{t('template.titleZh')} *</Label>
              <Input
                id="title-zh"
                value={form.title_zh}
                onChange={(e) => setForm({ ...form, title_zh: e.target.value })}
                placeholder={t('template.titleZhPlaceholder')}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title-en">{t('template.titleEn')} *</Label>
              <Input
                id="title-en"
                value={form.title_en}
                onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                placeholder={t('template.titleEnPlaceholder')}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content-zh">{t('template.contentZh')} *</Label>
            <Textarea
              id="content-zh"
              value={form.content_zh}
              onChange={(e) => setForm({ ...form, content_zh: e.target.value })}
              placeholder={t('template.contentZhPlaceholder')}
              rows={5}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content-en">{t('template.contentEn')} *</Label>
            <Textarea
              id="content-en"
              value={form.content_en}
              onChange={(e) => setForm({ ...form, content_en: e.target.value })}
              placeholder={t('template.contentEnPlaceholder')}
              rows={5}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description-zh">{t('template.descriptionZh')}</Label>
              <Textarea
                id="description-zh"
                value={form.description_zh}
                onChange={(e) => setForm({ ...form, description_zh: e.target.value })}
                placeholder={t('template.descriptionZhPlaceholder')}
                rows={2}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description-en">{t('template.descriptionEn')}</Label>
              <Textarea
                id="description-en"
                value={form.description_en}
                onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                placeholder={t('template.descriptionEnPlaceholder')}
                rows={2}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">{t('template.tags')}</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder={t('template.tagsPlaceholder')}
                disabled={loading}
              />
              <Button
                type="button"
                onClick={handleAddTag}
                disabled={loading || !tagInput.trim()}
                size="icon"
                variant="outline"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is-featured"
              checked={form.is_featured}
              onCheckedChange={(checked) => setForm({ ...form, is_featured: checked })}
              disabled={loading}
            />
            <Label htmlFor="is-featured">{t('template.isFeatured')}</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('template.uploading')}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {t('template.upload')}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
