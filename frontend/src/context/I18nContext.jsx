import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { I18nextProvider, useTranslation as useI18nextTranslation } from 'react-i18next';
import i18n from '../i18n/config';

const I18nExtraContext = createContext(null);

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => i18n.resolvedLanguage || 'en');

  useEffect(() => {
    const handleLanguageChanged = (lng) => setLanguage(lng);
    i18n.on('languageChanged', handleLanguageChanged);
    return () => i18n.off('languageChanged', handleLanguageChanged);
  }, []);

  const changeLanguage = async (lng) => {
    await i18n.changeLanguage(lng);
    setLanguage(i18n.resolvedLanguage || lng);
  };

  const availableLanguages = useMemo(() => {
    const resources = i18n.options?.resources || {};
    const keys = Object.keys(resources);
    return keys.length ? keys : ['en', 'es', 'fr', 'de'];
  }, []);

  const extra = { language, changeLanguage, availableLanguages };

  return (
    <I18nextProvider i18n={i18n}>
      <I18nExtraContext.Provider value={extra}>{children}</I18nExtraContext.Provider>
    </I18nextProvider>
  );
};

export const useTranslation = () => {
  const { t } = useI18nextTranslation();
  const extras = useContext(I18nExtraContext);
  if (!extras) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return { t, ...extras };
};

