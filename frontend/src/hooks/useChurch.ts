'use client';

import { useState, useCallback, useEffect } from 'react';
import { extractErrorMessage } from '@/utils';
import { churchesService } from '@/services';
import { useToast } from '@/context';
import type { Church, ChurchWithAdmin, CnpjLookupResult, CreateChurchPayload } from '@/types';

type UseChurchesReturn = {
  churches: Church[];
  total: number;
  isLoading: boolean;
  error: string | null;
  fetchChurches: (page?: number, limit?: number) => Promise<void>;
};

type UseChurchReturn = {
  church: ChurchWithAdmin | null;
  isLoading: boolean;
  error: string | null;
  fetchChurch: (id: string) => Promise<void>;
  createChurch: (payload: CreateChurchPayload) => Promise<Church | null>;
  deleteChurch: (id: string) => Promise<boolean>;
};

type UseLookupCnpjReturn = {
  result: CnpjLookupResult | null;
  isLoading: boolean;
  error: string | null;
  lookup: (cnpj: string) => Promise<CnpjLookupResult | null>;
  reset: () => void;
};

export function useChurches(initialPage = 1, limit = 10): UseChurchesReturn {
  const [churches, setChurches] = useState<Church[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChurches = useCallback(
    async (page = initialPage, pageLimit = limit): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await churchesService.list(page, pageLimit);
        setChurches(result.data);
        setTotal(result.total);
      } catch (err: unknown) {
        setError(extractErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [initialPage, limit],
  );

  useEffect(() => {
    void fetchChurches();
  }, [fetchChurches]);

  return { churches, total, isLoading, error, fetchChurches };
}

export function useChurch(): UseChurchReturn {
  const [church, setChurch] = useState<ChurchWithAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { error: showError, success: showSuccess } = useToast();

  const fetchChurch = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await churchesService.getById(id);
      setChurch(result);
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createChurch = useCallback(
    async (payload: CreateChurchPayload): Promise<Church | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await churchesService.create(payload);
        showSuccess('Igreja cadastrada com sucesso!');
        return result;
      } catch (err: unknown) {
        const msg = extractErrorMessage(err);
        setError(msg);
        showError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [showSuccess, showError],
  );

  const deleteChurch = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await churchesService.remove(id);
      showSuccess('Igreja removida com sucesso.');
      return true;
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      setError(msg);
      showError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, showError]);

  return { church, isLoading, error, fetchChurch, createChurch, deleteChurch };
}

export function useLookupCnpj(): UseLookupCnpjReturn {
  const [result, setResult] = useState<CnpjLookupResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async (cnpj: string): Promise<CnpjLookupResult | null> => {
    const cleaned = cnpj.replace(/\D/g, '');
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const result = await churchesService.lookupCnpj(cleaned);
      setResult(result);
      return result;
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, isLoading, error, lookup, reset };
}

type UseAddAdminReturn = {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  addAdmin: (churchId: string, email: string) => Promise<boolean>;
  reset: () => void;
};

export function useAddAdmin(): UseAddAdminReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { error: showError, success: showSuccess } = useToast();

  const addAdmin = useCallback(async (churchId: string, email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await churchesService.addAdmin(churchId, email);
      setSuccess(true);
      showSuccess('Administrador adicionado com sucesso!');
      return true;
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      setError(msg);
      showError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, showError]);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return { isLoading, error, success, addAdmin, reset };
}
