export const site = {
  name: 'Julien Bernardi',
  title: 'AI/ML student, Paris',
  description:
    'Julien Bernardi, AI/ML student at Université PSL and AI engineer at AMIAD. Passionate about artificial intelligence: generative models, NLP, medical imaging.',
  url: 'https://julber95.github.io',
  email: 'julien.bernardi-pellegrino@dauphine.eu',
  github: 'https://github.com/julber95',
  linkedin: 'https://www.linkedin.com/in/julien-bernardi/',
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
  { href: '/projects/', label: 'Projects', key: 'p' },
  { href: '/background/', label: 'Background', key: 'b' },
  { href: '/about/', label: 'About', key: 'a' },
  { href: '/notes/', label: 'Notes', key: 'n' },
  { href: '/contact/', label: 'Contact', key: 'c' },
] as const;
