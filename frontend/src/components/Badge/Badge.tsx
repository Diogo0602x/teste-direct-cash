import React from 'react';
import { clsx } from 'clsx';
import type { BadgeProps, BadgeVariant } from './Badge.types';

type StyleMap<T extends string> = Record<T, string>;

const variantStyles: StyleMap<BadgeVariant> = {
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  neutral: 'bg-neutral-100 text-neutral-600',
};

const Badge: React.FC<BadgeProps> = ({ variant = 'primary', className, children }) => (
  <span
    className={clsx(
      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
      variantStyles[variant],
      className,
    )}
  >
    {children}
  </span>
);

Badge.displayName = 'Badge';

export default Badge;
