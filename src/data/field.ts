/** Hand-placed cluster map for the specimen field (normalised 0–1 canvas coordinates).
 *  Desktop leaves the lower-left free for the headline; mobile stacks clusters in the upper half. */
export type Shape = 'ensemble' | 'house' | 'digits' | 'beamtree' | 'lymph' | 'aorta' | 'roots';

export interface ClusterSpec {
  id: string;           // plate collection id
  shape: Shape;
  r: number;            // radius as a fraction of min(width, height)
  d: [number, number];  // desktop centre
  m: [number, number];  // mobile centre
  label: 'nw' | 'ne' | 'sw' | 'se'; // which side the numeral sits on
}

export const clusters: ClusterSpec[] = [
  { id: '01-fraud-detection',                  shape: 'ensemble', r: 0.085, d: [0.12, 0.30], m: [0.22, 0.14], label: 'nw' },
  { id: '02-house-prices',                     shape: 'house',    r: 0.065, d: [0.29, 0.25], m: [0.76, 0.12], label: 'ne' },
  { id: '03-gan-drs',                          shape: 'digits',   r: 0.075, d: [0.45, 0.33], m: [0.21, 0.46], label: 'ne' },
  { id: '04-decoding-strategies',              shape: 'beamtree', r: 0.085, d: [0.58, 0.18], m: [0.74, 0.45], label: 'nw' },
  { id: '05-lymph-node-metastases',            shape: 'lymph',    r: 0.07,  d: [0.88, 0.22], m: [0.22, 0.60], label: 'ne' },
  { id: '06-aortic-aneurysm-hisa',             shape: 'aorta',    r: 0.095, d: [0.86, 0.62], m: [0.72, 0.60], label: 'se' },
  { id: '07-interpretable-text-classification', shape: 'roots',   r: 0.15,  d: [0.71, 0.40], m: [0.50, 0.29], label: 'nw' },
];
