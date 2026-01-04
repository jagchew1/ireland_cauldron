import { PropsWithChildren } from 'react';

export function Card({ children }: PropsWithChildren) {
  return <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 shadow">{children}</div>;
}

export function CardHeader({ children }: PropsWithChildren) {
  return <div className="mb-2 text-lg font-semibold">{children}</div>;
}

export function CardContent({ children }: PropsWithChildren) {
  return <div className="text-sm text-slate-200">{children}</div>;
}
