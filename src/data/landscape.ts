/** The homepage loss landscape: one basin per site section.
 *  Coordinates are fractions of the square figure; `depth` and `width` shape each Gaussian basin.
 *  `{n}` in a caption is replaced by the number of published projects. */
export interface Basin {
  key: string;
  href: string;
  label: string;
  caption: string;
  at: [number, number];
  depth: number;
  width: number;
  /** label offset below the basin centre, in basin widths (negative = above). Default 1.35. */
  labelDy?: number;
}

export const basins: Basin[] = [
  { key: 'work',  href: '/projects/',  label: 'Projects',      caption: '{n} projects, from GANs to medical imaging.', at: [0.31, 0.33], depth: 1.0,  width: 0.12, labelDy: -1.55 },
  { key: 'path',  href: '/path/',  label: 'Field Log', caption: 'studies and work, from Dauphine to AMIAD.',   at: [0.74, 0.27], depth: 0.85, width: 0.10 },
  { key: 'about', href: '/about/', label: 'About',     caption: 'why the part after training interests me.',   at: [0.29, 0.74], depth: 0.85, width: 0.10 },
  { key: 'now',   href: '/now/',   label: 'Now',       caption: 'what I am focused on this season.',          at: [0.72, 0.72], depth: 0.75, width: 0.09 },
  { key: 'notes', href: '/notes/', label: 'Notes',     caption: 'longer write-ups.',                          at: [0.53, 0.52], depth: 0.6,  width: 0.065 },
];

/** Where the ball rests before anyone touches it: high ground, between basins. */
export const ballStart: [number, number] = [0.53, 0.09];
