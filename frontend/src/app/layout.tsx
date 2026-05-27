import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'Cursos GT — Plataforma Híbrida de Ensino',
  description:
    'Matrícula online, ensino presencial controlado. Capacite-se com os melhores cursos profissionalizantes.',
  keywords: ['cursos', 'ensino', 'profissionalizante', 'presencial', 'online'],
  icons: {
    icon: '/logos/logo.png',
    shortcut: '/logos/logo.png',
    apple: '/logos/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
