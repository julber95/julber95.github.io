/** Tools & methods, grouped (About page). */
/** `fr`: the French name, when it differs. */
export interface Skill { name: string; fr?: string }
export const skills: { group: string; fr?: string; items: Skill[] }[] = [
  { group: 'Languages', fr: 'Langages', items: [{ name: 'Python' }, { name: 'C' }, { name: 'SQL' }, { name: 'R' }] },
  {
    group: 'Libraries', fr: 'Bibliothèques',
    items: [
      { name: 'PyTorch' }, { name: 'PyTorch Lightning' }, { name: 'scikit-learn' }, { name: 'NumPy' },
      { name: 'pandas' }, { name: 'Hugging Face' }, { name: 'Captum' }, { name: 'XGBoost' },
    ],
  },
  {
    group: 'Architectures',
    items: [
      { name: 'Convolutional networks', fr: 'Réseaux convolutifs' }, { name: 'Encoder–decoders', fr: 'Encodeurs–décodeurs' },
      { name: 'Generative adversarial networks', fr: 'Réseaux antagonistes génératifs' },
      { name: 'Recurrent networks, LSTM', fr: 'Réseaux récurrents, LSTM' },
      { name: 'Transformers' },
    ],
  },
  {
    group: 'Practice', fr: 'Pratique',
    items: [
      { name: 'MLflow' }, { name: 'Hydra' }, { name: 'Docker' }, { name: 'Git' }, { name: 'Conda' }, { name: 'uv' },
      { name: 'Linux & shell', fr: 'Linux & shell' }, { name: 'Argo Workflows' },
    ],
  },
  {
    group: 'Mathematics', fr: 'Mathématiques',
    items: [
      { name: 'Statistics & hypothesis testing', fr: 'Statistiques & tests d’hypothèses' }, { name: 'Bayesian methods', fr: 'Méthodes bayésiennes' }, { name: 'Time series', fr: 'Séries temporelles' },
      { name: 'Linear programming', fr: 'Programmation linéaire' }, { name: 'Optimisation', fr: 'Optimisation' },
    ],
  },
];
