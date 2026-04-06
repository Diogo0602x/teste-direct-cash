import React from 'react';
import { clsx } from 'clsx';
import type { BoxProps } from './Box.types';

const Box: React.FC<BoxProps> = ({
  as: Component = 'div',
  className,
  children,
  ...props
}) => {
  return (
    <Component className={clsx(className)} {...props}>
      {children}
    </Component>
  );
};

Box.displayName = 'Box';

export default Box;
