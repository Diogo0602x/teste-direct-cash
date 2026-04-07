import React from 'react';
import { LogoMark } from './LogoMark';

interface LogoProps {
  size?: number;
  className?: string;
  variant?: 'full' | 'icon';
}

const Logo: React.FC<LogoProps> = ({
  size = 32,
  className = '',
  variant = 'full',
}) => {
  if (variant === 'icon') {
    return (
      <span className={className}>
        <LogoMark size={size} gradientId="header-logo" />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} gradientId="header-logo" />
      <span
        style={{ lineHeight: 1, letterSpacing: '-0.02em' }}
        className="text-xl font-extrabold tracking-tight text-primary-700 select-none"
      >
        Fé<span className="text-primary-500"> Viva</span>
      </span>
    </span>
  );
};

Logo.displayName = 'Logo';
export default Logo;
