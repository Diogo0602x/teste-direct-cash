import React from 'react';
import { clsx } from 'clsx';
import type { ContainerProps, ContainerSize } from './Container.types';

const sizeMap: Record<ContainerSize, string> = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

const Container: React.FC<ContainerProps> = ({
  as: Component = 'section',
  size = 'xl',
  centered = true,
  className,
  children,
  ...props
}) => {
  return (
    <Component
      className={clsx(
        'w-full min-w-0 max-w-full px-4 sm:px-6 lg:px-8',
        sizeMap[size],
        centered && 'mx-auto',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

Container.displayName = 'Container';

export default Container;
