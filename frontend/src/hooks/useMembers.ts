'use client';

import { useState, useCallback } from 'react';
import { extractErrorMessage } from '@/utils';
import { churchesService } from '@/services';
import { useToast } from '@/context';
import type { ChurchMember } from '@/types';

type UseMembersReturn = {
  members: ChurchMember[];
  total: number;
  isLoading: boolean;
  error: string | null;
  fetchMembers: (churchId: string, page?: number) => Promise<void>;
};

type UseMemberRequestsReturn = {
  requests: ChurchMember[];
  isLoading: boolean;
  error: string | null;
  fetchRequests: (churchId: string) => Promise<void>;
  approve: (churchId: string, userId: string) => Promise<void>;
  reject: (churchId: string, userId: string) => Promise<void>;
  updateRole: (churchId: string, userId: string, role: 'ADMIN' | 'MEMBER') => Promise<void>;
  removeMember: (churchId: string, userId: string) => Promise<void>;
};

type UseJoinChurchReturn = {
  isLoading: boolean;
  error: string | null;
  joinChurch: (churchId: string) => Promise<ChurchMember | null>;
};

export function useMembers(): UseMembersReturn {
  const [members, setMembers] = useState<ChurchMember[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(
    async (churchId: string, page = 1): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await churchesService.getMembers(churchId, page, 20);
        setMembers(result.data);
        setTotal(result.total);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { members, total, isLoading, error, fetchMembers };
}

export function useMemberRequests(): UseMemberRequestsReturn {
  const [requests, setRequests] = useState<ChurchMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { error: showError, success: showSuccess } = useToast();

  const fetchRequests = useCallback(async (churchId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await churchesService.getRequests(churchId);
      setRequests(result);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approve = useCallback(
    async (churchId: string, userId: string): Promise<void> => {
      try {
        await churchesService.approveMember(churchId, userId);
        setRequests((prev) => prev.filter((r) => r.user.id !== userId));
        showSuccess('Membro aprovado!');
      } catch (err) {
        const msg = extractErrorMessage(err);
        setError(msg);
        showError(msg);
      }
    },
    [showSuccess, showError],
  );

  const reject = useCallback(
    async (churchId: string, userId: string): Promise<void> => {
      try {
        await churchesService.rejectMember(churchId, userId);
        setRequests((prev) => prev.filter((r) => r.user.id !== userId));
        showSuccess('Solicitação recusada.');
      } catch (err) {
        const msg = extractErrorMessage(err);
        setError(msg);
        showError(msg);
      }
    },
    [showSuccess, showError],
  );

  const updateRole = useCallback(
    async (churchId: string, userId: string, role: 'ADMIN' | 'MEMBER'): Promise<void> => {
      try {
        await churchesService.updateMemberRole(churchId, userId, role);
        showSuccess('Papel atualizado com sucesso!');
      } catch (err) {
        const msg = extractErrorMessage(err);
        setError(msg);
        showError(msg);
      }
    },
    [showSuccess, showError],
  );

  const removeMember = useCallback(
    async (churchId: string, userId: string): Promise<void> => {
      try {
        await churchesService.removeMember(churchId, userId);
        setRequests((prev) => prev.filter((r) => r.user.id !== userId));
        showSuccess('Membro removido.');
      } catch (err) {
        const msg = extractErrorMessage(err);
        setError(msg);
        showError(msg);
      }
    },
    [showSuccess, showError],
  );

  return { requests, isLoading, error, fetchRequests, approve, reject, updateRole, removeMember };
}

export function useJoinChurch(): UseJoinChurchReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { error: showError, success: showSuccess } = useToast();

  const joinChurch = useCallback(async (churchId: string): Promise<ChurchMember | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await churchesService.join(churchId);
      showSuccess('Solicitação enviada! Aguarde aprovação.');
      return result;
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg);
      showError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, showError]);

  return { isLoading, error, joinChurch };
}
