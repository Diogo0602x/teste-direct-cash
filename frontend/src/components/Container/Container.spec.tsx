import React from 'react';
import { render, screen } from '@testing-library/react';
import Container from './Container';

describe('Container', () => {
  it('deve renderizar como section por padrão', () => {
    render(<Container data-testid="container">Conteúdo</Container>);
    expect(screen.getByTestId('container').tagName).toBe('SECTION');
  });

  it('deve renderizar como elemento especificado via prop as', () => {
    render(<Container as="div" data-testid="container">Conteúdo</Container>);
    expect(screen.getByTestId('container').tagName).toBe('DIV');
  });

  it.each(['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const)(
    'deve renderizar size %s',
    (size) => {
      render(<Container size={size} data-testid="container">X</Container>);
      expect(screen.getByTestId('container')).toBeInTheDocument();
    },
  );

  it('deve aplicar mx-auto quando centered=true (padrão)', () => {
    render(<Container data-testid="container">X</Container>);
    expect(screen.getByTestId('container')).toHaveClass('mx-auto');
  });

  it('não deve aplicar mx-auto quando centered=false', () => {
    render(<Container centered={false} data-testid="container">X</Container>);
    expect(screen.getByTestId('container')).not.toHaveClass('mx-auto');
  });

  it('deve renderizar os filhos', () => {
    render(<Container>Conteúdo filho</Container>);
    expect(screen.getByText('Conteúdo filho')).toBeInTheDocument();
  });
});
