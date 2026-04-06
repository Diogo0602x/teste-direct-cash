import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider, ToastProvider } from '@/context';

export const metadata: Metadata = {
  title: {
    default: 'Fé Viva',
    template: '%s | Fé Viva',
  },
  description: 'Plataforma de gestão de igrejas e comunidades de fé',
};

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
  width: 'device-width',
  initialScale: 1,
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning>
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
