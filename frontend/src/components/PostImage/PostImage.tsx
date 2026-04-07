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
    <Box className="flex w-full justify-center overflow-hidden rounded-xl bg-neutral-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-auto max-h-[min(72vh,560px)] w-auto max-w-full object-contain"
        loading="lazy"
        decoding="async"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    </Box>
  );
}
