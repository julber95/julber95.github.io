/** Two languages: English at the root, French under /fr/. */
export type Lang = 'en' | 'fr';

export const langOf = (url: URL | string): Lang => {
  const p = typeof url === 'string' ? url : url.pathname;
  return p === '/fr' || p.startsWith('/fr/') ? 'fr' : 'en';
};

/** Paths that exist in French. Anything else (notes, plate 0) stays in English. */
const hasFr = (path: string) => /^\/(projects\/.*|background\/|about\/|contact\/)?$/.test(path);

/** An English href, as seen from a page in `lang`. */
export const localize = (href: string, lang: Lang) =>
  lang === 'fr' && href.startsWith('/') && hasFr(href) ? `/fr${href}` : href;

/** The same page in the other language (or that language's home when it has no twin). */
export const otherLang = (pathname: string): { lang: Lang; href: string } => {
  const path = pathname.endsWith('/') ? pathname : pathname + '/';
  if (langOf(path) === 'fr') return { lang: 'en', href: path.replace(/^\/fr/, '') || '/' };
  return { lang: 'fr', href: hasFr(path) ? `/fr${path}` : '/fr/' };
};

const dict = {
  // chrome
  'site.title': { en: 'AI/ML student, Paris', fr: 'Étudiant en IA/ML, Paris' },
  'site.description': {
    en: 'Julien Bernardi, AI/ML student at Université PSL and AI engineer at AMIAD. Passionate about artificial intelligence: generative models, NLP, medical imaging.',
    fr: 'Julien Bernardi, étudiant en IA/ML à l’Université PSL et ingénieur IA à l’AMIAD. Passionné d’intelligence artificielle : modèles génératifs, NLP, imagerie médicale.',
  },
  'skip': { en: 'Skip to contents', fr: 'Aller au contenu' },
  'home': { en: 'Home', fr: 'Accueil' },
  'dark': { en: 'Dark mode', fr: 'Mode sombre' },
  'contents': { en: 'Contents', fr: 'Sommaire' },
  'close': { en: 'Close', fr: 'Fermer' },
  'errata.open': { en: 'Errata & directions for use', fr: 'Errata & mode d’emploi' },
  'lang.switch': { en: 'Version française', fr: 'English version' },
  'kicker': { en: 'AI / ML student · Paris', fr: 'Étudiant IA / ML · Paris' },
  'place': { en: 'Paris region', fr: 'Île-de-France' },
  'contact': { en: 'Contact', fr: 'Contact' },
  'nav.Index': { en: 'Index', fr: 'Accueil' },
  'nav.Projects': { en: 'Projects', fr: 'Projets' },
  'nav.Background': { en: 'Background', fr: 'Parcours' },
  'nav.About': { en: 'About', fr: 'À propos' },
  'nav.Notes': { en: 'Notes', fr: 'Notes' },
  'nav.Contact': { en: 'Contact', fr: 'Contact' },

  // domains, teams
  'dom.Generative': { en: 'Generative', fr: 'Génératif' },
  'dom.NLP': { en: 'NLP', fr: 'NLP' },
  'dom.Medical': { en: 'Medical', fr: 'Médical' },
  'dom.Tabular': { en: 'Tabular', fr: 'Tabulaire' },
  'dom.Meta': { en: 'Meta', fr: 'Méta' },
  'team.solo': { en: 'solo', fr: 'seul' },
  'team.team of four': { en: 'team of four', fr: 'équipe de quatre' },
  'project': { en: 'Project', fr: 'Projet' },
} as const;

export type Key = keyof typeof dict;
export const t = (lang: Lang, key: Key) => dict[key][lang];

/** Pick the string for `lang` from an inline pair. */
export const tr = <T>(lang: Lang, pair: { en: T; fr: T }) => pair[lang];
