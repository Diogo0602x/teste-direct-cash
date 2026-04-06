import React from 'react';
import { render, screen } from '@testing-library/react';
import Input from './Input';

describe('Input', () => {
  it('deve renderizar input sem label por padrão', () => {
    render(<Input placeholder="Digite aqui" />);
    expect(screen.getByPlaceholderText('Digite aqui')).toBeInTheDocument();
    expect(screen.queryByRole('label')).not.toBeInTheDocument();
  });

  it('deve renderizar label quando fornecido', () => {
    render(<Input label="Nome" />);
    expect(screen.getByText('Nome')).toBeInTheDocument();
  });

  it('deve associar label ao input via id externo', () => {
    render(<Input id="my-input" label="Campo" />);
    expect(screen.getByText('Campo')).toHaveAttribute('for', 'my-input');
  });

  it('deve renderizar helperText quando não há erro', () => {
    render(<Input helperText="Texto de ajuda" />);
    expect(screen.getByText('Texto de ajuda')).toBeInTheDocument();
  });

  it('não deve renderizar helperText quando há errorMessage', () => {
    render(<Input helperText="Ajuda" errorMessage="Erro!" />);
    expect(screen.queryByText('Ajuda')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('deve marcar input como inválido quando há errorMessage', () => {
    render(<Input errorMessage="Campo obrigatório" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Campo obrigatório');
  });

  it('deve definir aria-describedby para error quando há erro', () => {
    render(<Input id="f" errorMessage="Erro" />);
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-describedby',
      'f-error',
    );
  });

  it('deve definir aria-describedby para helper quando sem erro', () => {
    render(<Input id="f" helperText="Ajuda" />);
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-describedby',
      'f-helper',
    );
  });

  it('não deve definir aria-describedby quando sem helper ou erro', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby');
  });

  it('deve renderizar leftElement quando fornecido', () => {
    render(<Input leftElement={<span data-testid="left">L</span>} />);
    expect(screen.getByTestId('left')).toBeInTheDocument();
  });

  it('deve renderizar rightElement quando fornecido', () => {
    render(<Input rightElement={<span data-testid="right">R</span>} />);
    expect(screen.getByTestId('right')).toBeInTheDocument();
  });

  it('deve aplicar w-full ao wrapper quando fullWidth=true', () => {
    const { container } = render(<Input fullWidth />);
    expect(container.firstChild).toHaveClass('w-full');
  });

  it.each(['sm', 'md', 'lg'] as const)('deve renderizar size %s', (size) => {
    render(<Input size={size} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('deve aceitar ref encaminhado', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).not.toBeNull();
  });

  it('deve ficar disabled quando disabled=true', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
