import type { TextareaHTMLAttributes } from 'react';

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> & {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  fullWidth?: boolean;
  className?: string;
};
