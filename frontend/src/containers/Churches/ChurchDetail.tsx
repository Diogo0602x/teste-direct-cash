'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Church,
  MapPin,
  Users,
  Crown,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  FileText,
  UserCheck,
  ClipboardList,
  UserPlus,
  Check,
  X,
  UserCog,
  Mail,
  Calendar,
  CalendarDays,
  Trash2,
  PlusCircle,
  HandHeart,
  BookOpen,
  Ellipsis,
} from 'lucide-react';
import { Box, Container, Typography, Button, Badge, ImageUpload } from '@/components';
import { useChurch, usePosts, usePendingPosts, useMembers, useMemberRequests, useJoinChurch, useAddAdmin, useSchedules, useEvents } from '@/hooks';
import { useAuthContext, useToast } from '@/context';
import { churchesService } from '@/services';
import CreateChurchPostForm from './CreateChurchPostForm';
import ChurchPostCard from './ChurchPostCard';
import type { ScheduleType, CreateSchedulePayload, CreateEventPayload } from '@/types';

type Props = {
  churchId: string;
};

const ChurchDetail: React.FC<Props> = ({ churchId }) => {
  const { user } = useAuthContext();
  const { church, isLoading, error, fetchChurch } = useChurch();
  const { posts, fetchPosts } = usePosts(churchId);
  const { posts: pendingPosts, fetchPending, approvePost, rejectPost } = usePendingPosts();
  const { members, fetchMembers } = useMembers();
  const { requests, fetchRequests, approve, reject, updateRole, removeMember } = useMemberRequests();
  const { joinChurch, isLoading: joining } = useJoinChurch();
  const { addAdmin, isLoading: addingAdmin, error: addAdminError, success: addAdminSuccess, reset: resetAddAdmin } = useAddAdmin();
  const { schedules, fetchSchedules, createSchedule, deleteSchedule } = useSchedules();
  const { events, fetchEvents, createEvent, deleteEvent } = useEvents();

  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'schedules' | 'events' | 'pending' | 'requests' | 'admins'>('posts');
  const [membershipError, setMembershipError] = useState<string | null>(null);
  const [myMemberStatus, setMyMemberStatus] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState('');

  // Schedule form state
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleType, setScheduleType] = useState<ScheduleType>('MASS');
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDaysOfWeek, setScheduleDaysOfWeek] = useState<number[]>([]);
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleDesc, setScheduleDesc] = useState('');

  // Event form state
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');
  const [eventImageUrl, setEventImageUrl] = useState('');

  const isAdmin = church?.adminId === user?.id;
  const { success: toastSuccess, error: toastError } = useToast();
  const [logoUrl, setLogoUrl] = useState(church?.logoUrl ?? '');

  useEffect(() => {
    if (church?.logoUrl !== undefined) setLogoUrl(church.logoUrl ?? '');
  }, [church?.logoUrl]);

  const handleLogoChange = async (url: string): Promise<void> => {
    setLogoUrl(url);
    try {
      await churchesService.update(churchId, { logoUrl: url });
      toastSuccess('Logo atualizado!');
    } catch {
      toastError('Não foi possível atualizar o logo.');
    }
  };

  const handleSaveSchedule = async (): Promise<void> => {
    const payload: CreateSchedulePayload = {
      type: scheduleType,
      title: scheduleTitle.trim(),
      time: scheduleTime,
      ...(scheduleDaysOfWeek.length > 0 ? { daysOfWeek: scheduleDaysOfWeek } : {}),
      ...(scheduleDesc.trim() ? { description: scheduleDesc.trim() } : {}),
    };
    const ok = await createSchedule(churchId, payload);
    if (ok) {
      setShowScheduleForm(false);
      setScheduleTitle('');
      setScheduleTime('');
      setScheduleDaysOfWeek([]);
      setScheduleDesc('');
    }
  };

  const handleSaveEvent = async (): Promise<void> => {
    const payload: CreateEventPayload = {
      title: eventTitle.trim(),
      startDate: new Date(eventStart).toISOString(),
      ...(eventEnd ? { endDate: new Date(eventEnd).toISOString() } : {}),
      ...(eventDesc.trim() ? { description: eventDesc.trim() } : {}),
      ...(eventImageUrl ? { imageUrl: eventImageUrl } : {}),
    };
    const ok = await createEvent(churchId, payload);
    if (ok) {
      setShowEventForm(false);
      setEventTitle('');
      setEventStart('');
      setEventEnd('');
      setEventDesc('');
      setEventImageUrl('');
    }
  };

  useEffect(() => {
    void fetchChurch(churchId);
    void fetchPosts(1, churchId);
    void fetchMembers(churchId);
    void fetchSchedules(churchId);
    void fetchEvents(churchId);
  }, [churchId, fetchChurch, fetchPosts, fetchMembers, fetchSchedules, fetchEvents]);

  useEffect(() => {
    if (isAdmin) {
      void fetchPending(churchId);
      void fetchRequests(churchId);
    }
  }, [isAdmin, churchId, fetchPending, fetchRequests]);

  useEffect(() => {
    if (user && members.length > 0) {
      const membership = members.find((m) => m.user.id === user.id);
      setMyMemberStatus(membership?.status ?? null);
    }
  }, [user, members]);

  const handleJoin = async (): Promise<void> => {
    setMembershipError(null);
    const result = await joinChurch(churchId);
    if (result) {
      setMyMemberStatus('PENDING');
    } else {
      setMembershipError('Erro ao solicitar entrada. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <Container as="main" size="xl" className="py-8">
        <Box className="flex flex-col gap-6">
          <Link
            href="/churches"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 transition-colors w-fit"
          >
            <ArrowLeft size={15} /> Voltar às igrejas
          </Link>
          <Box className="glass-card rounded-2xl p-6 flex flex-col gap-4 animate-pulse">
            <Box className="flex items-center gap-4">
              <Box className="h-14 w-14 rounded-2xl bg-neutral-200 flex-shrink-0" />
              <Box className="flex flex-col gap-2 flex-1">
                <Box className="h-5 w-48 rounded bg-neutral-200" />
                <Box className="h-3.5 w-32 rounded bg-neutral-100" />
                <Box className="h-3 w-20 rounded bg-neutral-100" />
              </Box>
            </Box>
            <Box className="h-3 w-full rounded bg-neutral-100" />
            <Box className="h-3 w-4/5 rounded bg-neutral-100" />
          </Box>
          <Box className="flex gap-2">
            {[1, 2].map((i) => (
              <Box key={i} className="h-9 w-24 rounded-lg bg-neutral-200 animate-pulse" />
            ))}
          </Box>
        </Box>
      </Container>
    );
  }

  if (error ?? !church) {
    return (
      <Container as="main" size="xl" className="py-8">
        <Box className="flex flex-col gap-6">
          <Link
            href="/churches"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 transition-colors w-fit"
          >
            <ArrowLeft size={15} /> Voltar às igrejas
          </Link>
          <Box className="glass-card rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
            <Box className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <Church size={28} className="text-red-400" />
            </Box>
            <Box>
              <Typography variant="h6" weight="semibold" className="text-neutral-700">
                Igreja não encontrada
              </Typography>
              <Typography variant="body2" className="text-neutral-400 mt-1">
                {error ?? 'Esta página não existe ou foi removida.'}
              </Typography>
            </Box>
            <Link href="/churches">
              <Button size="sm" leftIcon={<ArrowLeft size={15} />}>
                Ver todas as igrejas
              </Button>
            </Link>
          </Box>
        </Box>
      </Container>
    );
  }

  const tabs = [
    { key: 'posts', label: `Posts (${posts.length})` },
    { key: 'members', label: `Membros` },
    { key: 'schedules', label: `Horários (${schedules.length})` },
    { key: 'events', label: `Eventos (${events.length})` },
    ...(isAdmin
      ? [
          { key: 'pending', label: `Pendentes (${pendingPosts.length})` },
          { key: 'requests', label: `Solicitações (${requests.length})` },
          { key: 'admins', label: 'Admins' },
        ]
      : []),
  ] as Array<{ key: typeof activeTab; label: string }>;

  return (
    <Container as="main" size="xl" className="py-8">
      <Box className="flex flex-col gap-6">
        <Link href="/churches" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline">
          <ArrowLeft size={14} /> Voltar às igrejas
        </Link>

        <Box className="glass-card rounded-2xl p-5 sm:p-6">
          <Box className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <Box className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:gap-4">
              {isAdmin ? (
                <Box className="w-full min-w-0 shrink-0 sm:max-w-[min(100%,280px)]">
                  <ImageUpload
                    value={logoUrl}
                    onChange={(url) => void handleLogoChange(url)}
                    shape="square"
                    size="sm"
                  />
                </Box>
              ) : logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={church.name}
                  className="mx-auto h-12 w-12 shrink-0 rounded-2xl object-cover sm:mx-0 sm:h-14 sm:w-14"
                />
              ) : (
                <Box className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 sm:mx-0 sm:h-14 sm:w-14">
                  <Church size={24} className="text-primary-600 sm:hidden" />
                  <Church size={28} className="hidden text-primary-600 sm:block" />
                </Box>
              )}
              <Box className="min-w-0 flex-1 text-center sm:text-left">
                <Typography variant="h5" weight="bold" className="break-words text-neutral-900">
                  {church.name}
                </Typography>
                {(church.city ?? church.state) && (
                  <Typography
                    variant="body2"
                    className="mt-0.5 flex flex-wrap items-center justify-center gap-1 text-neutral-500 sm:justify-start"
                  >
                    <MapPin size={14} className="shrink-0" />{' '}
                    <span className="break-words text-left">
                      {[church.city, church.state].filter(Boolean).join(', ')}
                    </span>
                  </Typography>
                )}
                <Typography
                  variant="caption"
                  className="mt-0.5 flex items-center justify-center gap-1 text-neutral-400 sm:justify-start"
                >
                  <Users size={13} /> {church._count?.members ?? 0} membros
                </Typography>
              </Box>
            </Box>

            {user && !isAdmin && (
              <Box className="flex flex-col items-start gap-2 sm:items-end">
                {myMemberStatus === 'ACTIVE' ? (
                  <Typography variant="body2" className="text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle size={15} /> Membro ativo
                  </Typography>
                ) : myMemberStatus === 'PENDING' ? (
                  <Typography variant="body2" className="text-yellow-600 font-medium flex items-center gap-1">
                    <Clock size={15} /> Aguardando aprovação
                  </Typography>
                ) : myMemberStatus === 'REJECTED' ? (
                  <Typography variant="body2" className="text-red-600 font-medium flex items-center gap-1">
                    <XCircle size={15} /> Solicitação rejeitada
                  </Typography>
                ) : (
                  <Button size="sm" onClick={() => void handleJoin()} isLoading={joining}>
                    Solicitar entrada
                  </Button>
                )}
                {membershipError && (
                  <Typography variant="caption" className="text-red-600">
                    {membershipError}
                  </Typography>
                )}
              </Box>
            )}

            {isAdmin && (
              <Typography variant="body2" className="text-primary-600 font-medium flex items-center gap-1">
                <Crown size={15} /> Administrador
              </Typography>
            )}
          </Box>

          {church.description && (
            <Typography variant="body1" className="text-neutral-600 mt-4">
              {church.description}
            </Typography>
          )}
        </Box>

        <Box className="-mx-4 min-w-0 overflow-x-auto overscroll-x-contain px-4 sm:mx-0 sm:px-0">
          <Box className="flex min-w-max gap-2 border-b border-neutral-200">
            {tabs.map((tab) => (
              <Box
                key={tab.key}
                as="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {tab.label}
              </Box>
            ))}
          </Box>
        </Box>

        {activeTab === 'posts' && (
          <Box className="flex flex-col gap-4">
            {isAdmin && (
              <CreateChurchPostForm
                churchId={churchId}
                onCreated={() => void fetchPosts(1, churchId)}
                isAdmin={isAdmin}
              />
            )}
            {posts.length === 0 ? (
              <Box className="flex flex-col items-center gap-3 py-14 text-center">
                <Box className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
                  <FileText size={24} className="text-neutral-400" />
                </Box>
                <Typography variant="body2" className="text-neutral-400">
                  Nenhum post aprovado ainda.
                </Typography>
              </Box>
            ) : (
              posts.map((post) => (
                <ChurchPostCard
                  key={post.id}
                  post={post}
                  isAdmin={isAdmin}
                  currentUserId={user?.id}
                  onRefresh={() => void fetchPosts(1, churchId)}
                />
              ))
            )}
          </Box>
        )}

        {activeTab === 'members' && (
          <Box className="flex flex-col gap-3">
            {members.length === 0 ? (
              <Box className="flex flex-col items-center gap-3 py-14 text-center">
                <Box className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
                  <UserCheck size={24} className="text-neutral-400" />
                </Box>
                <Typography variant="body2" className="text-neutral-400">
                  Nenhum membro ativo ainda.
                </Typography>
              </Box>
            ) : (
              members.map((member) => (
                <Box
                  key={member.id}
                  className="glass-card flex min-w-0 flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center"
                >
                  <Box className="flex min-w-0 flex-1 items-center gap-3">
                    <Box className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100">
                      <Typography variant="caption" weight="bold" className="text-primary-700">
                        {member.user.name.charAt(0).toUpperCase()}
                      </Typography>
                    </Box>
                    <Box className="min-w-0 flex-1">
                      <Typography variant="body2" weight="semibold" className="break-words text-neutral-800">
                        {member.user.name}
                      </Typography>
                      <Typography variant="caption" className="break-all text-neutral-400">
                        {member.user.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Box className="flex shrink-0 flex-wrap items-center gap-2">
                    {member.role === 'ADMIN' && <Badge variant="primary">Admin</Badge>}
                    {isAdmin && member.user.id !== user?.id && (
                      <>
                        <Box
                          as="button"
                          onClick={() =>
                            void updateRole(
                              churchId,
                              member.user.id,
                              member.role === 'ADMIN' ? 'MEMBER' : 'ADMIN',
                            ).then(() => void fetchMembers(churchId))
                          }
                          className="text-xs text-neutral-500 hover:text-primary-600 transition-colors"
                        >
                          {member.role === 'ADMIN' ? 'Rebaixar' : 'Promover'}
                        </Box>
                        <Button
                          variant="danger"
                          size="xs"
                          onClick={() =>
                            void removeMember(churchId, member.user.id).then(() => void fetchMembers(churchId))
                          }
                        >
                          Remover
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              ))
            )}
          </Box>
        )}

        {activeTab === 'pending' && isAdmin && (
          <Box className="flex flex-col gap-4">
            {pendingPosts.length === 0 ? (
              <Box className="flex flex-col items-center gap-3 py-14 text-center">
                <Box className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50">
                  <ClipboardList size={24} className="text-green-400" />
                </Box>
                <Typography variant="body2" className="text-neutral-400">
                  Nenhum post pendente de aprovação.
                </Typography>
              </Box>
            ) : (
              pendingPosts.map((post) => (
                <Box
                  key={post.id}
                  className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 flex flex-col gap-3"
                >
                  <Box className="flex items-center justify-between">
                    <Box>
                      <Typography variant="body2" weight="semibold" className="text-neutral-800">
                        {post.author.name}
                      </Typography>
                      <Typography variant="caption" className="text-neutral-400">
                        {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                      </Typography>
                    </Box>
                    <Box className="flex gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        leftIcon={<Check size={14} />}
                        onClick={() =>
                          void approvePost(post.id).then(() => {
                            void fetchPosts(1, churchId);
                          })
                        }
                      >
                        Aprovar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<X size={14} />}
                        onClick={() => void rejectPost(post.id)}
                      >
                        Rejeitar
                      </Button>
                    </Box>
                  </Box>
                  {post.title && (
                    <Typography variant="h6" weight="semibold" className="text-neutral-900">
                      {post.title}
                    </Typography>
                  )}
                  <Typography variant="body1" className="text-neutral-700">
                    {post.content}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        )}

        {activeTab === 'requests' && isAdmin && (
          <Box className="flex flex-col gap-3">
            {requests.length === 0 ? (
              <Box className="flex flex-col items-center gap-3 py-14 text-center">
                <Box className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
                  <UserPlus size={24} className="text-neutral-400" />
                </Box>
                <Typography variant="body2" className="text-neutral-400">
                  Nenhuma solicitação pendente.
                </Typography>
              </Box>
            ) : (
              requests.map((req) => (
                <Box key={req.id} className="glass-card flex items-center gap-3 rounded-xl p-4">
                  <Box className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 flex-shrink-0">
                    <Typography variant="caption" weight="bold" className="text-neutral-600">
                      {req.user.name.charAt(0).toUpperCase()}
                    </Typography>
                  </Box>
                  <Box className="flex-1">
                    <Typography variant="body2" weight="semibold" className="text-neutral-800">
                      {req.user.name}
                    </Typography>
                    <Typography variant="caption" className="text-neutral-400">
                      {req.user.email} · Solicitou em {new Date(req.joinedAt).toLocaleDateString('pt-BR')}
                    </Typography>
                  </Box>
                  <Box className="flex gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      leftIcon={<Check size={14} />}
                      onClick={() => void approve(churchId, req.user.id).then(() => void fetchMembers(churchId))}
                    >
                      Aprovar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<X size={14} />}
                      onClick={() => void reject(churchId, req.user.id)}
                    >
                      Rejeitar
                    </Button>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        )}

        {activeTab === 'schedules' && (
          <Box className="flex flex-col gap-4">
            {isAdmin && (
              <Box className="glass-card rounded-2xl p-4">
                <Box
                  as="button"
                  onClick={() => setShowScheduleForm((v) => !v)}
                  className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
                >
                  <PlusCircle size={16} />
                  {showScheduleForm ? 'Cancelar' : 'Adicionar horário'}
                </Box>
                {showScheduleForm && (
                  <Box className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Box className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-neutral-600">Tipo</label>
                      <select
                        value={scheduleType}
                        onChange={(e) => setScheduleType(e.target.value as ScheduleType)}
                        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-400"
                      >
                        <option value="MASS">Missa</option>
                        <option value="CONFESSION">Confissão</option>
                        <option value="MEETING">Reunião</option>
                        <option value="OTHER">Outro</option>
                      </select>
                    </Box>
                    <Box className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-neutral-600">Título</label>
                      <input
                        value={scheduleTitle}
                        onChange={(e) => setScheduleTitle(e.target.value)}
                        placeholder="ex: Missa Dominical"
                        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-400"
                      />
                    </Box>
                    <Box className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-xs font-medium text-neutral-600">Dias da semana</label>
                      <Box className="flex flex-wrap gap-2">
                        {DAY_NAMES.map((d, i) => (
                          <label key={i} className="flex items-center gap-1 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={scheduleDaysOfWeek.includes(i)}
                              onChange={() =>
                                setScheduleDaysOfWeek((prev) =>
                                  prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
                                )
                              }
                              className="accent-primary-500"
                            />
                            <span className="text-sm">{d}</span>
                          </label>
                        ))}
                      </Box>
                    </Box>
                    <Box className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-neutral-600">Horário (HH:mm)</label>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-400"
                      />
                    </Box>
                    <Box className="sm:col-span-2 flex flex-col gap-1">
                      <label className="text-xs font-medium text-neutral-600">Descrição (opcional)</label>
                      <input
                        value={scheduleDesc}
                        onChange={(e) => setScheduleDesc(e.target.value)}
                        placeholder="Informações adicionais"
                        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-400"
                      />
                    </Box>
                    <Box className="sm:col-span-2">
                      <Button
                        size="sm"
                        disabled={!scheduleTitle.trim() || !scheduleTime}
                        onClick={() => void handleSaveSchedule()}
                      >
                        Salvar horário
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {schedules.length === 0 ? (
              <Box className="flex flex-col items-center gap-3 py-14 text-center">
                <Box className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50">
                  <Clock size={24} className="text-sky-400" />
                </Box>
                <Typography variant="body2" className="text-neutral-400">
                  Nenhum horário cadastrado ainda.
                </Typography>
              </Box>
            ) : (
              <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {schedules.map((s) => (
                  <Box key={s.id} className={`flex items-start gap-3 rounded-xl border p-4 ${SCHEDULE_TYPE_COLOR[s.type]}`}>
                    <Box className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/60">
                      {SCHEDULE_TYPE_ICON[s.type]}
                    </Box>
                    <Box className="flex-1">
                      <Box className="flex items-center gap-2 flex-wrap">
                        <Typography variant="body2" weight="semibold">{s.title}</Typography>
                        <span className="text-xs font-medium opacity-70">{SCHEDULE_TYPE_LABEL[s.type]}</span>
                      </Box>
                      <Typography variant="caption" className="opacity-80">
                        {s.daysOfWeek.length > 0 ? `${s.daysOfWeek.map((d) => DAY_NAMES[d] ?? '').join(', ')} — ` : ''}{s.time}
                      </Typography>
                      {s.description && (
                        <Typography variant="caption" className="block mt-0.5 opacity-70">
                          {s.description}
                        </Typography>
                      )}
                    </Box>
                    {isAdmin && (
                      <Box
                        as="button"
                        onClick={() => void deleteSchedule(churchId, s.id)}
                        className="text-neutral-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <Trash2 size={14} />
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {activeTab === 'events' && (
          <Box className="flex flex-col gap-4">
            {isAdmin && (
              <Box className="glass-card rounded-2xl p-4">
                <Box
                  as="button"
                  onClick={() => setShowEventForm((v) => !v)}
                  className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
                >
                  <PlusCircle size={16} />
                  {showEventForm ? 'Cancelar' : 'Adicionar evento'}
                </Box>
                {showEventForm && (
                  <Box className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Box className="sm:col-span-2 flex flex-col gap-1">
                      <label className="text-xs font-medium text-neutral-600">Título do Evento</label>
                      <input
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        placeholder="ex: Festa Junina da Paróquia"
                        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-400"
                      />
                    </Box>
                    <Box className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-neutral-600">Início</label>
                      <input
                        type="datetime-local"
                        value={eventStart}
                        onChange={(e) => setEventStart(e.target.value)}
                        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-400"
                      />
                    </Box>
                    <Box className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-neutral-600">Fim (opcional)</label>
                      <input
                        type="datetime-local"
                        value={eventEnd}
                        onChange={(e) => setEventEnd(e.target.value)}
                        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-400"
                      />
                    </Box>
                    <Box className="sm:col-span-2 flex flex-col gap-1">
                      <label className="text-xs font-medium text-neutral-600">Descrição (opcional)</label>
                      <textarea
                        value={eventDesc}
                        onChange={(e) => setEventDesc(e.target.value)}
                        rows={2}
                        placeholder="Detalhes do evento"
                        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-400 resize-none"
                      />
                    </Box>
                    <Box className="sm:col-span-2 flex flex-col gap-1">
                      <ImageUpload
                        label="Imagem do evento (opcional)"
                        value={eventImageUrl}
                        onChange={(url) => setEventImageUrl(url)}
                        shape="square"
                        size="md"
                      />
                    </Box>
                    <Box className="sm:col-span-2">
                      <Button
                        size="sm"
                        disabled={!eventTitle.trim() || !eventStart}
                        onClick={() => void handleSaveEvent()}
                      >
                        Salvar evento
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {events.length === 0 ? (
              <Box className="flex flex-col items-center gap-3 py-14 text-center">
                <Box className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50">
                  <CalendarDays size={24} className="text-violet-400" />
                </Box>
                <Typography variant="body2" className="text-neutral-400">
                  Nenhum evento cadastrado ainda.
                </Typography>
              </Box>
            ) : (
              <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {events.map((ev) => (
                  <Box key={ev.id} className="glass-card rounded-2xl overflow-hidden border border-neutral-100">
                    {ev.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ev.imageUrl} alt={ev.title} className="h-36 w-full object-cover" />
                    )}
                    <Box className="p-4 flex flex-col gap-2">
                      <Box className="flex items-start justify-between gap-2">
                        <Typography variant="subtitle2" weight="semibold" className="text-neutral-900">
                          {ev.title}
                        </Typography>
                        {isAdmin && (
                          <Box
                            as="button"
                            onClick={() => void deleteEvent(churchId, ev.id)}
                            className="text-neutral-300 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <Trash2 size={14} />
                          </Box>
                        )}
                      </Box>
                      <Box className="flex items-center gap-1 text-xs text-primary-600 font-medium">
                        <Calendar size={12} />
                        {new Date(ev.startDate).toLocaleDateString('pt-BR', {
                          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                        {ev.endDate && (
                          <span className="text-neutral-400 ml-1">
                            → {new Date(ev.endDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </span>
                        )}
                      </Box>
                      {ev.description && (
                        <Typography variant="body2" className="text-neutral-500">
                          {ev.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {activeTab === 'admins' && isAdmin && (
          <Box className="flex flex-col gap-4">
            <Box className="glass-card rounded-2xl p-5 flex flex-col gap-4">
              <Box className="flex items-center gap-2">
                <Box className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50">
                  <UserCog size={18} className="text-primary-600" />
                </Box>
                <Box>
                  <Typography variant="body1" weight="semibold" className="text-neutral-800">
                    Adicionar Administrador
                  </Typography>
                  <Typography variant="caption" className="text-neutral-500">
                    O administrador adicionado terá acesso total à gestão desta igreja.
                  </Typography>
                </Box>
              </Box>
              <Box className="flex gap-2">
                <Box className="flex-1 flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2">
                  <Mail size={15} className="text-neutral-400 flex-shrink-0" />
                  <input
                    type="email"
                    placeholder="E-mail do novo administrador"
                    value={adminEmail}
                    onChange={(e) => {
                      setAdminEmail(e.target.value);
                      resetAddAdmin();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && adminEmail.trim()) {
                        void addAdmin(churchId, adminEmail.trim()).then((ok) => {
                          if (ok) {
                            setAdminEmail('');
                            void fetchMembers(churchId);
                          }
                        });
                      }
                    }}
                    className="flex-1 text-sm outline-none bg-transparent"
                  />
                </Box>
                <Button
                  size="sm"
                  onClick={() =>
                    void addAdmin(churchId, adminEmail.trim()).then((ok) => {
                      if (ok) {
                        setAdminEmail('');
                        void fetchMembers(churchId);
                      }
                    })
                  }
                  isLoading={addingAdmin}
                  disabled={!adminEmail.trim()}
                >
                  Adicionar
                </Button>
              </Box>
              {addAdminError && (
                <Typography variant="caption" className="text-red-600">
                  {addAdminError}
                </Typography>
              )}
              {addAdminSuccess && (
                <Typography variant="caption" className="text-green-600 flex items-center gap-1">
                  <CheckCircle size={13} /> Administrador adicionado com sucesso!
                </Typography>
              )}
            </Box>

            <Box className="flex flex-col gap-2">
              <Typography variant="body2" weight="semibold" className="text-neutral-600">
                Administradores atuais
              </Typography>
              {members
                .filter((m) => m.role === 'ADMIN' || m.user.id === church.adminId)
                .map((member) => (
                  <Box key={member.id} className="glass-card flex items-center gap-3 rounded-xl p-4">
                    <Box className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 flex-shrink-0">
                      <Typography variant="caption" weight="bold" className="text-primary-700">
                        {member.user.name.charAt(0).toUpperCase()}
                      </Typography>
                    </Box>
                    <Box className="flex-1">
                      <Box className="flex items-center gap-2">
                        <Typography variant="body2" weight="semibold" className="text-neutral-800">
                          {member.user.name}
                        </Typography>
                        {member.user.id === church.adminId && (
                          <Badge variant="primary">Criador</Badge>
                        )}
                      </Box>
                      <Typography variant="caption" className="text-neutral-400">
                        {member.user.email}
                      </Typography>
                    </Box>
                    {member.user.id !== church.adminId && member.user.id !== user?.id && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() =>
                          void updateRole(churchId, member.user.id, 'MEMBER').then(
                            () => void fetchMembers(churchId),
                          )
                        }
                      >
                        Rebaixar
                      </Button>
                    )}
                  </Box>
                ))}
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

ChurchDetail.displayName = 'ChurchDetail';

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const SCHEDULE_TYPE_LABEL: Record<ScheduleType, string> = {
  MASS: 'Missa',
  CONFESSION: 'Confissão',
  MEETING: 'Reunião',
  OTHER: 'Outro',
};

const SCHEDULE_TYPE_ICON: Record<ScheduleType, React.ReactNode> = {
  MASS: <Church size={16} />,
  CONFESSION: <HandHeart size={16} />,
  MEETING: <BookOpen size={16} />,
  OTHER: <Ellipsis size={16} />,
};

const SCHEDULE_TYPE_COLOR: Record<ScheduleType, string> = {
  MASS: 'bg-sky-50 text-sky-700 border-sky-200',
  CONFESSION: 'bg-violet-50 text-violet-700 border-violet-200',
  MEETING: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  OTHER: 'bg-neutral-50 text-neutral-700 border-neutral-200',
};

export default ChurchDetail;
