import { renderHook, act, waitFor } from "@testing-library/react";
import { useChurches, useChurch, useLookupCnpj, useAddAdmin } from "./useChurch";

jest.mock("@/context", () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn(), toast: jest.fn() }),
}));

jest.mock("@/services", () => ({
  churchesService: {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    lookupCnpj: jest.fn(),
    addAdmin: jest.fn(),
  },
}));

jest.mock("@/utils", () => ({
  extractErrorMessage: jest.fn((e: unknown) => (e instanceof Error ? e.message : "erro")),
}));

import { churchesService } from "@/services";
import { extractErrorMessage } from "@/utils";

const mockService = churchesService as jest.Mocked<typeof churchesService>;
const mockExtract = extractErrorMessage as jest.Mock;

const church = { id: "c1", name: "Igreja A", adminId: "u1", cnpj: null, cnpjRazaoSocial: null, cnpjNomeFantasia: null, description: null, address: null, city: null, state: null, zipCode: null, logoUrl: null, website: null, createdAt: "", updatedAt: "" };
const churchWithAdmin = { ...church, admin: { id: "u1", name: "Admin", email: "admin@test.com", avatarUrl: null }, _count: { members: 0 } };
const paginated = { data: [church], total: 1, page: 1, limit: 10, totalPages: 1 };

describe("useChurches", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("deve buscar igrejas na montagem e retornar dados", async () => {
    mockService.list.mockResolvedValue(paginated as typeof paginated & { data: typeof church[] });

    const { result } = renderHook(() => useChurches());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.churches).toHaveLength(1);
    expect(result.current.total).toBe(1);
  });

  it("deve setar erro quando a busca falha", async () => {
    mockService.list.mockRejectedValue(new Error("Falha na rede"));
    mockExtract.mockReturnValue("Falha na rede");

    const { result } = renderHook(() => useChurches());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Falha na rede");
  });

  it("deve buscar com page e limit customizados via fetchChurches", async () => {
    mockService.list.mockResolvedValue(paginated as typeof paginated & { data: typeof church[] });
    const { result } = renderHook(() => useChurches());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.fetchChurches(2, 20);
    });

    expect(mockService.list).toHaveBeenCalledWith(2, 20);
  });
});

describe("useChurch", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("deve buscar uma igreja por id via fetchChurch", async () => {
    mockService.getById.mockResolvedValue(churchWithAdmin as unknown as Awaited<ReturnType<typeof mockService.getById>>);

    const { result } = renderHook(() => useChurch());

    await act(async () => {
      await result.current.fetchChurch("c1");
    });

    expect(result.current.church).toEqual(churchWithAdmin);
    expect(result.current.isLoading).toBe(false);
  });

  it("deve setar erro quando fetchChurch falha", async () => {
    mockService.getById.mockRejectedValue(new Error("Not found"));
    mockExtract.mockReturnValue("Not found");

    const { result } = renderHook(() => useChurch());

    await act(async () => {
      await result.current.fetchChurch("c1");
    });

    expect(result.current.error).toBe("Not found");
  });

  it("deve criar uma nova igreja via createChurch e retornar dados", async () => {
    mockService.create.mockResolvedValue(church as unknown as Awaited<ReturnType<typeof mockService.create>>);

    const { result } = renderHook(() => useChurch());

    let created;
    await act(async () => {
      created = await result.current.createChurch({ cnpj: "00108217011154" });
    });

    expect(created).toEqual(church);
  });

  it("deve setar erro e retornar null quando createChurch falha", async () => {
    mockService.create.mockRejectedValue(new Error("Erro"));
    mockExtract.mockReturnValue("Erro");

    const { result } = renderHook(() => useChurch());

    let created;
    await act(async () => {
      created = await result.current.createChurch({ cnpj: "00108217011154" });
    });

    expect(created).toBeNull();
    expect(result.current.error).toBe("Erro");
  });

  it("deve deletar uma igreja via deleteChurch e retornar true", async () => {
    mockService.remove.mockResolvedValue(undefined);

    const { result } = renderHook(() => useChurch());

    let deleted;
    await act(async () => {
      deleted = await result.current.deleteChurch("c1");
    });

    expect(deleted).toBe(true);
  });

  it("deve retornar false e setar erro quando deleteChurch falha", async () => {
    mockService.remove.mockRejectedValue(new Error("Erro"));
    mockExtract.mockReturnValue("Erro");

    const { result } = renderHook(() => useChurch());

    let deleted;
    await act(async () => {
      deleted = await result.current.deleteChurch("c1");
    });

    expect(deleted).toBe(false);
    expect(result.current.error).toBe("Erro");
  });
});

describe("useLookupCnpj", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const cnpjData = {
    cnpj: "00108217011154",
    cnpjFormatted: "00.108.217/0111-54",
    razaoSocial: "MITRA ARQUIDIOCESANA DE BRASILIA",
    nomeFantasia: "PAROQUIA NOSSA SENHORA DA ASSUNCAO",
    name: "PAROQUIA NOSSA SENHORA DA ASSUNCAO",
    city: "BRASILIA",
    state: "DF",
    zipCode: "70000000",
  };

  it("deve buscar dados do CNPJ e retornar resultado", async () => {
    mockService.lookupCnpj.mockResolvedValue(cnpjData);

    const { result } = renderHook(() => useLookupCnpj());

    let lookupResult;
    await act(async () => {
      lookupResult = await result.current.lookup("00.108.217/0111-54");
    });

    expect(mockService.lookupCnpj).toHaveBeenCalledWith("00108217011154");
    expect(lookupResult).toEqual(cnpjData);
    expect(result.current.result).toEqual(cnpjData);
  });

  it("deve setar erro e retornar null quando lookup falha", async () => {
    mockService.lookupCnpj.mockRejectedValue(new Error("CNPJ inválido"));
    mockExtract.mockReturnValue("CNPJ inválido");

    const { result } = renderHook(() => useLookupCnpj());

    let lookupResult;
    await act(async () => {
      lookupResult = await result.current.lookup("00000000000000");
    });

    expect(lookupResult).toBeNull();
    expect(result.current.error).toBe("CNPJ inválido");
  });

  it("deve limpar estado com reset()", async () => {
    mockService.lookupCnpj.mockResolvedValue(cnpjData);

    const { result } = renderHook(() => useLookupCnpj());

    await act(async () => {
      await result.current.lookup("00108217011154");
    });

    expect(result.current.result).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});

describe("useAddAdmin", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("deve adicionar admin e retornar true no sucesso", async () => {
    mockService.addAdmin.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAddAdmin());

    let ok;
    await act(async () => {
      ok = await result.current.addAdmin("c1", "admin@test.com");
    });

    expect(ok).toBe(true);
    expect(result.current.success).toBe(true);
    expect(mockService.addAdmin).toHaveBeenCalledWith("c1", "admin@test.com");
  });

  it("deve setar erro e retornar false quando falha", async () => {
    mockService.addAdmin.mockRejectedValue(new Error("Usuário não encontrado"));
    mockExtract.mockReturnValue("Usuário não encontrado");

    const { result } = renderHook(() => useAddAdmin());

    let ok;
    await act(async () => {
      ok = await result.current.addAdmin("c1", "naoexiste@test.com");
    });

    expect(ok).toBe(false);
    expect(result.current.error).toBe("Usuário não encontrado");
    expect(result.current.success).toBe(false);
  });

  it("deve limpar estado com reset()", async () => {
    mockService.addAdmin.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAddAdmin());

    await act(async () => {
      await result.current.addAdmin("c1", "a@b.com");
    });

    expect(result.current.success).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.success).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

