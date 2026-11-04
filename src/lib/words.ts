const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
/** 7 → "seven" (falls back to digits above twelve). */
export const numberWord = (n: number) => WORDS[n] ?? String(n);
export const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
