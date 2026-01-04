type Props = { src?: string; alt?: string; onClick?: () => void };

export function CardImage({ src, alt, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="h-32 w-20 cursor-pointer overflow-hidden rounded-md border border-slate-800 bg-slate-800/50"
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">Hidden</div>
      )}
    </div>
  );
}
