export const site = {
  name: 'Julien Bernardi',
  title: 'AI/ML student, Paris',
  description:
    'Julien Bernardi, AI/ML student at Université PSL and AI engineer at AMIAD. Passionate about artificial intelligence: generative models, NLP, medical imaging.',
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
  { href: '/', label: 'Index', key: 'i' },
  { href: '/work/', label: 'Work', key: 'w' },
  { href: '/path/', label: 'Field Log', key: 'p' },
  { href: '/about/', label: 'About', key: 'a' },
  { href: '/now/', label: 'Now', key: 'o' },
  { href: '/notes/', label: 'Notes', key: 'n' },
] as const;
