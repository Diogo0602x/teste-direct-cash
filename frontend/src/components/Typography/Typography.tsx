import React from 'react';
import { clsx } from 'clsx';
import type {
  TypographyProps,
  TypographyVariant,
  TypographyWeight,
  TypographyAlign,
} from './Typography.types';

type TagMap = Record<TypographyVariant, React.ElementType>;
type StyleMap<T extends string> = Record<T, string>;

const tagMap: TagMap = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  subtitle1: 'p',
  subtitle2: 'p',
  body1: 'p',
  body2: 'p',
  caption: 'span',
  overline: 'span',
  label: 'label',
};

const variantStyles: StyleMap<TypographyVariant> = {
  h1: 'text-4xl sm:text-5xl lg:text-6xl leading-tight',
  h2: 'text-3xl sm:text-4xl lg:text-5xl leading-tight',
  h3: 'text-2xl sm:text-3xl lg:text-4xl leading-snug',
  h4: 'text-xl sm:text-2xl lg:text-3xl leading-snug',
  h5: 'text-lg sm:text-xl lg:text-2xl leading-normal',
  h6: 'text-base sm:text-lg lg:text-xl leading-normal',
  subtitle1: 'text-lg leading-relaxed',
  subtitle2: 'text-base leading-relaxed',
  body1: 'text-base leading-relaxed',
  body2: 'text-sm leading-relaxed',
  caption: 'text-xs leading-normal',
  overline: 'text-xs uppercase tracking-widest leading-normal',
  label: 'text-sm font-medium leading-none',
};

const weightStyles: StyleMap<TypographyWeight> = {
  thin: 'font-thin',
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

const alignStyles: StyleMap<TypographyAlign> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  weight,
  align,
  truncate = false,
  className,
  children,
  ...props
}) => {
  const Tag = tagMap[variant];

  return (
    <Tag
      className={clsx(
        variantStyles[variant],
        weight && weightStyles[weight],
        align && alignStyles[align],
        truncate && 'truncate',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
};

Typography.displayName = 'Typography';

export default Typography;
