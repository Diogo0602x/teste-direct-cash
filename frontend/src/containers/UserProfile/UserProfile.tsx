'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, UserCircle, Crown, Church, Users } from 'lucide-react';
import { Box, Container, Typography, Button, Input, Textarea, Badge, ImageUpload } from '@/components';
import { useAuthContext, useToast } from '@/context';
import { useMyProfile, useChurches, useJoinChurch } from '@/hooks';
import { usersService } from '@/services';
import { getInitials } from '@/utils';
import type { UpdateUserPayload } from '@/types';

const UserProfile: React.FC = () => {
  const { user } = useAuthContext();
  const { profile, refresh: refreshProfile } = useMyProfile();
  const { churches } = useChurches(1, 50);
  const { joinChurch, isLoading: joining } = useJoinChurch();
  const { success: toastSuccess, error: toastError } = useToast();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const [showJoinPanel, setShowJoinPanel] = useState(false);
  const [selectedChurchId, setSelectedChurchId] = useState('');
  const [requestedChurchId, setRequestedChurchId] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.avatarUrl) setAvatarUrl(profile.avatarUrl);
    if (profile?.bio) setBio(profile.bio);
  }, [profile]);

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    try {
      const payload: UpdateUserPayload = {};
      if (name.trim() && name !== user?.name) payload.name = name.trim();
      if (bio.trim()) payload.bio = bio.trim();
      if (avatarUrl) payload.avatarUrl = avatarUrl;
      await usersService.updateMe(payload);
      await refreshProfile();
      setEditing(false);
      toastSuccess('Perfil atualizado com sucesso!');
    } catch {
      toastError('Não foi possível salvar o perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestJoin = async (): Promise<void> => {
    if (!selectedChurchId) return;
    const churchId = selectedChurchId;
    const result = await joinChurch(churchId);
    if (result) {
      setRequestedChurchId(churchId);
      setSelectedChurchId('');
      setShowJoinPanel(false);
      void refreshProfile();
    }
  };

  if (!user) return null;

  const adminChurch = profile?.adminChurch;

  return (
    <Container as="main" size="sm" className="py-8">
      <Box className="flex flex-col gap-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 transition-colors w-fit"
        >
          <ArrowLeft size={15} /> Voltar ao painel
        </Link>

        <Box className="flex items-center gap-3">
          <Box className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
            <UserCircle size={22} className="text-primary-600" />
          </Box>
          <Box>
            <Typography variant="h5" weight="bold" className="text-neutral-900">
              Meu Perfil
            </Typography>
            <Typography variant="body2" className="text-neutral-500">
              Gerencie suas informações pessoais
            </Typography>
          </Box>
        </Box>

        <Box className="glass-card rounded-2xl p-6 flex flex-col gap-6">
          <Box className="flex items-center gap-4">
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={user.name}
                className="h-16 w-16 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <Box className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 flex-shrink-0">
                <Typography variant="h5" weight="bold" className="text-white">
                  {getInitials(user.name)}
                </Typography>
              </Box>
            )}
            <Box className="flex-1">
              <Box className="flex items-center gap-2 flex-wrap">
                <Typography variant="h5" weight="bold" className="text-neutral-900">
                  {user.name}
                </Typography>
                {adminChurch && (
                  <Badge variant="primary">
                    <Crown size={11} className="mr-1 inline" />
                    Admin
                  </Badge>
                )}
              </Box>
              <Typography variant="body2" className="text-neutral-500">
                {user.email}
              </Typography>
            </Box>
          </Box>

          {adminChurch && (
            <Box className="flex items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3">
              <Box className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 flex-shrink-0">
                <Church size={18} className="text-primary-600" />
              </Box>
              <Box>
                <Typography variant="caption" className="text-primary-500">
                  Administrador da Igreja
                </Typography>
                <Typography variant="body2" weight="semibold" className="text-primary-800">
                  {adminChurch.name}
                </Typography>
              </Box>
              <Link href={`/churches/${adminChurch.id}`} className="ml-auto">
                <Button variant="outline" size="xs">
                  Gerenciar
                </Button>
              </Link>
            </Box>
          )}

          {!adminChurch && (
            <Box className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <Box className="flex items-center justify-between gap-3">
                <Box className="flex items-center gap-2">
                  <Users size={16} className="text-neutral-400" />
                  <Typography variant="body2" className="text-neutral-600">
                    Você não é administrador de nenhuma igreja
                  </Typography>
                </Box>
                {requestedChurchId ? (
                  <Typography variant="caption" className="text-amber-600 font-medium">
                    Solicitação enviada — aguarde aprovação
                  </Typography>
                ) : (
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setShowJoinPanel((v) => !v)}
                  >
                    {showJoinPanel ? 'Cancelar' : 'Solicitar administração'}
                  </Button>
                )}
              </Box>

              {showJoinPanel && !requestedChurchId && (
                <Box className="mt-3 flex flex-col gap-2">
                  <Typography variant="caption" className="text-neutral-500">
                    Solicite administração de uma igreja para ser avaliado pelo responsável.
                  </Typography>
                  <Box className="flex gap-2">
                    <Box className="relative flex-1">
                      <select
                        value={selectedChurchId}
                        onChange={(e) => setSelectedChurchId(e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Selecione uma Igreja</option>
                        {churches.map((church) => (
                          <option key={church.id} value={church.id}>
                            {church.name}
                          </option>
                        ))}
                      </select>
                    </Box>
                    <Button
                      size="sm"
                      onClick={() => void handleRequestJoin()}
                      isLoading={joining}
                      disabled={!selectedChurchId}
                    >
                      Solicitar administração
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {editing ? (
            <Box className="flex flex-col gap-4">
              <ImageUpload
                label="Foto de perfil"
                value={avatarUrl}
                onChange={setAvatarUrl}
                shape="circle"
                size="md"
              />
              <Input
                label="Nome completo"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
              />
              <Textarea
                label="Bio"
                placeholder="Fale um pouco sobre você..."
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                fullWidth
              />
              <Box className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(false);
                    setName(user.name);
                  }}
                >
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSave} isLoading={saving}>
                  Salvar
                </Button>
              </Box>
            </Box>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Editar Perfil
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

UserProfile.displayName = 'UserProfile';

export default UserProfile;
