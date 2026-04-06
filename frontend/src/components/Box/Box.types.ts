import type { HTMLAttributes } from 'react';

export type BoxElement =
  | 'div'
  | 'span'
  | 'section'
  | 'article'
  | 'aside'
  | 'main'
  | 'nav'
  | 'header'
  | 'footer'
  | 'ul'
  | 'ol'
  | 'li'
  | 'form'
  | 'fieldset'
  | 'button'
  | 'p';

export type BoxProps = HTMLAttributes<HTMLElement> & {
  as?: BoxElement;
  className?: string;
  children?: React.ReactNode;
};
