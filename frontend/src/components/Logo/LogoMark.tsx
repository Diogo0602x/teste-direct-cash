import React from 'react';

export type LogoMarkProps = {
  size?: number;
  className?: string;
  gradientId?: string;
};

export function LogoMark({
  size = 32,
  className = '',
  gradientId = 'logo-mark',
}: LogoMarkProps): React.JSX.Element {
  const gid = `${gradientId}-grad`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="24" fill={`url(#${gid})`} />
      <rect x="21" y="10" width="6" height="28" rx="2" fill="white" />
      <rect x="13" y="18" width="22" height="6" rx="2" fill="white" />
      <path
        d="M24 8 C26 5, 31 4, 33 7 C31 7, 29 8, 28 10 C27 9, 26 8.5, 24 8Z"
        fill="white"
        fillOpacity={0.85}
      />
      <path
        d="M24 8 C22 5, 17 4, 15 7 C17 7, 19 8, 20 10 C21 9, 22 8.5, 24 8Z"
        fill="white"
        fillOpacity={0.85}
      />
    </svg>
  );
}
