export const site = {
  name: 'Julien Bernardi',
  title: 'An Atlas of Learned Things',
  description:
    'Julien Bernardi — AI/ML student at Université PSL. An atlas of machine-learning models taken apart: generative models, NLP, medical imaging, tabular learning.',
  url: 'https://julber95.github.io',
  email: 'julien.bernardi-pellegrino@dauphine.eu',
  github: 'https://github.com/julber95',
  linkedin: 'https://www.linkedin.com/in/julien-bernardi-746140252/',
  place: 'Paris region, France',
  coords: '48.85°N 2.35°E',
  status: [
    { label: 'M2 IASD', at: 'PSL' },
    { label: 'AI engineer', at: 'AMIAD' },
  ],
  established: 2026,
};

export const nav = [
  { n: '§1', href: '/', label: 'Index', key: 'i' },
  { n: '§2', href: '/work/', label: 'Plates', key: 'w' },
  { n: '§3', href: '/path/', label: 'Field Log', key: 'p' },
  { n: '§4', href: '/about/', label: 'About', key: 'a' },
  { n: '§5', href: '/now/', label: 'Now', key: 'o' },
  { n: '§6', href: '/notes/', label: 'Notes', key: 'n' },
] as const;
