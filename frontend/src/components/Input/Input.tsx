import React, { useId } from 'react';
import { clsx } from 'clsx';
import type { InputProps, InputSize } from './Input.types';

type StyleMap<T extends string> = Record<T, string>;

const sizeStyles: StyleMap<InputSize> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-3.5 text-sm',
  lg: 'h-12 px-4 text-base',
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      size = 'md',
      leftElement,
      rightElement,
      fullWidth = false,
      className,
      id: externalId,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = externalId ?? generatedId;
    const hasError = Boolean(errorMessage);
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-neutral-700"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftElement && (
            <span className="pointer-events-none absolute left-3 text-neutral-400">
              {leftElement}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            className={clsx(
              'w-full rounded-lg border bg-white outline-none',
              'transition-colors duration-200',
              'placeholder:text-neutral-400',
              'focus:ring-2 focus:ring-offset-0',
              sizeStyles[size],
              leftElement && 'pl-10',
              rightElement && 'pr-10',
              hasError
                ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-200',
              disabled && 'cursor-not-allowed bg-neutral-50 opacity-60',
              className,
            )}
            {...props}
          />

          {rightElement && (
            <span className="absolute right-3 text-neutral-400">
              {rightElement}
            </span>
          )}
        </div>

        {hasError && (
          <span id={errorId} role="alert" className="text-xs text-red-500">
            {errorMessage}
          </span>
        )}

        {!hasError && helperText && (
          <span id={helperId} className="text-xs text-neutral-500">
            {helperText}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
