import { renderHook, act } from "@testing-library/react";
import { useSchedules, useEvents, useUpload } from "./useChurchExtras";

jest.mock("@/context", () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn(), toast: jest.fn() }),
}));

jest.mock("@/services", () => ({
  churchesService: {
    getSchedules: jest.fn(),
    createSchedule: jest.fn(),
    deleteSchedule: jest.fn(),
    getEvents: jest.fn(),
    createEvent: jest.fn(),
    deleteEvent: jest.fn(),
  },
  uploadService: {
    upload: jest.fn(),
  },
}));

jest.mock("@/utils", () => ({
  extractErrorMessage: jest.fn((e: unknown) => (e instanceof Error ? e.message : "erro")),
}));

import { churchesService, uploadService } from "@/services";
import { extractErrorMessage } from "@/utils";

const mockChurches = churchesService as jest.Mocked<typeof churchesService>;
const mockUpload = uploadService as jest.Mocked<typeof uploadService>;
const mockExtract = extractErrorMessage as jest.Mock;

const schedule = {
  id: "s1",
  churchId: "c1",
  type: "MASS" as const,
  title: "Missa Dominical",
  daysOfWeek: [0],
  time: "09:00",
  description: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const event = {
  id: "e1",
  churchId: "c1",
  title: "Festa Junina",
  description: "Uma festa",
  startDate: "2026-06-01T18:00:00Z",
  endDate: null,
  imageUrl: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

// ─── useSchedules ──────────────────────────────────────────────────────────

describe("useSchedules", () => {
  beforeEach(jest.resetAllMocks);

  it("deve buscar horários via fetchSchedules", async () => {
    mockChurches.getSchedules.mockResolvedValue([schedule]);

    const { result } = renderHook(() => useSchedules());

    await act(async () => {
      await result.current.fetchSchedules("c1");
    });

    expect(result.current.schedules).toHaveLength(1);
    expect(result.current.schedules[0]).toEqual(schedule);
    expect(result.current.isLoading).toBe(false);
    expect(mockChurches.getSchedules).toHaveBeenCalledWith("c1");
  });

  it("deve setar erro quando fetchSchedules falha", async () => {
    mockChurches.getSchedules.mockRejectedValue(new Error("Falha"));
    mockExtract.mockReturnValue("Falha");

    const { result } = renderHook(() => useSchedules());

    await act(async () => {
      await result.current.fetchSchedules("c1");
    });

    expect(result.current.error).toBe("Falha");
    expect(result.current.schedules).toHaveLength(0);
    expect(result.current.isLoading).toBe(false);
  });

  it("deve criar horário e adicioná-lo à lista", async () => {
    mockChurches.createSchedule.mockResolvedValue(schedule);

    const { result } = renderHook(() => useSchedules());

    let created;
    await act(async () => {
      created = await result.current.createSchedule("c1", {
        type: "MASS",
        title: "Missa Dominical",
        time: "09:00",
      });
    });

    expect(created).toEqual(schedule);
    expect(result.current.schedules).toHaveLength(1);
    expect(mockChurches.createSchedule).toHaveBeenCalledWith("c1", {
      type: "MASS",
      title: "Missa Dominical",
      time: "09:00",
    });
  });

  it("deve retornar null e setar erro quando createSchedule falha", async () => {
    mockChurches.createSchedule.mockRejectedValue(new Error("Erro criação"));
    mockExtract.mockReturnValue("Erro criação");

    const { result } = renderHook(() => useSchedules());

    let created;
    await act(async () => {
      created = await result.current.createSchedule("c1", {
        type: "MASS",
        title: "Missa",
        time: "09:00",
      });
    });

    expect(created).toBeNull();
    expect(result.current.error).toBe("Erro criação");
  });

  it("deve deletar horário e removê-lo da lista", async () => {
    mockChurches.getSchedules.mockResolvedValue([schedule]);
    mockChurches.deleteSchedule.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSchedules());

    await act(async () => {
      await result.current.fetchSchedules("c1");
    });

    let deleted;
    await act(async () => {
      deleted = await result.current.deleteSchedule("c1", "s1");
    });

    expect(deleted).toBe(true);
    expect(result.current.schedules).toHaveLength(0);
    expect(mockChurches.deleteSchedule).toHaveBeenCalledWith("c1", "s1");
  });

  it("deve retornar false e setar erro quando deleteSchedule falha", async () => {
    mockChurches.deleteSchedule.mockRejectedValue(new Error("Erro remoção"));
    mockExtract.mockReturnValue("Erro remoção");

    const { result } = renderHook(() => useSchedules());

    let deleted;
    await act(async () => {
      deleted = await result.current.deleteSchedule("c1", "s1");
    });

    expect(deleted).toBe(false);
    expect(result.current.error).toBe("Erro remoção");
  });
});

// ─── useEvents ────────────────────────────────────────────────────────────

describe("useEvents", () => {
  beforeEach(jest.resetAllMocks);

  it("deve buscar eventos via fetchEvents", async () => {
    mockChurches.getEvents.mockResolvedValue([event]);

    const { result } = renderHook(() => useEvents());

    await act(async () => {
      await result.current.fetchEvents("c1");
    });

    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0]).toEqual(event);
    expect(result.current.isLoading).toBe(false);
    expect(mockChurches.getEvents).toHaveBeenCalledWith("c1");
  });

  it("deve setar erro quando fetchEvents falha", async () => {
    mockChurches.getEvents.mockRejectedValue(new Error("Falha eventos"));
    mockExtract.mockReturnValue("Falha eventos");

    const { result } = renderHook(() => useEvents());

    await act(async () => {
      await result.current.fetchEvents("c1");
    });

    expect(result.current.error).toBe("Falha eventos");
    expect(result.current.isLoading).toBe(false);
  });

  it("deve criar evento e adicioná-lo à lista ordenada por data", async () => {
    const earlierEvent = { ...event, id: "e0", startDate: "2026-05-01T00:00:00Z" };
    mockChurches.createEvent.mockResolvedValue(event);
    mockChurches.getEvents.mockResolvedValue([earlierEvent]);

    const { result } = renderHook(() => useEvents());

    await act(async () => {
      await result.current.fetchEvents("c1");
    });

    let created;
    await act(async () => {
      created = await result.current.createEvent("c1", {
        title: "Festa Junina",
        startDate: "2026-06-01T18:00:00Z",
      });
    });

    expect(created).toEqual(event);
    expect(result.current.events).toHaveLength(2);
    // deve estar ordenado: earlierEvent antes de event
    expect(result.current.events[0]?.id).toBe("e0");
    expect(result.current.events[1]?.id).toBe("e1");
  });

  it("deve retornar null e setar erro quando createEvent falha", async () => {
    mockChurches.createEvent.mockRejectedValue(new Error("Erro evento"));
    mockExtract.mockReturnValue("Erro evento");

    const { result } = renderHook(() => useEvents());

    let created;
    await act(async () => {
      created = await result.current.createEvent("c1", {
        title: "X",
        startDate: "2026-06-01T00:00:00Z",
      });
    });

    expect(created).toBeNull();
    expect(result.current.error).toBe("Erro evento");
  });

  it("deve deletar evento e removê-lo da lista", async () => {
    mockChurches.getEvents.mockResolvedValue([event]);
    mockChurches.deleteEvent.mockResolvedValue(undefined);

    const { result } = renderHook(() => useEvents());

    await act(async () => {
      await result.current.fetchEvents("c1");
    });

    let deleted;
    await act(async () => {
      deleted = await result.current.deleteEvent("c1", "e1");
    });

    expect(deleted).toBe(true);
    expect(result.current.events).toHaveLength(0);
    expect(mockChurches.deleteEvent).toHaveBeenCalledWith("c1", "e1");
  });

  it("deve retornar false e setar erro quando deleteEvent falha", async () => {
    mockChurches.deleteEvent.mockRejectedValue(new Error("Erro delete evento"));
    mockExtract.mockReturnValue("Erro delete evento");

    const { result } = renderHook(() => useEvents());

    let deleted;
    await act(async () => {
      deleted = await result.current.deleteEvent("c1", "e1");
    });

    expect(deleted).toBe(false);
    expect(result.current.error).toBe("Erro delete evento");
  });
});

