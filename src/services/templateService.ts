import { supabase, isSupabaseEnabled } from './supabaseClient';
import { PromptTemplate, TemplateCategory } from '@/types';

const CACHE_KEY_CATEGORIES = 'template_categories_cache';
const CACHE_KEY_TEMPLATES = 'prompt_templates_cache';
const CACHE_KEY_TIMESTAMP = 'template_cache_timestamp';
const CACHE_DURATION = 1000 * 60 * 60;

export class TemplateService {
  private static categoriesCache: TemplateCategory[] = [];
  private static templatesCache: PromptTemplate[] = [];
  private static lastFetchTime = 0;

  static async getCategories(forceRefresh = false): Promise<TemplateCategory[]> {
    if (!isSupabaseEnabled) {
      console.warn('Supabase not enabled');
      return [];
    }

    const now = Date.now();
    const shouldRefresh = forceRefresh || now - this.lastFetchTime > CACHE_DURATION;

    if (!shouldRefresh && this.categoriesCache.length > 0) {
      return this.categoriesCache;
    }

    try {
      const cachedData = localStorage.getItem(CACHE_KEY_CATEGORIES);
      const cachedTimestamp = localStorage.getItem(CACHE_KEY_TIMESTAMP);

      if (!forceRefresh && cachedData && cachedTimestamp) {
        const cacheAge = now - parseInt(cachedTimestamp);
        if (cacheAge < CACHE_DURATION) {
          this.categoriesCache = JSON.parse(cachedData);
          return this.categoriesCache;
        }
      }

      const { data, error } = await supabase!
        .from('template_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching template categories:', error);
        return cachedData ? JSON.parse(cachedData) : [];
      }

      this.categoriesCache = data || [];
      this.lastFetchTime = now;

      localStorage.setItem(CACHE_KEY_CATEGORIES, JSON.stringify(this.categoriesCache));
      localStorage.setItem(CACHE_KEY_TIMESTAMP, now.toString());

      return this.categoriesCache;
    } catch (error) {
      console.error('Error in getCategories:', error);
      const cachedData = localStorage.getItem(CACHE_KEY_CATEGORIES);
      return cachedData ? JSON.parse(cachedData) : [];
    }
  }

  static async getTemplates(forceRefresh = false): Promise<PromptTemplate[]> {
    if (!isSupabaseEnabled) {
      console.warn('Supabase not enabled');
      return [];
    }

    const now = Date.now();
    const shouldRefresh = forceRefresh || now - this.lastFetchTime > CACHE_DURATION;

    if (!shouldRefresh && this.templatesCache.length > 0) {
      return this.templatesCache;
    }

    try {
      const cachedData = localStorage.getItem(CACHE_KEY_TEMPLATES);
      const cachedTimestamp = localStorage.getItem(CACHE_KEY_TIMESTAMP);

      if (!forceRefresh && cachedData && cachedTimestamp) {
        const cacheAge = now - parseInt(cachedTimestamp);
        if (cacheAge < CACHE_DURATION) {
          this.templatesCache = JSON.parse(cachedData);
          return this.templatesCache;
        }
      }

      const { data, error } = await supabase!
        .from('prompt_templates')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching prompt templates:', error);
        return cachedData ? JSON.parse(cachedData) : [];
      }

      this.templatesCache = data || [];
      this.lastFetchTime = now;

      localStorage.setItem(CACHE_KEY_TEMPLATES, JSON.stringify(this.templatesCache));
      localStorage.setItem(CACHE_KEY_TIMESTAMP, now.toString());

      return this.templatesCache;
    } catch (error) {
      console.error('Error in getTemplates:', error);
      const cachedData = localStorage.getItem(CACHE_KEY_TEMPLATES);
      return cachedData ? JSON.parse(cachedData) : [];
    }
  }

  static async getTemplatesByCategory(categoryId: string, forceRefresh = false): Promise<PromptTemplate[]> {
    const templates = await this.getTemplates(forceRefresh);
    return templates.filter(t => t.category_id === categoryId);
  }

  static async getFeaturedTemplates(forceRefresh = false): Promise<PromptTemplate[]> {
    const templates = await this.getTemplates(forceRefresh);
    return templates.filter(t => t.is_featured);
  }

  static async searchTemplates(query: string, language: 'zh' | 'en' = 'zh'): Promise<PromptTemplate[]> {
    const templates = await this.getTemplates();
    const searchQuery = query.toLowerCase();

    return templates.filter(template => {
      const title = language === 'zh' ? template.title_zh : template.title_en;
      const content = language === 'zh' ? template.content_zh : template.content_en;
      const description = language === 'zh' ? template.description_zh : template.description_en;

      return (
        title.toLowerCase().includes(searchQuery) ||
        content.toLowerCase().includes(searchQuery) ||
        description?.toLowerCase().includes(searchQuery) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery))
      );
    });
  }

  static async incrementUsageCount(templateId: string): Promise<void> {
    if (!isSupabaseEnabled) return;

    try {
      const template = this.templatesCache.find(t => t.id === templateId);
      if (template) {
        await supabase!
          .from('prompt_templates')
          .update({ usage_count: template.usage_count + 1 })
          .eq('id', templateId);

        template.usage_count += 1;
      }
    } catch (error) {
      console.error('Error incrementing usage count:', error);
    }
  }

  static clearCache(): void {
    this.categoriesCache = [];
    this.templatesCache = [];
    this.lastFetchTime = 0;
    localStorage.removeItem(CACHE_KEY_CATEGORIES);
    localStorage.removeItem(CACHE_KEY_TEMPLATES);
    localStorage.removeItem(CACHE_KEY_TIMESTAMP);
  }

  static async refreshCache(): Promise<void> {
    this.clearCache();
    await Promise.all([
      this.getCategories(true),
      this.getTemplates(true)
    ]);
  }

  static async createTemplate(template: Omit<PromptTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count'>): Promise<{ data: PromptTemplate | null; error: Error | null }> {
    if (!isSupabaseEnabled || !supabase) {
      return {
        data: null,
        error: new Error('Supabase is not enabled'),
      };
    }

    try {
      const { data, error } = await supabase
        .from('prompt_templates')
        .insert([{
          ...template,
          usage_count: 0,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating template:', error);
        return { data: null, error: new Error(error.message) };
      }

      this.clearCache();
      await this.getTemplates(true);

      return { data, error: null };
    } catch (error) {
      console.error('Error in createTemplate:', error);
      return { data: null, error: error as Error };
    }
  }

  static async updateTemplate(id: string, updates: Partial<Omit<PromptTemplate, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: PromptTemplate | null; error: Error | null }> {
    if (!isSupabaseEnabled || !supabase) {
      return {
        data: null,
        error: new Error('Supabase is not enabled'),
      };
    }

    try {
      const { data, error } = await supabase
        .from('prompt_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating template:', error);
        return { data: null, error: new Error(error.message) };
      }

      this.clearCache();
      await this.getTemplates(true);

      return { data, error: null };
    } catch (error) {
      console.error('Error in updateTemplate:', error);
      return { data: null, error: error as Error };
    }
  }

  static async deleteTemplate(id: string): Promise<{ error: Error | null }> {
    if (!isSupabaseEnabled || !supabase) {
      return {
        error: new Error('Supabase is not enabled'),
      };
    }

    try {
      const { error } = await supabase
        .from('prompt_templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting template:', error);
        return { error: new Error(error.message) };
      }

      this.clearCache();
      await this.getTemplates(true);

      return { error: null };
    } catch (error) {
      console.error('Error in deleteTemplate:', error);
      return { error: error as Error };
    }
  }

  static async getUserTemplates(userId: string): Promise<PromptTemplate[]> {
    if (!isSupabaseEnabled || !supabase) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('prompt_templates')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user templates:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserTemplates:', error);
      return [];
    }
  }
}
