'use client';

import React from 'react';
import Link from 'next/link';
import {
  Rss,
  Church,
  UserCircle,
  LogOut,
  ArrowRight,
  Crown,
  Users,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';
import { Box, Container, Typography, Button, Badge } from '@/components';
import { useAuth } from '@/hooks';
import { useAuthContext } from '@/context';
import { useMyProfile } from '@/hooks';
import { getInitials } from '@/utils';

const GREETING = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
};

const UserDashboard: React.FC = () => {
  const { user } = useAuthContext();
  const { logout } = useAuth();
  const { profile } = useMyProfile();

  const isAdmin = !!profile?.adminChurch;

  return (
    <Container as="main" size="xl" className="py-8">
      <Box className="flex flex-col gap-8">
        <Box className="glass-card rounded-2xl p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-glow">
          <Box className="flex items-center gap-4">
            <Box className="relative flex-shrink-0">
              {(profile?.avatarUrl ?? user?.avatarUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={(profile?.avatarUrl ?? user?.avatarUrl)!}
                  alt={user?.name ?? ''}
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-primary-200"
                />
              ) : (
                <Box className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 shadow-md">
                  <Typography variant="subtitle1" weight="bold" className="text-white">
                    {user ? getInitials(user.name) : '?'}
                  </Typography>
                </Box>
              )}
              {isAdmin && (
                <Box className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 ring-2 ring-white">
                  <Crown size={10} className="text-white" />
                </Box>
              )}
            </Box>
            <Box className="flex min-w-0 flex-col gap-0.5">
              <Typography variant="caption" className="text-neutral-400 text-xs">
                {GREETING()},
              </Typography>
              <Typography variant="h6" weight="bold" className="truncate text-neutral-900">
                {user?.name ?? 'usuário'}!
              </Typography>
              <Typography variant="caption" className="truncate text-neutral-500">
                {user?.email}
              </Typography>
            </Box>
          </Box>

          <Box className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
            {isAdmin && (
              <Badge variant="warning" className="hidden sm:inline-flex">
                <Crown size={10} className="mr-1" />
                Admin — {profile?.adminChurch?.name}
              </Badge>
            )}
            <Link href="/profile">
              <Button variant="outline" size="sm" leftIcon={<UserCircle size={14} />}>
                Meu Perfil
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              leftIcon={<LogOut size={14} />}
            >
              Sair
            </Button>
          </Box>
        </Box>

        {isAdmin && profile?.adminChurch && (
          <Box className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 flex items-center justify-between gap-4">
            <Box className="flex items-center gap-3">
              <Box className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <Crown size={18} className="text-amber-600" />
              </Box>
              <Box>
                <Typography variant="subtitle2" weight="semibold" className="text-amber-900">
                  Você administra: {profile.adminChurch.name}
                </Typography>
                <Typography variant="caption" className="text-amber-700">
                  Gerencie membros, publicações e informações da sua igreja.
                </Typography>
              </Box>
            </Box>
            <Link href={`/churches/${profile.adminChurch.id}`} className="flex-shrink-0">
              <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100" rightIcon={<ArrowRight size={13} />}>
                Gerenciar
              </Button>
            </Link>
          </Box>
        )}

        <Box>
          <Typography variant="subtitle2" weight="semibold" className="text-neutral-600 mb-3 uppercase tracking-wider text-xs">
            Acesso rápido
          </Typography>
          <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DashboardCard
              title="Feed da Comunidade"
              description="Veja as últimas publicações, interaja e compartilhe mensagens"
              href="/feed"
              Icon={Rss}
              iconColor="text-sky-600"
              iconBg="bg-sky-50"
              badge={undefined}
            />
            <DashboardCard
              title="Igrejas"
              description="Explore, crie ou gerencie igrejas e comunidades de fé"
              href="/churches"
              Icon={Church}
              iconColor="text-violet-600"
              iconBg="bg-violet-50"
              badge={undefined}
            />
            <DashboardCard
              title="Meu Perfil"
              description="Atualize seus dados, foto e gerencie sua participação"
              href="/profile"
              Icon={UserCircle}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-50"
              badge={undefined}
            />
          </Box>
        </Box>

        <Box className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InfoCard
            icon={<Users size={16} className="text-violet-600" />}
            iconBg="bg-violet-50"
            title="Faça parte de uma comunidade"
            description="Encontre igrejas da sua cidade e solicite participação."
          />
          <InfoCard
            icon={<BookOpen size={16} className="text-amber-600" />}
            iconBg="bg-amber-50"
            title="Horários e eventos"
            description="Igreja com horários de missa, confissão e eventos especiais."
          />
          <InfoCard
            icon={<Rss size={16} className="text-sky-600" />}
            iconBg="bg-sky-50"
            title="Feed atualizado"
            description="Publicações aprovadas para garantir conteúdo de qualidade."
          />
        </Box>
      </Box>
    </Container>
  );
};

type DashboardCardProps = {
  title: string;
  description: string;
  href: string;
  Icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  badge?: string;
};

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  href,
  Icon,
  iconColor,
  iconBg,
}) => (
  <Link href={href} className="block group">
    <Box className="glass-card flex flex-col gap-4 rounded-2xl p-6 transition-all hover:shadow-md hover:border-primary-200 cursor-pointer h-full border border-neutral-100">
      <Box className="flex items-start justify-between">
        <Box className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} transition-transform group-hover:scale-110`}>
          <Icon size={22} className={iconColor} />
        </Box>
        <ArrowRight
          size={16}
          className="text-neutral-300 transition-all group-hover:text-primary-500 group-hover:translate-x-0.5"
        />
      </Box>
      <Box className="flex flex-col gap-1">
        <Typography variant="subtitle1" weight="semibold" className="text-neutral-800">
          {title}
        </Typography>
        <Typography variant="body2" className="text-neutral-500 leading-relaxed">
          {description}
        </Typography>
      </Box>
    </Box>
  </Link>
);

type InfoCardProps = {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
};

const InfoCard: React.FC<InfoCardProps> = ({ icon, iconBg, title, description }) => (
  <Box className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-white p-4">
    <Box className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
      {icon}
    </Box>
    <Box>
      <Typography variant="caption" weight="semibold" className="text-neutral-800 block mb-0.5">
        {title}
      </Typography>
      <Typography variant="caption" className="text-neutral-500">
        {description}
      </Typography>
    </Box>
  </Box>
);

UserDashboard.displayName = 'UserDashboard';

export default UserDashboard;