// ─── useUpload ────────────────────────────────────────────────────────────

describe("useUpload", () => {
  beforeEach(jest.resetAllMocks);

  it("deve enviar arquivo e retornar URL", async () => {
    mockUpload.upload.mockResolvedValue("http://localhost:4000/uploads/img.jpg");

    const { result } = renderHook(() => useUpload());

    const file = new File(["content"], "image.jpg", { type: "image/jpeg" });

    let url;
    await act(async () => {
      url = await result.current.upload(file);
    });

    expect(url).toBe("http://localhost:4000/uploads/img.jpg");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockUpload.upload).toHaveBeenCalledWith(file);
  });

  it("deve setar erro e retornar null quando upload falha", async () => {
    mockUpload.upload.mockRejectedValue(new Error("Arquivo muito grande"));
    mockExtract.mockReturnValue("Arquivo muito grande");

    const { result } = renderHook(() => useUpload());

    const file = new File(["content"], "image.jpg", { type: "image/jpeg" });

    let url;
    await act(async () => {
      url = await result.current.upload(file);
    });

    expect(url).toBeNull();
    expect(result.current.error).toBe("Arquivo muito grande");
    expect(result.current.isLoading).toBe(false);
  });

  it("deve iniciar com isLoading=false e error=null", () => {
    const { result } = renderHook(() => useUpload());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
