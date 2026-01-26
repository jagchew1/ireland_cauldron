import { useEffect, useState } from 'react';

type Props = {
  expiresAt: number | null;
  phase: string;
};

export function CountdownTimer({ expiresAt, phase }: Props) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft(null);
      setIsExpired(false);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, expiresAt - now);
      setTimeLeft(Math.ceil(remaining / 1000));
      
      if (remaining <= 0 && !isExpired) {
        setIsExpired(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);

    return () => clearInterval(interval);
  }, [expiresAt, isExpired]);

  // Only show timer during NIGHT and DAY phases
  if (phase !== 'NIGHT' && phase !== 'DAY') return null;
  if (timeLeft === null) return null;

  const isLowTime = timeLeft <= 10;
  const phaseLabel = phase === 'NIGHT' ? 'Night Phase' : 'Discussion Time';

  return (
    <div className="flex items-center gap-2">
      <div className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
        isExpired 
          ? 'border-red-500 bg-red-900/30 text-red-400'
          : isLowTime 
          ? 'border-yellow-500 bg-yellow-900/30 text-yellow-400'
          : 'border-slate-600 bg-slate-800 text-slate-300'
      }`}>
        <span className="text-xs opacity-75 mr-1.5">{phaseLabel}</span>
        <span className="font-mono text-base">{timeLeft}s</span>
      </div>
    </div>
  );
}
