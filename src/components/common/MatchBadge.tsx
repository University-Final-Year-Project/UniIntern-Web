import { Sparkles } from 'lucide-react';
import type { ScoreEntry } from '../../services/matchScoreCache';
import { describeSource, getMatchStyle } from '../../utils/matchScore';

interface Props {
  entry: ScoreEntry;
  // pill: "85% Match" label. circle: round badge. ring: progress ring with the number inside.
  variant?: 'pill' | 'circle' | 'ring';
  // Size in pixels for circle and ring.
  size?: number;
  // Use lighter ring colours on the navy panel.
  onDark?: boolean;
  // Small "Match" or "Est. match" caption under circle badges.
  caption?: boolean;
}

const Spinner = ({ size }: { size: number }) => (
  <div
    className="rounded-full border-2 border-gray-200 flex items-center justify-center"
    style={{ width: size, height: size }}>
    <div className="w-3 h-3 border-2 border-navy border-t-transparent rounded-full animate-spin" />
  </div>
);

const MatchBadge = ({ entry, variant = 'pill', size, onDark = false, caption = false }: Props) => {
  const isReady = entry.status === 'ready' && entry.data;
  const isLoading = entry.status === 'loading' || entry.status === 'idle';

  if (!isReady) {
    const px = size ?? (variant === 'ring' ? 56 : 44);
    if (variant === 'pill') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
          {isLoading ? 'Scoring...' : 'Match unavailable'}
        </span>
      );
    }
    if (isLoading) return <Spinner size={px} />;
    return (
      <div
        title="Match score unavailable right now"
        className="rounded-full border-2 border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400"
        style={{ width: px, height: px }}>
        N/A
      </div>
    );
  }

  const { score, source } = entry.data!;
  const style = getMatchStyle(score);
  const estimated = source === 'FALLBACK';
  const title = `${style.label}. ${describeSource(source)}`;

  if (variant === 'pill') {
    return (
      <span
        title={title}
        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${style.text} ${style.bg} ${style.border}`}>
        <Sparkles className="w-3 h-3" />
        {score}% Match{estimated ? ' (est.)' : ''}
      </span>
    );
  }

  if (variant === 'circle') {
    const px = size ?? 44;
    return (
      <div className="flex items-center sm:flex-col gap-1 text-center" title={title}>
        <div
          className={`rounded-full border-2 flex items-center justify-center font-bold text-xs ${style.text} ${style.bg} ${style.border}`}
          style={{ width: px, height: px }}>
          {score}%
        </div>
        {caption && (
          <span className="text-[10px] font-bold text-navy flex items-center gap-0.5">
            <Sparkles className="w-3 h-3 text-teal" />
            {estimated ? 'Est. match' : 'Match'}
          </span>
        )}
      </div>
    );
  }

  // ring
  const px = size ?? 56;
  const r = 20;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(100, Math.max(0, score)) / 100);
  return (
    <div className="relative" style={{ width: px, height: px }} title={title}>
      <svg className="-rotate-90" style={{ width: px, height: px }} viewBox="0 0 50 50">
        <circle
          cx="25" cy="25" r={r} fill="none" strokeWidth="4"
          stroke={onDark ? 'rgba(255,255,255,0.15)' : '#e5e7eb'}
        />
        <circle
          cx="25" cy="25" r={r} fill="none" strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke={onDark ? style.hexOnDark : style.hex}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`font-bold ${onDark ? 'text-white' : style.text}`}
          style={{ fontSize: Math.max(10, Math.round(px / 4.6)) }}>
          {score}%
        </span>
      </div>
    </div>
  );
};

export default MatchBadge;