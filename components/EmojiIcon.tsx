'use client';

import { useEffect, useRef } from 'react';
import twemoji from 'twemoji';

interface EmojiIconProps {
  emoji: string;
  size?: number;
  className?: string;
}

/**
 * Componente que renderiza emojis com visual 3D do Twitter (Twemoji)
 * Substitui emojis padrão por imagens SVG bonitas e estilizadas
 */
export function EmojiIcon({ emoji, size = 24, className = '' }: EmojiIconProps) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (spanRef.current) {
      // Converte emoji para imagem Twemoji
      twemoji.parse(spanRef.current, {
        folder: 'svg',
        ext: '.svg',
        base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/'
      });
    }
  }, [emoji]);

  return (
    <span 
      ref={spanRef}
      className={`emoji-icon ${className}`}
      style={{
        fontSize: `${size}px`,
        display: 'inline-block',
        lineHeight: 1,
      }}
    >
      {emoji}
    </span>
  );
}
