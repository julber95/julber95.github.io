/** Tools & methods, grouped (About page). */
export interface Skill { name: string }
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
      { name: 'Generative adversarial networks' },
      { name: 'Recurrent networks, LSTM' },
      { name: 'Transformers' },
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
