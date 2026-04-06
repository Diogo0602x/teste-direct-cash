import React from 'react';
import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('deve renderizar com variant primary por padrão', () => {
    render(<Button>Clique</Button>);
    expect(screen.getByRole('button', { name: 'Clique' })).toBeInTheDocument();
  });

  it.each(['primary', 'secondary', 'outline', 'ghost', 'danger'] as const)(
    'deve renderizar variant %s',
    (variant) => {
      render(<Button variant={variant}>Botão</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    },
  );

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)(
    'deve renderizar size %s',
    (size) => {
      render(<Button size={size}>Botão</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    },
  );

  it('deve mostrar spinner e aria-busy quando isLoading=true', () => {
    render(<Button isLoading>Salvar</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('não deve mostrar spinner quando isLoading=false', () => {
    render(<Button isLoading={false}>Salvar</Button>);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('deve renderizar leftIcon quando não está carregando', () => {
    render(<Button leftIcon={<span data-testid="left-icon" />}>Botão</Button>);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('não deve renderizar leftIcon quando isLoading=true', () => {
    render(
      <Button isLoading leftIcon={<span data-testid="left-icon" />}>
        Botão
      </Button>,
    );
    expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
  });

  it('deve renderizar rightIcon quando não está carregando', () => {
    render(
      <Button rightIcon={<span data-testid="right-icon" />}>Botão</Button>,
    );
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('não deve renderizar rightIcon quando isLoading=true', () => {
    render(
      <Button isLoading rightIcon={<span data-testid="right-icon" />}>
        Botão
      </Button>,
    );
    expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
  });

  it('deve aplicar w-full quando fullWidth=true', () => {
    render(<Button fullWidth>Botão</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('não deve aplicar w-full quando fullWidth=false', () => {
    render(<Button fullWidth={false}>Botão</Button>);
    expect(screen.getByRole('button')).not.toHaveClass('w-full');
  });

  it('deve ficar disabled quando disabled=true', () => {
    render(<Button disabled>Botão</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('deve ficar disabled quando isLoading=true', () => {
    render(<Button isLoading>Botão</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
