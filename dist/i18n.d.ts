export declare const LANGS: readonly ["ja", "en", "zh"];
export type Lang = typeof LANGS[number];
export declare const I18N: Record<Lang, Record<string, string>>;
export declare function getDefaultLang(): Lang;
export declare function t(key: string, lang: Lang, fallback?: string): string;
