import React from 'react';
import { render, screen } from '@testing-library/react';
import Typography from './Typography';

describe('Typography', () => {
  it('deve renderizar como p por padrão (body1)', () => {
    render(<Typography>Texto</Typography>);
    expect(screen.getByText('Texto').tagName).toBe('P');
  });

  it.each([
    ['h1', 'H1'],
    ['h2', 'H2'],
    ['h3', 'H3'],
    ['h4', 'H4'],
    ['h5', 'H5'],
    ['h6', 'H6'],
    ['subtitle1', 'P'],
    ['subtitle2', 'P'],
    ['body1', 'P'],
    ['body2', 'P'],
    ['caption', 'SPAN'],
    ['overline', 'SPAN'],
    ['label', 'LABEL'],
  ] as const)(
    'deve renderizar variant %s como %s',
    (variant, expectedTag) => {
      render(<Typography variant={variant}>Texto</Typography>);
      expect(screen.getByText('Texto').tagName).toBe(expectedTag);
    },
  );

  it.each([
    'thin',
    'light',
    'normal',
    'medium',
    'semibold',
    'bold',
    'extrabold',
  ] as const)('deve aplicar weight %s', (weight) => {
    render(<Typography weight={weight}>Texto</Typography>);
    expect(screen.getByText('Texto')).toBeInTheDocument();
  });

  it('não deve aplicar peso quando weight não é fornecido', () => {
    render(<Typography>Texto</Typography>);
    expect(screen.getByText('Texto')).not.toHaveClass('font-bold');
  });

  it.each(['left', 'center', 'right', 'justify'] as const)(
    'deve aplicar align %s',
    (align) => {
      render(<Typography align={align}>Texto</Typography>);
      expect(screen.getByText('Texto')).toBeInTheDocument();
    },
  );

  it('não deve aplicar classe de alinhamento quando align não é fornecido', () => {
    render(<Typography>Texto</Typography>);
    expect(screen.getByText('Texto')).not.toHaveClass('text-left');
  });

  it('deve aplicar classe truncate quando truncate=true', () => {
    render(<Typography truncate>Texto longo</Typography>);
    expect(screen.getByText('Texto longo')).toHaveClass('truncate');
  });

  it('não deve aplicar classe truncate quando truncate=false', () => {
    render(<Typography truncate={false}>Texto</Typography>);
    expect(screen.getByText('Texto')).not.toHaveClass('truncate');
  });

  it('deve renderizar os filhos', () => {
    render(<Typography>Meu conteúdo</Typography>);
    expect(screen.getByText('Meu conteúdo')).toBeInTheDocument();
  });
});
