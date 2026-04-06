import React from 'react';
import { Box } from '@/components';

const BackgroundDecoration: React.FC = () => (
  <Box className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <Box className="absolute -top-32 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary-100/60 blur-3xl" />

    <svg
      className="absolute -right-16 -top-16 opacity-[0.04]"
      width="400"
      height="400"
      viewBox="0 0 100 100"
      fill="none"
    >
      <rect x="43" y="5" width="14" height="90" rx="4" fill="#0369a1" />
      <rect x="10" y="30" width="80" height="14" rx="4" fill="#0369a1" />
    </svg>

    <svg
      className="absolute -bottom-8 -left-8 opacity-[0.05]"
      width="240"
      height="240"
      viewBox="0 0 100 100"
      fill="none"
    >
      <rect x="43" y="5" width="14" height="90" rx="4" fill="#0369a1" />
      <rect x="10" y="30" width="80" height="14" rx="4" fill="#0369a1" />
    </svg>

    <svg
      className="absolute right-12 top-40 animate-float opacity-10"
      width="120"
      height="120"
      viewBox="0 0 100 100"
      fill="none"
    >
      <path
        d="M50 30 C55 20,75 15,80 25 C70 25,60 32,56 40 C54 36,52 33,50 30Z"
        fill="#0369a1"
      />
      <path
        d="M50 30 C45 20,25 15,20 25 C30 25,40 32,44 40 C46 36,48 33,50 30Z"
        fill="#0369a1"
      />
      <ellipse cx="50" cy="52" rx="10" ry="16" fill="#0369a1" />
      <path d="M44 66 C40 72,38 78,42 80 C45 76,50 74,50 68" fill="#0369a1" />
      <path d="M56 66 C60 72,62 78,58 80 C55 76,50 74,50 68" fill="#0369a1" />
      <circle cx="54" cy="40" r="2" fill="#0ea5e9" />
    </svg>
  </Box>
);

BackgroundDecoration.displayName = 'BackgroundDecoration';

export default BackgroundDecoration;
