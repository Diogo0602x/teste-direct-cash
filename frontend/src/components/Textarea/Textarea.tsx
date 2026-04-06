import React, { useId } from 'react';
import { clsx } from 'clsx';
import type { TextareaProps } from './Textarea.types';

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      fullWidth = false,
      className,
      id: externalId,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const textareaId = externalId ?? generatedId;
    const hasError = Boolean(errorMessage);
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    return (
      <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
          className={clsx(
            'w-full rounded-lg border bg-white outline-none resize-none',
            'px-3 py-2 text-sm',
            'transition-colors duration-200',
            'placeholder:text-neutral-400',
            'focus:ring-2 focus:ring-offset-0',
            hasError
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
              : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-200',
            disabled && 'cursor-not-allowed bg-neutral-50 opacity-60',
            className,
          )}
          {...props}
        />

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

Textarea.displayName = 'Textarea';

export default Textarea;
