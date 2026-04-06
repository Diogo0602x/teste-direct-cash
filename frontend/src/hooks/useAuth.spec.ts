import { renderHook, act } from "@testing-library/react";
import { useAuth } from "./useAuth";

const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockLogout = jest.fn();

jest.mock("@/context", () => ({
  useAuthContext: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: mockPush })),
}));

jest.mock("@/utils", () => ({
  extractErrorMessage: jest.fn((e: unknown) => (e instanceof Error ? e.message : "erro")),
}));

import { useAuthContext } from "@/context";
const mockedUseAuthContext = useAuthContext as jest.Mock;

describe("useAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogin.mockReset();
    mockRegister.mockReset();
    mockLogout.mockReset();
    mockPush.mockReset();
    
    mockedUseAuthContext.mockReturnValue({
      login: mockLogin,
      register: mockRegister,
      logout: mockLogout,
    });
  });

  describe("login", () => {
    it("deve chamar ctxLogin, redirecionar para /dashboard no sucesso", async () => {
      mockLogin.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login({ email: "a@b.com", password: "123" });
      });

      expect(mockLogin).toHaveBeenCalledWith({ email: "a@b.com", password: "123" });
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it("deve setar error quando ctxLogin lança exceção", async () => {
      mockLogin.mockRejectedValue(new Error("Credenciais inválidas"));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login({ email: "a@b.com", password: "errada" });
      });

      expect(result.current.error).toBe("Credenciais inválidas");
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("register", () => {
    it("deve chamar ctxRegister e redirecionar no sucesso", async () => {
      mockRegister.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.register({ name: "João", email: "j@b.com", password: "senha123" });
      });

      expect(mockRegister).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
      expect(result.current.error).toBeNull();
    });

    it("deve setar error quando ctxRegister lança exceção", async () => {
      mockRegister.mockRejectedValue(new Error("E-mail já usado"));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.register({ name: "João", email: "j@b.com", password: "senha123" });
      });

      expect(result.current.error).toBe("E-mail já usado");
    });
  });

  describe("logout", () => {
    it("deve chamar ctxLogout e redirecionar para /login", () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.logout();
      });

      expect(mockLogout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  describe("estado inicial", () => {
    it("deve iniciar com isLoading=false e error=null", () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
