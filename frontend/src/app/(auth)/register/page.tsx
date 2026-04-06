import type { Metadata } from 'next';
import Link from 'next/link';
import { Box, Container, Logo, Typography } from '@/components';
import { RegisterForm } from '@/containers/AuthForms';

export const metadata: Metadata = {
  title: 'Criar conta',
  description: 'Crie sua conta no Fé Viva e junte-se à comunidade',
};

export default function RegisterPage(): React.JSX.Element {
  return (
    <Box className="relative min-h-screen overflow-hidden bg-neutral-50">
      <Box className="pointer-events-none absolute inset-0" aria-hidden="true">
        <Box className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary-100/50 blur-3xl" />
        <svg className="absolute bottom-0 left-0 opacity-[0.04]" width="300" height="300" viewBox="0 0 100 100" fill="none">
          <rect x="43" y="5" width="14" height="90" rx="4" fill="#0369a1" />
          <rect x="10" y="30" width="80" height="14" rx="4" fill="#0369a1" />
        </svg>
      </Box>

      <Container as="main" size="sm" className="relative flex min-h-screen flex-col items-center justify-center py-12">
        <Box className="flex w-full flex-col items-center gap-8 animate-slide-up">
          <Link href="/">
            <Logo size={36} />
          </Link>

          <Box className="glass-card border-glow w-full rounded-2xl p-5 sm:p-8">
            <RegisterForm />

            <Box className="mt-6 border-t border-neutral-100 pt-5 text-center">
              <Typography variant="body2" className="text-neutral-500">
                Já tem conta?{' '}
                <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">
                  Entrar
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

