import type { HTMLAttributes } from 'react';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export type ContainerProps = HTMLAttributes<HTMLElement> & {
  as?: 'section' | 'div' | 'main' | 'article';
  size?: ContainerSize;
  centered?: boolean;
  className?: string;
  children?: React.ReactNode;
};
