/** Index of Instruments (About page). Each entry cites the plates where it was used:
 *  matched by name against plate `stack` arrays, or listed explicitly with `plates`. */
export interface Skill { name: string; plates?: string[] } // plates: explicit numerals; otherwise matched by name in plate stacks
export const skills: { group: string; items: Skill[] }[] = [
  { group: 'Languages', items: [{ name: 'Python' }, { name: 'C' }, { name: 'SQL' }, { name: 'R' }] },
  {
    group: 'Libraries',
    items: [
      { name: 'PyTorch' }, { name: 'PyTorch Lightning' }, { name: 'scikit-learn' }, { name: 'NumPy' },
      { name: 'pandas' }, { name: 'Hugging Face' }, { name: 'Captum' }, { name: 'XGBoost' },
    ],
  },
  {
    group: 'Architectures',
    items: [
      { name: 'Convolutional networks' }, { name: 'Encoder–decoders' },
      { name: 'Generative adversarial networks', plates: ['III'] },
      { name: 'Recurrent networks, LSTM', plates: ['IV'] },
      { name: 'Transformers', plates: ['VII'] },
    ],
  },
  {
    group: 'Practice',
    items: [
      { name: 'MLflow' }, { name: 'Hydra' }, { name: 'Docker' }, { name: 'Git' }, { name: 'Conda' }, { name: 'uv' },
      { name: 'Linux & shell' }, { name: 'Argo Workflows' },
    ],
  },
  {
    group: 'Mathematics',
    items: [
      { name: 'Statistics & hypothesis testing' }, { name: 'Bayesian methods' }, { name: 'Time series' },
      { name: 'Linear programming' }, { name: 'Optimisation' },
    ],
  },
];
