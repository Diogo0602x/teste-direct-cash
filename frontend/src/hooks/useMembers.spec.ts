import { renderHook, act } from "@testing-library/react";
import { useMembers, useMemberRequests, useJoinChurch } from "./useMembers";

jest.mock("@/context", () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn(), toast: jest.fn() }),
}));

jest.mock("@/services", () => ({
  churchesService: {
    getMembers: jest.fn(),
    getRequests: jest.fn(),
    approveMember: jest.fn(),
    rejectMember: jest.fn(),
    updateMemberRole: jest.fn(),
    removeMember: jest.fn(),
    join: jest.fn(),
  },
}));

jest.mock("@/utils", () => ({
  extractErrorMessage: jest.fn((e: unknown) => (e instanceof Error ? e.message : "erro")),
}));

import { churchesService } from "@/services";
import { extractErrorMessage } from "@/utils";

const mockService = churchesService as jest.Mocked<typeof churchesService>;
const mockExtract = extractErrorMessage as jest.Mock;

const member = {
  id: "m1",
  role: "MEMBER" as const,
  status: "ACTIVE" as const,
  joinedAt: "",
  user: { id: "u1", name: "João", email: "j@j.com", avatarUrl: null },
};

const paginated = { data: [member], total: 1, page: 1, limit: 20, totalPages: 1 };

describe("useMembers", () => {
  beforeEach(jest.resetAllMocks);

  it("deve buscar membros via fetchMembers", async () => {
    mockService.getMembers.mockResolvedValue(paginated);

    const { result } = renderHook(() => useMembers());

    await act(async () => {
      await result.current.fetchMembers("c1");
    });

    expect(result.current.members).toHaveLength(1);
    expect(result.current.total).toBe(1);
    expect(result.current.isLoading).toBe(false);
  });

  it("deve buscar membros com page personalizada", async () => {
    mockService.getMembers.mockResolvedValue({ data: [], total: 0, page: 2, limit: 20, totalPages: 0 });

    const { result } = renderHook(() => useMembers());

    await act(async () => {
      await result.current.fetchMembers("c1", 2);
    });

    expect(mockService.getMembers).toHaveBeenCalledWith("c1", 2, 20);
  });

  it("deve setar erro quando fetchMembers falha", async () => {
    mockService.getMembers.mockRejectedValue(new Error("Falha"));
    mockExtract.mockReturnValue("Falha");

    const { result } = renderHook(() => useMembers());

    await act(async () => {
      await result.current.fetchMembers("c1");
    });

    expect(result.current.error).toBe("Falha");
    expect(result.current.isLoading).toBe(false);
  });
});

describe("useMemberRequests", () => {
  beforeEach(jest.resetAllMocks);

  it("deve buscar solicitações via fetchRequests", async () => {
    mockService.getRequests.mockResolvedValue([member]);

    const { result } = renderHook(() => useMemberRequests());

    await act(async () => {
      await result.current.fetchRequests("c1");
    });

    expect(result.current.requests).toHaveLength(1);
    expect(result.current.isLoading).toBe(false);
  });

  it("deve setar erro quando fetchRequests falha", async () => {
    mockService.getRequests.mockRejectedValue(new Error("Falha requisições"));
    mockExtract.mockReturnValue("Falha requisições");

    const { result } = renderHook(() => useMemberRequests());

    await act(async () => {
      await result.current.fetchRequests("c1");
    });

    expect(result.current.error).toBe("Falha requisições");
  });

  it("deve aprovar membro e removê-lo das solicitações", async () => {
    mockService.getRequests.mockResolvedValue([member]);
    mockService.approveMember.mockResolvedValue(undefined);

    const { result } = renderHook(() => useMemberRequests());

    await act(async () => {
      await result.current.fetchRequests("c1");
    });

    await act(async () => {
      await result.current.approve("c1", "u1");
    });

    expect(result.current.requests).toHaveLength(0);
  });

  it("deve setar erro quando approve falha", async () => {
    mockService.approveMember.mockRejectedValue(new Error("Erro aprovação"));
    mockExtract.mockReturnValue("Erro aprovação");

    const { result } = renderHook(() => useMemberRequests());

    await act(async () => {
      await result.current.approve("c1", "u1");
    });

    expect(result.current.error).toBe("Erro aprovação");
  });

  it("deve rejeitar membro e removê-lo das solicitações", async () => {
    mockService.getRequests.mockResolvedValue([member]);
    mockService.rejectMember.mockResolvedValue(undefined);

    const { result } = renderHook(() => useMemberRequests());

    await act(async () => {
      await result.current.fetchRequests("c1");
    });

    await act(async () => {
      await result.current.reject("c1", "u1");
    });

    expect(result.current.requests).toHaveLength(0);
  });

  it("deve setar erro quando reject falha", async () => {
    mockService.rejectMember.mockRejectedValue(new Error("Erro rejeição"));
    mockExtract.mockReturnValue("Erro rejeição");

    const { result } = renderHook(() => useMemberRequests());

    await act(async () => {
      await result.current.reject("c1", "u1");
    });

    expect(result.current.error).toBe("Erro rejeição");
  });

  it("deve atualizar papel do membro via updateRole", async () => {
    mockService.updateMemberRole.mockResolvedValue(undefined);

    const { result } = renderHook(() => useMemberRequests());

    await act(async () => {
      await result.current.updateRole("c1", "u1", "ADMIN");
    });

    expect(mockService.updateMemberRole).toHaveBeenCalledWith("c1", "u1", "ADMIN");
    expect(result.current.error).toBeNull();
  });

  it("deve setar erro quando updateRole falha", async () => {
    mockService.updateMemberRole.mockRejectedValue(new Error("Erro papel"));
    mockExtract.mockReturnValue("Erro papel");

    const { result } = renderHook(() => useMemberRequests());

    await act(async () => {
      await result.current.updateRole("c1", "u1", "MEMBER");
    });

    expect(result.current.error).toBe("Erro papel");
  });

  it("deve remover membro via removeMember", async () => {
    mockService.getRequests.mockResolvedValue([member]);
    mockService.removeMember.mockResolvedValue(undefined);

    const { result } = renderHook(() => useMemberRequests());

    await act(async () => {
      await result.current.fetchRequests("c1");
    });

    await act(async () => {
      await result.current.removeMember("c1", "u1");
    });

    expect(result.current.requests).toHaveLength(0);
  });

  it("deve setar erro quando removeMember falha", async () => {
    mockService.removeMember.mockRejectedValue(new Error("Erro remoção"));
    mockExtract.mockReturnValue("Erro remoção");

    const { result } = renderHook(() => useMemberRequests());

    await act(async () => {
      await result.current.removeMember("c1", "u1");
    });

    expect(result.current.error).toBe("Erro remoção");
  });
});

describe("useJoinChurch", () => {
  beforeEach(jest.resetAllMocks);

  it("deve entrar na igreja e retornar o membro", async () => {
    mockService.join.mockResolvedValue(member);

    const { result } = renderHook(() => useJoinChurch());

    let joined;
    await act(async () => {
      joined = await result.current.joinChurch("c1");
    });

    expect(joined).toEqual(member);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("deve retornar null e setar erro quando joinChurch falha", async () => {
    mockService.join.mockRejectedValue(new Error("Falha ao entrar"));
    mockExtract.mockReturnValue("Falha ao entrar");

    const { result } = renderHook(() => useJoinChurch());

    let joined;
    await act(async () => {
      joined = await result.current.joinChurch("c1");
    });

    expect(joined).toBeNull();
    expect(result.current.error).toBe("Falha ao entrar");
  });
});

