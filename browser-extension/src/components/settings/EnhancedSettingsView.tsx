import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@/i18n';
import { EnhancedSettings, ExtensionSettings } from '@/shared/types';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Icons } from '../ui/icons';

interface EnhancedSettingsViewProps {
  onBack: () => void;
}

const EnhancedSettingsView: React.FC<EnhancedSettingsViewProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<EnhancedSettings>({});

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const result = await chrome.storage.local.get('settings');
        if (result.settings && (result.settings as ExtensionSettings).enhancedSettings) {
          setSettings((result.settings as ExtensionSettings).enhancedSettings!);
        }
      } catch (error) {
        console.error('Failed to load enhanced settings:', error);
      }
    };
    loadSettings();
  }, []);

  const handleSettingChange = async (key: keyof EnhancedSettings, value: boolean) => {
    const newEnhancedSettings = { ...settings, [key]: value };
    setSettings(newEnhancedSettings);

    try {
      const result = await chrome.storage.local.get('settings');
      const existingSettings = (result.settings || {}) as ExtensionSettings;
      
      const updatedExtensionSettings: ExtensionSettings = {
        ...existingSettings,
        enhancedSettings: newEnhancedSettings,
      };

      await chrome.storage.local.set({ settings: updatedExtensionSettings });
    } catch (error) {
      console.error('Failed to save enhanced settings:', error);
    }
  };

  const features: { id: keyof EnhancedSettings; title: string; description: string }[] = [
    { id: 'enableContextMenu', title: t('feature_context_menu_title'), description: t('feature_context_menu_description') },
    { id: 'enableOmnibox', title: t('feature_omnibox_title'), description: t('feature_omnibox_description') },
    { id: 'enablePageSummary', title: t('feature_page_summary_title'), description: t('feature_page_summary_description') },
    { id: 'enableAutoActivate', title: t('feature_auto_activate_title'), description: t('feature_auto_activate_description') },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('enhanced_settings_title')}</CardTitle>
            <CardDescription>{t('enhanced_settings_description')}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onBack} className="h-7 text-xs">
            <Icons.chevronDown className="h-3 w-3 mr-1 rotate-90" />
            {t('common_back')}
          </Button>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-6">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>{t('enhanced_settings_warning_title')}</AlertTitle>
            <AlertDescription>{t('enhanced_settings_warning_content')}</AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('enhanced_settings_features_title')}</h3>
            <ul className="space-y-4">
              {features.map(feature => (
                <li key={feature.id} className="flex items-center justify-between p-4 border rounded-lg shadow-sm">
                  <div className="flex-1 pr-4">
                    <p className="font-semibold">{feature.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
                  </div>
                  <Switch 
                    id={feature.id} 
                    checked={settings[feature.id]}
                    onCheckedChange={(checked) => handleSettingChange(feature.id, checked)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedSettingsView;
