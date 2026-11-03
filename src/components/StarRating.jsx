import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StarRating({ value = 0, onChange, size = 20, readOnly = false, showValue = false }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.round(display);
          const half = !filled && star - 0.5 <= display;
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => !readOnly && onChange?.(star)}
              onMouseEnter={() => !readOnly && setHover(star)}
              onMouseLeave={() => !readOnly && setHover(0)}
              className={cn('transition-transform', !readOnly && 'hover:scale-110 cursor-pointer')}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                size={size}
                className={cn(filled || half ? 'fill-[#FFD700] text-[#FFD700]' : 'fill-none text-black/20')}
                strokeWidth={1.5}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-black/70 ml-1">
          {value > 0 ? value.toFixed(1) : '—'}
        </span>
      )}
    </div>
  );
}