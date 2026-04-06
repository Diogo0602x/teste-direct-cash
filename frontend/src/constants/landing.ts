import { Church, Users, Heart, BookOpen, Bell, Calendar, Shield, MessageSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  bg: string;
};

export const FEATURES: Feature[] = [
  {
    icon: Church,
    title: 'Gerencie sua Igreja',
    description: 'Crie e administre sua comunidade com ferramentas simples e poderosas.',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
  },
  {
    icon: Users,
    title: 'Conecte Membros',
    description: 'Aprovação de membros, funções e gestão de equipe em um só lugar.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Heart,
    title: 'Compartilhe a Fé',
    description: 'Publique mensagens, devocionais e momentos que edificam a comunidade.',
    color: 'text-rose-500',
    bg: 'bg-rose-50',
  },
  {
    icon: BookOpen,
    title: 'Feed da Comunidade',
    description: 'Acompanhe as publicações das igrejas que você faz parte.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Calendar,
    title: 'Horários e Eventos',
    description: 'Missas, confissões e eventos especiais organizados para toda comunidade.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Bell,
    title: 'Fique Informado',
    description: 'Publicações aprovadas pelos administradores garantem conteúdo de qualidade.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: Shield,
    title: 'Seguro e Privado',
    description: 'Controle total de quem entra e publica na sua comunidade.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  {
    icon: MessageSquare,
    title: 'Comentários e Reações',
    description: 'Interaja com publicações, comente e expresse sua fé com a comunidade.',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
];

export type StatItem = {
  value: string;
  label: string;
};

export const HERO_STATS: StatItem[] = [
  { value: '100%', label: 'gratuito' },
  { value: '∞', label: 'membros' },
  { value: '24/7', label: 'disponível' },
  { value: '0', label: 'anúncios' },
];

export type Step = {
  step: string;
  title: string;
  description: string;
};

export const HOW_IT_WORKS: Step[] = [
  {
    step: '01',
    title: 'Crie sua conta',
    description: 'Registro rápido e gratuito. Nenhum cartão de crédito necessário.',
  },
  {
    step: '02',
    title: 'Encontre ou crie sua igreja',
    description: 'Busque igrejas existentes ou cadastre a sua com CNPJ verificado.',
  },
  {
    step: '03',
    title: 'Conecte sua comunidade',
    description: 'Aprove membros, publique mensagens e compartilhe eventos.',
  },
];

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  initials: string;
  color: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Pe. Carlos Mendes',
    role: 'Pároco — Diocese de Brasília',
    quote: 'Finalmente uma plataforma que entende as necessidades de uma paróquia. Ficou fácil organizar os horários e comunicar aos fiéis.',
    initials: 'CM',
    color: 'bg-sky-600',
  },
  {
    name: 'Ana Paula Ferreira',
    role: 'Coordenadora de Grupos — São Paulo',
    quote: 'O feed da comunidade transformou nossa comunicação. Agora todos ficam informados sobre as novidades da paróquia.',
    initials: 'AP',
    color: 'bg-violet-600',
  },
  {
    name: 'Diacono João Silva',
    role: 'Comunidade Fé Viva — Goiânia',
    quote: 'Gerenciar membros nunca foi tão simples. A aprovação de participantes dá mais segurança para nossa comunidade.',
    initials: 'JS',
    color: 'bg-emerald-600',
  },
];

