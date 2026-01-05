import { useUIStore } from '@/store/appStore';
import { t as translate, type Language } from '@/lib/i18n';
import { useCallback } from 'react';

export function useTranslation() {
  const { language, setLanguage } = useUIStore();

  const t = useCallback(
    (key: string): string => translate(key, language),
    [language]
  );

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'ro' ? 'en' : 'ro');
  }, [language, setLanguage]);

  return {
    t,
    language,
    setLanguage,
    toggleLanguage,
  };
}

export type { Language };
