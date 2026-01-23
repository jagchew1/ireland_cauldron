import { useState, useRef, useEffect } from 'react';
import { getCardEffect } from '../../lib/cardData';

type Props = { 
  src?: string; 
  alt?: string; 
  onClick?: () => void; 
  className?: string;
  cardName?: string;
};

export function CardImage({ src, alt, onClick, className = '', cardName }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const cardEffect = cardName ? getCardEffect(cardName) : null;

  useEffect(() => {
    // Detect if device supports touch
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    // Close tooltip when clicking outside
    if (!showTooltip || !isTouchDevice) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTooltip, isTouchDevice]);

  const handleInteraction = () => {
    if (isTouchDevice) {
      if (showTooltip) {
        // Second tap - play the card
        setShowTooltip(false);
        onClick?.();
      } else {
        // First tap - show tooltip
        setShowTooltip(true);
      }
    } else {
      // Desktop - click plays immediately
      onClick?.();
    }
  };

  return (
    <div 
      ref={cardRef}
      className="relative"
      onMouseEnter={() => !isTouchDevice && setShowTooltip(true)}
      onMouseLeave={() => !isTouchDevice && setShowTooltip(false)}
    >
      <div
        onClick={handleInteraction}
        className={`h-40 w-28 overflow-hidden rounded-md border border-slate-800 bg-slate-800/50 ${className}`}
      >
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">Hidden</div>
        )}
      </div>
      
      {showTooltip && cardEffect && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm shadow-xl">
          <div className="mb-2 font-bold text-slate-200">{cardEffect.name}</div>
          <div className="space-y-1 text-slate-300">
            <div>
              <span className="font-semibold text-blue-400">Primary:</span> {cardEffect.primary}
            </div>
            <div>
              <span className="font-semibold text-purple-400">Secondary:</span> {cardEffect.secondary}
            </div>
          </div>
          {/* Arrow pointer */}
          <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </div>
  );
}
