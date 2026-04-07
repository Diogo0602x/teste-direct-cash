'use client';

import React from 'react';
import Box from '../Box';

export type PostImageProps = {
  src: string;
  alt?: string;
};

/**
 * Imagem de post no feed: mostra a foto inteira (sem crop agressivo), com largura até
 * a do card e altura máxima limitada — similar ao Instagram.
 */
export function PostImage({ src, alt = 'Imagem do post' }: PostImageProps): React.JSX.Element {
  return (
    <Box className="w-full min-w-0 overflow-hidden rounded-xl bg-neutral-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="mx-auto block h-auto w-full max-w-full object-contain [max-height:min(65vh,520px)]"
        loading="lazy"
        decoding="async"
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    </Box>
  );
}
