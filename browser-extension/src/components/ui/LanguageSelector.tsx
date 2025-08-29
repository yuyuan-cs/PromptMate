import React from 'react';
import { useTranslation, getSupportedLanguages, setLanguage, getCurrentLanguage } from '../../i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

export function LanguageSelector() {
  const { t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = React.useState(getCurrentLanguage());
  
  const languages = getSupportedLanguages();

  // Listen for language changes from other components
  React.useEffect(() => {
    const updateCurrentLanguage = () => {
      setCurrentLanguage(getCurrentLanguage());
    };
    
    // Check for language changes periodically
    const interval = setInterval(updateCurrentLanguage, 100);
    
    return () => clearInterval(interval);
  }, []);

  const handleLanguageChange = (languageCode: string) => {
    setLanguage(languageCode);
    setCurrentLanguage(languageCode);
    // No need to reload - the reactive i18n system will update the UI automatically
  };

  const currentLang = languages.find(lang => 
    currentLanguage.startsWith(lang.code.split('-')[0])
  ) || languages[0];

  return (
    <Select value={currentLang.code} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue>
          <div className="flex items-center gap-2">
            <span>{currentLang.flag}</span>
            <span className="text-sm">{currentLang.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <div className="flex items-center gap-2">
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
