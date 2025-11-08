import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TemplateService } from '@/services/templateService';
import { PromptTemplate, TemplateCategory } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Star, TrendingUp, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateBrowserProps {
  onSelectTemplate?: (template: PromptTemplate) => void;
}

export function TemplateBrowser({ onSelectTemplate }: TemplateBrowserProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.startsWith('zh') ? 'zh' : 'en';

  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<PromptTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, selectedCategory, searchQuery, language]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, templatesData] = await Promise.all([
        TemplateService.getCategories(),
        TemplateService.getTemplates()
      ]);
      setCategories(categoriesData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading template data:', error);
      toast.error(t('template.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await TemplateService.refreshCache();
      await loadData();
      toast.success(t('template.refreshSuccess'));
    } catch (error) {
      console.error('Error refreshing templates:', error);
      toast.error(t('template.refreshError'));
    } finally {
      setRefreshing(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (selectedCategory === 'featured') {
      filtered = templates.filter(t => t.is_featured);
    } else if (selectedCategory !== 'all') {
      filtered = templates.filter(t => t.category_id === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => {
        const title = language === 'zh' ? template.title_zh : template.title_en;
        const description = language === 'zh' ? template.description_zh : template.description_en;
        return (
          title.toLowerCase().includes(query) ||
          description?.toLowerCase().includes(query) ||
          template.tags.some(tag => tag.toLowerCase().includes(query))
        );
      });
    }

    setFilteredTemplates(filtered);
  };

  const handleSelectTemplate = async (template: PromptTemplate) => {
    await TemplateService.incrementUsageCount(template.id);
    onSelectTemplate?.(template);
  };

  const getCategoryName = (category: TemplateCategory) => {
    return language === 'zh' ? category.name_zh : category.name_en;
  };

  const getTemplateTitle = (template: PromptTemplate) => {
    return language === 'zh' ? template.title_zh : template.title_en;
  };

  const getTemplateDescription = (template: PromptTemplate) => {
    return language === 'zh' ? template.description_zh : template.description_en;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('template.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <ScrollArea className="w-full">
          <TabsList className="inline-flex w-auto">
            <TabsTrigger value="all">
              {t('template.allCategories')}
            </TabsTrigger>
            <TabsTrigger value="featured">
              <Star className="w-4 h-4 mr-1" />
              {t('template.featured')}
            </TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id}>
                {getCategoryName(category)}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        <TabsContent value={selectedCategory} className="mt-4">
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map(template => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">
                        {getTemplateTitle(template)}
                      </CardTitle>
                      {template.is_featured && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {getTemplateDescription(template)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    {template.usage_count > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <TrendingUp className="w-3 h-3" />
                        <span>{t('template.usageCount', { count: template.usage_count })}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredTemplates.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                {t('template.noTemplates')}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
