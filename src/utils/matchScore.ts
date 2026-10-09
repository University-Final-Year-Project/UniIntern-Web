import type { MatchSource } from '../types';

// The one place that decides what a score means on screen.
// Every screen uses these, so 84 is the same colour and wording everywhere.

export const STRONG_MIN = 85;
export const GOOD_MIN = 70;

export type MatchTier = 'strong' | 'good' | 'partial';

export const getMatchTier = (score: number): MatchTier => {
  if (score >= STRONG_MIN) return 'strong';
  if (score >= GOOD_MIN) return 'good';
  return 'partial';
};

export interface MatchTierStyle {
  label: string;
  // Tailwind classes. They are written out in full so Tailwind keeps them.
  text: string;
  bg: string;
  border: string;
  ring: string;
  // Hex colours for SVG strokes: one for white backgrounds, one for the navy panel.
  hex: string;
  hexOnDark: string;
}

export const MATCH_TIER_STYLES: Record<MatchTier, MatchTierStyle> = {
  strong: {
    label: 'Strong match',
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    ring: 'stroke-emerald-500',
    hex: '#10b981',
    hexOnDark: '#34d399',
  },
  good: {
    label: 'Good match',
    text: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    ring: 'stroke-amber-500',
    hex: '#f59e0b',
    hexOnDark: '#fbbf24',
  },
  partial: {
    label: 'Partial match',
    text: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    ring: 'stroke-red-500',
    hex: '#ef4444',
    hexOnDark: '#f87171',
  },
};

export const getMatchStyle = (score: number): MatchTierStyle =>
  MATCH_TIER_STYLES[getMatchTier(score)];

export const describeSource = (source: MatchSource): string =>
  source === 'FALLBACK'
    ? 'Estimated from skills overlap because the AI was not available'
    : 'Scored by AI from skills and course';

// Average of the scores that are ready. Returns null when there is nothing to average.
export const averageScore = (scores: Array<number | undefined>): number | null => {
  const ready = scores.filter((s): s is number => typeof s === 'number');
  if (ready.length === 0) return null;
  return Math.round(ready.reduce((sum, s) => sum + s, 0) / ready.length);
};