import type { Lang } from '../i18n/ui';
const WORDS = {
  en: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'],
  fr: ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze'],
};
/** 7 → "seven" / "sept" (falls back to digits above twelve). */
export const numberWord = (n: number, lang: Lang = 'en') => WORDS[lang][n] ?? String(n);
export const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
