import zh from './zh.js';
import en from './en.js';

const translations = { zh, en };

export function useTranslation(lang) {
  return translations[lang] || translations.zh;
}