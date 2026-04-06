'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import Box from '../Box';
import Typography from '../Typography';

type ImageUploadProps = {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  shape?: 'square' | 'circle';
  size?: 'sm' | 'md' | 'lg';
};

const SIZE_MAP = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
};

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label,
  className = '',
  shape = 'square',
  size = 'md',
}) => {
  const [inputValue, setInputValue] = useState(value ?? '');
  const [previewError, setPreviewError] = useState(false);

  const roundedClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl';
  const sizeClass = SIZE_MAP[size];

  const handleChange = (url: string): void => {
    setInputValue(url);
    setPreviewError(false);
    onChange(url);
  };

  const handleClear = (): void => {
    setInputValue('');
    setPreviewError(false);
    onChange('');
  };

  const showPreview = !!value && !previewError;

  return (
    <Box className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <Typography variant="caption" weight="medium" className="text-neutral-600">
          {label}
        </Typography>
      )}
      <Box className="flex items-center gap-3">
        <Box
          className={`relative ${sizeClass} ${roundedClass} border-2 border-dashed border-neutral-200 bg-neutral-50 overflow-hidden flex items-center justify-center flex-shrink-0`}
        >
          {showPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value!}
              alt="Preview"
              className={`h-full w-full object-cover ${roundedClass}`}
              onError={() => setPreviewError(true)}
            />
          ) : (
            <ImageIcon size={20} className="text-neutral-300" />
          )}
        </Box>

        <Box className="flex flex-1 flex-col gap-1">
          <Box className="flex items-center gap-1">
            <input
              type="url"
              value={inputValue}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Cole a URL da imagem..."
              className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-700 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 placeholder:text-neutral-400"
            />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 hover:bg-red-50 hover:text-red-500 text-neutral-400 transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </Box>
          {previewError && (
            <Typography variant="caption" className="text-amber-500 text-xs">
              URL inválida ou imagem inacessível.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

ImageUpload.displayName = 'ImageUpload';
