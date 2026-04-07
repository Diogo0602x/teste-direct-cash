import { getBackendPublicOrigin, resolvePostMediaUrl } from './mediaUrl';

describe('getBackendPublicOrigin', () => {
  const original = process.env.NEXT_PUBLIC_BACKEND_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_BACKEND_URL = original;
  });

  it('deve extrair origem a partir de URL com /api/v1', () => {
    process.env.NEXT_PUBLIC_BACKEND_URL = 'https://api.teste.com/api/v1';
    expect(getBackendPublicOrigin()).toBe('https://api.teste.com');
  });

  it('deve retornar string vazia quando variável não existe', () => {
    delete process.env.NEXT_PUBLIC_BACKEND_URL;
    expect(getBackendPublicOrigin()).toBe('');
  });
});

describe('resolvePostMediaUrl', () => {
  const original = process.env.NEXT_PUBLIC_BACKEND_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_BACKEND_URL = original;
  });

  it('deve reescrever localhost para origem pública', () => {
    process.env.NEXT_PUBLIC_BACKEND_URL = 'https://api.producao.com/api/v1';
    expect(resolvePostMediaUrl('http://localhost:4000/uploads/abc.jpg')).toBe(
      'https://api.producao.com/uploads/abc.jpg',
    );
  });

  it('deve reescrever IP da rede local', () => {
    process.env.NEXT_PUBLIC_BACKEND_URL = 'https://api.producao.com/api/v1';
    expect(resolvePostMediaUrl('http://192.168.0.10:4000/uploads/x.png')).toBe(
      'https://api.producao.com/uploads/x.png',
    );
  });

  it('deve preservar URL externa https', () => {
    process.env.NEXT_PUBLIC_BACKEND_URL = 'https://api.producao.com/api/v1';
    expect(resolvePostMediaUrl('https://cdn.exemplo.com/foto.jpg')).toBe('https://cdn.exemplo.com/foto.jpg');
  });

  it('deve subir http para https no mesmo host do backend', () => {
    process.env.NEXT_PUBLIC_BACKEND_URL = 'https://api.producao.com/api/v1';
    expect(resolvePostMediaUrl('http://api.producao.com/uploads/z.webp')).toBe(
      'https://api.producao.com/uploads/z.webp',
    );
  });
});
