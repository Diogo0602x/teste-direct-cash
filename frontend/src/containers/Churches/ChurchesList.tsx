'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Church, MapPin, Users, Search, ArrowLeft, Building2, LayoutGrid } from 'lucide-react';
import { Box, Container, Typography, Button, Input, Textarea } from '@/components';
import { useChurches, useChurch, useLookupCnpj } from '@/hooks';
import { useAuthContext } from '@/context';
import type { ChurchWithAdmin, CnpjLookupResult } from '@/types';
import { formatCnpjInput, cleanCnpj } from '@/utils';
import { useRouter } from 'next/navigation';

type RegistrationStep = 'idle' | 'search' | 'preview';

const ChurchesList: React.FC = () => {
  const { user } = useAuthContext();
  const { churches, total, isLoading, error } = useChurches();
  const { createChurch } = useChurch();
  const { result: cnpjResult, isLoading: lookingUp, error: lookupError, lookup, reset: resetLookup } = useLookupCnpj();
  const router = useRouter();

  const [step, setStep] = useState<RegistrationStep>('idle');
  const [cnpjInput, setCnpjInput] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCnpjInput(formatCnpjInput(e.target.value));
  };

  const handleLookup = async (): Promise<void> => {
    const cleaned = cleanCnpj(cnpjInput);
    if (cleaned.length !== 14) {
      setFormError('Digite um CNPJ válido com 14 dígitos');
      return;
    }
    setFormError(null);
    const result = await lookup(cleaned);
    if (result) setStep('preview');
  };

  const handleCreate = async (data: CnpjLookupResult): Promise<void> => {
    setCreating(true);
    setFormError(null);
    try {
      const church = await createChurch({
        cnpj: data.cnpj,
        description: description || undefined,
        website: website || undefined,
      });
      if (church) {
        router.push(`/churches/${church.id}`);
      } else {
        setFormError('Erro ao cadastrar a igreja');
      }
    } catch {
      setFormError('Erro ao cadastrar a igreja');
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = (): void => {
    setStep('idle');
    setCnpjInput('');
    setDescription('');
    setWebsite('');
    setFormError(null);
    resetLookup();
  };

  return (
    <Container as="main" size="xl" className="py-8">
      <Box className="flex flex-col gap-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 transition-colors w-fit">
          <ArrowLeft size={15} /> Voltar ao painel
        </Link>

        <Box className="flex flex-wrap items-start justify-between gap-3">
          <Box>
            <Typography variant="h5" weight="bold" className="text-neutral-900">
              Igrejas
            </Typography>
            <Typography variant="body2" className="text-neutral-500">
              {total > 0 ? `${total} igreja${total !== 1 ? 's' : ''} cadastrada${total !== 1 ? 's' : ''}` : 'Explore e encontre sua comunidade'}
            </Typography>
          </Box>
          {user && step === 'idle' && (
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Building2 size={15} />}
              onClick={() => setStep('search')}
            >
              Registrar minha Igreja
            </Button>
          )}
          {user && step !== 'idle' && (
            <Button size="sm" variant="outline" leftIcon={<ArrowLeft size={15} />} onClick={handleCancel}>
              Cancelar
            </Button>
          )}
        </Box>

        {step === 'search' && (
          <Box className="glass-card rounded-2xl p-5 flex flex-col gap-4">
            <Typography variant="h6" weight="semibold">
              Buscar igreja pelo CNPJ
            </Typography>
            <Typography variant="body2" className="text-neutral-500">
              Digite o CNPJ da instituição religiosa para consultar os dados na Receita Federal.
            </Typography>
            <Box className="flex gap-2">
              <Input
                placeholder="00.000.000/0000-00"
                value={cnpjInput}
                onChange={handleCnpjChange}
                maxLength={18}
                onKeyDown={(e) => { if (e.key === 'Enter') void handleLookup(); }}
                className="font-mono"
                fullWidth
              />
              <Button
                size="sm"
                leftIcon={<Search size={15} />}
                onClick={() => void handleLookup()}
                isLoading={lookingUp}
                disabled={cleanCnpj(cnpjInput).length !== 14}
              >
                Buscar
              </Button>
            </Box>
            {(formError ?? lookupError) && (
              <Typography variant="body2" className="text-red-600">
                {formError ?? lookupError}
              </Typography>
            )}
          </Box>
        )}

        {step === 'preview' && cnpjResult && (
          <Box className="glass-card rounded-2xl p-5 flex flex-col gap-4">
            <Box className="flex items-center gap-3">
              <Box className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 flex-shrink-0">
                <Building2 size={20} className="text-primary-600" />
              </Box>
              <Box>
                <Typography variant="h6" weight="semibold" className="text-neutral-800">
                  {cnpjResult.name}
                </Typography>
                <Typography variant="caption" className="text-neutral-400">
                  {cnpjResult.cnpjFormatted}
                </Typography>
              </Box>
            </Box>
            {cnpjResult.razaoSocial !== cnpjResult.name && (
              <Typography variant="body2" className="text-neutral-500">
                Razão Social: {cnpjResult.razaoSocial}
              </Typography>
            )}
            {(cnpjResult.city ?? cnpjResult.state) && (
              <Typography variant="body2" className="text-neutral-500 flex items-center gap-1">
                <MapPin size={14} /> {[cnpjResult.city, cnpjResult.state].filter(Boolean).join(', ')}
              </Typography>
            )}
            <Box className="border-t border-neutral-100 pt-3 flex flex-col gap-3">
              <Textarea
                placeholder="Descrição da comunidade (opcional)"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
              />
              <Input
                placeholder="Site (opcional, ex: https://minhaigreja.com.br)"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                fullWidth
              />
            </Box>
            {formError && (
              <Typography variant="body2" className="text-red-600">
                {formError}
              </Typography>
            )}
            <Box className="flex justify-between gap-2">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={15} />} onClick={() => setStep('search')}>
                Voltar
              </Button>
              <Button size="sm" onClick={() => void handleCreate(cnpjResult)} isLoading={creating}>
                Registrar Igreja
              </Button>
            </Box>
          </Box>
        )}

        {isLoading && (
          <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Box key={i} className="glass-card rounded-2xl p-5 flex flex-col gap-3 animate-pulse">
                <Box className="flex items-center gap-3">
                  <Box className="h-10 w-10 rounded-xl bg-neutral-200 flex-shrink-0" />
                  <Box className="h-4 w-40 rounded bg-neutral-200" />
                </Box>
                <Box className="h-3 w-full rounded bg-neutral-100" />
                <Box className="h-3 w-4/5 rounded bg-neutral-100" />
                <Box className="flex gap-4 pt-2 border-t border-neutral-100">
                  <Box className="h-3 w-20 rounded bg-neutral-100" />
                  <Box className="h-3 w-16 rounded bg-neutral-100 ml-auto" />
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {!isLoading && error && (
          <Box className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 flex flex-col gap-3">
            <Typography variant="body2" className="text-red-600">{error}</Typography>
            <Button size="sm" variant="outline" onClick={() => window.location.reload()}>Tentar novamente</Button>
          </Box>
        )}

        {!isLoading && churches.length === 0 && !error && (
          <Box className="flex flex-col items-center gap-4 py-20 text-center">
            <Box className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
              <LayoutGrid size={32} className="text-neutral-400" />
            </Box>
            <Box>
              <Typography variant="h6" weight="semibold" className="text-neutral-600">
                Nenhuma igreja cadastrada
              </Typography>
              <Typography variant="body2" className="text-neutral-400 mt-1">
                Seja o primeiro a registrar uma comunidade de fé!
              </Typography>
            </Box>
            {user && step === 'idle' && (
              <Button size="sm" leftIcon={<Building2 size={15} />} onClick={() => setStep('search')}>
                Registrar minha Igreja
              </Button>
            )}
          </Box>
        )}

        <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(churches as ChurchWithAdmin[]).map((church) => (
            <Link key={church.id} href={`/churches/${church.id}`} className="block">
              <Box className="glass-card flex flex-col gap-3 rounded-2xl p-5 transition-all hover:shadow-md hover:border-primary-200 cursor-pointer h-full group">
                <Box className="flex items-center gap-3">
                  <Box className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 flex-shrink-0 transition-transform group-hover:scale-110">
                    <Church size={20} className="text-primary-600" />
                  </Box>
                  <Typography variant="h6" weight="semibold" className="text-neutral-800 line-clamp-2">
                    {church.name}
                  </Typography>
                </Box>
                {church.description && (
                  <Typography variant="body2" className="text-neutral-500 line-clamp-2">
                    {church.description}
                  </Typography>
                )}
                <Box className="flex items-center gap-4 mt-auto pt-2 border-t border-neutral-100">
                  {(church.city ?? church.state) && (
                    <Typography variant="caption" className="text-neutral-400 flex items-center gap-1">
                      <MapPin size={12} /> {[church.city, church.state].filter(Boolean).join(', ')}
                    </Typography>
                  )}
                  <Typography variant="caption" className="text-neutral-400 ml-auto flex items-center gap-1">
                    <Users size={12} /> {church._count?.members ?? 0} membros
                  </Typography>
                </Box>
              </Box>
            </Link>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

ChurchesList.displayName = 'ChurchesList';

export default ChurchesList;
