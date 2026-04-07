'use client';

import React, { useMemo, useState } from 'react';
import Box from '../Box';
import Typography from '../Typography';
import { resolvePostMediaUrl } from '@/utils';

export type PostImageProps = {
  src: string;
  alt?: string;
};

export function PostImage({ src, alt = 'Imagem do post' }: PostImageProps): React.JSX.Element {
  const resolvedSrc = useMemo(() => resolvePostMediaUrl(src), [src]);
  const [loadFailed, setLoadFailed] = useState(false);

  if (loadFailed) {
    return (
      <Box className="flex min-h-[120px] w-full items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6">
        <Typography variant="caption" className="text-center text-neutral-500">
          Imagem indisponível neste dispositivo (URL inválida, rede ou conteúdo bloqueado).
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="w-full min-w-0 overflow-hidden rounded-xl bg-neutral-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolvedSrc}
        alt={alt}
        className="mx-auto block h-auto w-full max-w-full object-contain [max-height:min(65vh,520px)]"
        loading="lazy"
        decoding="async"
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
        onError={() => setLoadFailed(true)}
      />
    </Box>
  );
}
