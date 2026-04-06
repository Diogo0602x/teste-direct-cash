import type { HTMLAttributes } from 'react';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'overline'
  | 'label';

export type TypographyWeight =
  | 'thin'
  | 'light'
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold';

export type TypographyAlign = 'left' | 'center' | 'right' | 'justify';

export type TypographyProps = HTMLAttributes<HTMLElement> & {
  variant?: TypographyVariant;
  weight?: TypographyWeight;
  align?: TypographyAlign;
  truncate?: boolean;
  className?: string;
  children?: React.ReactNode;
};
