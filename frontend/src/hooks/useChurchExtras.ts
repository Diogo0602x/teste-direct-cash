'use client';

import { useState, useCallback } from 'react';
import { extractErrorMessage } from '@/utils';
import { churchesService, uploadService } from '@/services';
import { useToast } from '@/context';
import type { ChurchSchedule, ChurchEvent, CreateSchedulePayload, CreateEventPayload } from '@/types';

// ─── Schedules ─────────────────────────────────────────────────────────────

type UseSchedulesReturn = {
  schedules: ChurchSchedule[];
  isLoading: boolean;
  error: string | null;
  fetchSchedules: (churchId: string) => Promise<void>;
  createSchedule: (churchId: string, payload: CreateSchedulePayload) => Promise<ChurchSchedule | null>;
  deleteSchedule: (churchId: string, scheduleId: string) => Promise<boolean>;
};

export function useSchedules(): UseSchedulesReturn {
  const [schedules, setSchedules] = useState<ChurchSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { error: showError, success: showSuccess } = useToast();

  const fetchSchedules = useCallback(async (churchId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await churchesService.getSchedules(churchId);
      setSchedules(result);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSchedule = useCallback(async (
    churchId: string,
    payload: CreateSchedulePayload,
  ): Promise<ChurchSchedule | null> => {
    try {
      const result = await churchesService.createSchedule(churchId, payload);
      setSchedules((prev) => [...prev, result]);
      showSuccess('Horário cadastrado com sucesso!');
      return result;
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg);
      showError(msg);
      return null;
    }
  }, [showSuccess, showError]);

  const deleteSchedule = useCallback(async (churchId: string, scheduleId: string): Promise<boolean> => {
    try {
      await churchesService.deleteSchedule(churchId, scheduleId);
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
      showSuccess('Horário removido.');
      return true;
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg);
      showError(msg);
      return false;
    }
  }, [showSuccess, showError]);

  return { schedules, isLoading, error, fetchSchedules, createSchedule, deleteSchedule };
}

// ─── Events ────────────────────────────────────────────────────────────────

type UseEventsReturn = {
  events: ChurchEvent[];
  isLoading: boolean;
  error: string | null;
  fetchEvents: (churchId: string) => Promise<void>;
  createEvent: (churchId: string, payload: CreateEventPayload) => Promise<ChurchEvent | null>;
  deleteEvent: (churchId: string, eventId: string) => Promise<boolean>;
};

export function useEvents(): UseEventsReturn {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { error: showError, success: showSuccess } = useToast();

  const fetchEvents = useCallback(async (churchId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await churchesService.getEvents(churchId);
      setEvents(result);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createEvent = useCallback(async (
    churchId: string,
    payload: CreateEventPayload,
  ): Promise<ChurchEvent | null> => {
    try {
      const result = await churchesService.createEvent(churchId, payload);
      setEvents((prev) => [...prev, result].sort((a, b) => a.startDate.localeCompare(b.startDate)));
      showSuccess('Evento criado com sucesso!');
      return result;
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg);
      showError(msg);
      return null;
    }
  }, [showSuccess, showError]);

  const deleteEvent = useCallback(async (churchId: string, eventId: string): Promise<boolean> => {
    try {
      await churchesService.deleteEvent(churchId, eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      showSuccess('Evento removido.');
      return true;
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg);
      showError(msg);
      return false;
    }
  }, [showSuccess, showError]);

  return { events, isLoading, error, fetchEvents, createEvent, deleteEvent };
}

// ─── Upload ────────────────────────────────────────────────────────────────

type UseUploadReturn = {
  isLoading: boolean;
  error: string | null;
  upload: (file: File) => Promise<string | null>;
};

export function useUpload(): UseUploadReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const url = await uploadService.upload(file);
      return url;
    } catch (err) {
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, upload };
}

