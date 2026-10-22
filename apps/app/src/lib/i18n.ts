import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import en from '../locales/en.json';
import vi from '../locales/vi.json';

export type Lang = 'vi' | 'en';

const deviceLang = (): Lang => (getLocales()[0]?.languageCode === 'en' ? 'en' : 'vi');

void i18n.use(initReactI18next).init({
  resources: { vi: { translation: vi }, en: { translation: en } },
  lng: deviceLang(),
  fallbackLng: 'vi',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;

/** Ngôn ngữ hiện tại + hàm chọn chuỗi song ngữ trong dữ liệu mini-game. */
export function useLang() {
  const { t, i18n: inst } = useTranslation();
  const lang: Lang = inst.language === 'en' ? 'en' : 'vi';
  const L = (text: { vi: string; en: string } | undefined) => (text ? text[lang] : '');
  return { t, lang, L };
}
