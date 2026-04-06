import React from 'react';
import { render, screen } from '@testing-library/react';
import Box from './Box';

describe('Box', () => {
  it('deve renderizar como div por padrão', () => {
    render(<Box data-testid="box">Conteúdo</Box>);
    expect(screen.getByTestId('box').tagName).toBe('DIV');
  });

  it('deve renderizar como elemento especificado via prop as', () => {
    render(<Box as="section" data-testid="box">Conteúdo</Box>);
    expect(screen.getByTestId('box').tagName).toBe('SECTION');
  });

  it('deve renderizar os filhos', () => {
    render(<Box>Texto interno</Box>);
    expect(screen.getByText('Texto interno')).toBeInTheDocument();
  });

  it('deve aplicar className customizado', () => {
    render(<Box className="custom-class" data-testid="box">X</Box>);
    expect(screen.getByTestId('box')).toHaveClass('custom-class');
  });
});
