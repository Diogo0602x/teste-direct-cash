import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Star, Heart, CheckCircle, ChevronRight } from 'lucide-react';
import { Box, Container, Typography, Button, Logo } from '@/components';
import { FEATURES, HERO_STATS, HOW_IT_WORKS, TESTIMONIALS } from '@/constants';
import { BackgroundDecoration } from '@/components/BackgroundDecoration';

export const metadata: Metadata = {
  title: 'Início',
  description: 'Bem-vindo ao Fé Viva — plataforma de gestão de igrejas',
};

export default function HomePage(): React.JSX.Element {
  return (
    <Box className="relative min-h-screen overflow-hidden bg-neutral-50">
      <BackgroundDecoration />

      <Container as="main" size="xl" className="relative flex min-h-screen flex-col">
        {/* Header */}
        <Box as="header" className="flex items-center justify-between py-5 animate-fade-in">
          <Logo />
          <Box className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Criar conta</Button>
            </Link>
          </Box>
        </Box>

        {/* Hero */}
        <Box className="flex flex-1 flex-col items-center justify-center gap-10 py-20 text-center">
          <Box className="animate-slide-up inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5">
            <Star size={12} className="fill-primary-500 text-primary-500" />
            <Typography variant="caption" className="font-medium text-primary-700">
              Plataforma gratuita para comunidades cristãs
            </Typography>
          </Box>

          <Box className="animate-slide-up-delay-1 flex flex-col gap-4">
            <Typography
              variant="h1"
              weight="extrabold"
              className="text-neutral-900 leading-tight text-4xl sm:text-5xl lg:text-6xl"
            >
              Conecte sua{' '}
              <Box as="span" className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                comunidade
              </Box>
              <br />
              de fé
            </Typography>
            <Typography variant="subtitle1" className="mx-auto max-w-xl text-neutral-500 text-sm sm:text-base">
              Gerencie igrejas, organize horários de missas e confissões, compartilhe mensagens
              e fortaleça os laços da sua comunidade — tudo em um só lugar.
            </Typography>
          </Box>

          <Box className="animate-slide-up-delay-2 flex w-full flex-col items-center gap-3 px-4 sm:w-auto sm:flex-row sm:px-0">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" fullWidth rightIcon={<ArrowRight size={18} />}>
                Começar gratuitamente
              </Button>
            </Link>
            <Link href="/churches" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" fullWidth>
                Explorar igrejas
              </Button>
            </Link>
          </Box>

          {/* Stats */}
          <Box className="animate-slide-up-delay-3 flex flex-wrap justify-center gap-x-10 gap-y-4 pt-2">
            {HERO_STATS.map(({ value, label }) => (
              <Box key={label} className="flex flex-col items-center gap-0.5">
                <Typography variant="h4" weight="extrabold" className="text-primary-700">
                  {value}
                </Typography>
                <Typography variant="caption" className="text-neutral-400 uppercase tracking-widest text-xs">
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* How it works */}
        <Box className="py-16 border-t border-neutral-100">
          <Box className="text-center mb-12">
            <Typography variant="overline" className="text-primary-600 font-semibold tracking-widest uppercase text-xs mb-2 block">
              Como funciona
            </Typography>
            <Typography variant="h3" weight="bold" className="text-neutral-900">
              Em 3 passos simples
            </Typography>
          </Box>
          <Box className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, title, description }, i) => (
              <Box key={step} className="relative flex flex-col items-center text-center gap-4 p-6">
                {i < HOW_IT_WORKS.length - 1 && (
                  <Box className="hidden sm:block absolute top-10 right-0 translate-x-1/2 z-10">
                    <ChevronRight size={20} className="text-neutral-300" />
                  </Box>
                )}
                <Box className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-200">
                  <Typography variant="h6" weight="bold" className="text-white">
                    {step}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1" weight="semibold" className="text-neutral-900 mb-1">
                    {title}
                  </Typography>
                  <Typography variant="body2" className="text-neutral-500">
                    {description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Features */}
        <Box className="py-16 border-t border-neutral-100">
          <Box className="text-center mb-12">
            <Typography variant="overline" className="text-primary-600 font-semibold tracking-widest uppercase text-xs mb-2 block">
              Recursos
            </Typography>
            <Typography variant="h3" weight="bold" className="text-neutral-900">
              Tudo que sua igreja precisa
            </Typography>
          </Box>
          <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, description, color, bg }, i) => (
              <Box
                key={title}
                className="glass-card border-glow rounded-2xl p-6 flex flex-col gap-3 animate-slide-up hover:shadow-md transition-shadow"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <Box className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>
                  <Icon size={20} className={color} />
                </Box>
                <Typography variant="subtitle2" weight="semibold" className="text-neutral-900">
                  {title}
                </Typography>
                <Typography variant="body2" className="text-neutral-500 leading-relaxed">
                  {description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Testimonials */}
        <Box className="py-16 border-t border-neutral-100">
          <Box className="text-center mb-12">
            <Typography variant="overline" className="text-primary-600 font-semibold tracking-widest uppercase text-xs mb-2 block">
              Depoimentos
            </Typography>
            <Typography variant="h3" weight="bold" className="text-neutral-900">
              O que dizem as comunidades
            </Typography>
          </Box>
          <Box className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {TESTIMONIALS.map(({ name, role, quote, initials, color }) => (
              <Box key={name} className="glass-card rounded-2xl p-6 flex flex-col gap-4">
                <Box className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                  ))}
                </Box>
                <Typography variant="body2" className="text-neutral-600 leading-relaxed italic">
                  &ldquo;{quote}&rdquo;
                </Typography>
                <Box className="flex items-center gap-3 mt-auto pt-2 border-t border-neutral-100">
                  <Box className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${color}`}>
                    <Typography variant="caption" weight="bold" className="text-white text-xs">
                      {initials}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" weight="semibold" className="text-neutral-800 block">
                      {name}
                    </Typography>
                    <Typography variant="caption" className="text-neutral-400">
                      {role}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* CTA Banner */}
        <Box className="py-16 border-t border-neutral-100">
          <Box className="rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-10 text-center shadow-xl shadow-primary-200/50">
            <Typography variant="h3" weight="bold" className="text-white mb-3">
              Pronto para conectar sua comunidade?
            </Typography>
            <Typography variant="body1" className="text-primary-100 mb-6 max-w-md mx-auto">
              Crie sua conta gratuitamente e comece a gerenciar sua igreja hoje mesmo.
            </Typography>
            <Box className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register">
                <Button
                  variant="white"
                  size="lg"
                  className="font-semibold"
                  rightIcon={<ArrowRight size={18} />}
                >
                  Criar conta gratuita
                </Button>
              </Link>
              <Box className="flex items-center gap-1.5 text-primary-200 text-sm">
                <CheckCircle size={14} />
                <span>Sem cartão de crédito</span>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box as="footer" className="py-8 text-center border-t border-neutral-200">
          <Box className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <Logo />
            <Typography variant="caption" className="text-neutral-400">
              © {new Date().getFullYear()} Fé Viva — feito com{' '}
              <Heart size={11} className="inline text-red-400 fill-red-400" /> para comunidades de fé
            </Typography>
            <Box className="flex items-center gap-4">
              <Link href="/login" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
                Entrar
              </Link>
              <Link href="/register" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
                Cadastrar
              </Link>
              <Link href="/churches" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
                Igrejas
              </Link>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

