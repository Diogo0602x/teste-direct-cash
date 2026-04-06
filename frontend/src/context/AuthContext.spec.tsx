import React from "react";
import { render, act, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuthContext } from "./AuthContext";

jest.mock("./ToastContext", () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn(), toast: jest.fn() }),
}));

jest.mock("@/services", () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
  },
}));

import { authService } from "@/services";
const mockAuthService = authService as jest.Mocked<typeof authService>;

function TestConsumer() {
  const ctx = useAuthContext();
  return (
    <div>
      <span data-testid="status">{ctx.status}</span>
      <span data-testid="user">{ctx.user ? ctx.user.email : "null"}</span>
      <button onClick={() => void ctx.login({ email: "a@b.com", password: "123" })}>
        login
      </button>
      <button onClick={() => void ctx.register({ name: "A", email: "a@b.com", password: "123" })}>
        register
      </button>
      <button onClick={ctx.logout}>logout</button>
    </div>
  );
}

const mockUser = { id: "u1", name: "João", email: "joao@email.com", avatarUrl: null };

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
  });

  it("deve iniciar como 'loading' e depois 'unauthenticated' sem dados salvo", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("unauthenticated");
    });
  });

  it("deve restaurar sessão salva no localStorage", async () => {
    localStorage.setItem("access_token", "token-123");
    localStorage.setItem("auth_user", JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("authenticated");
      expect(screen.getByTestId("user").textContent).toBe("joao@email.com");
    });
  });

  it("deve limpar localStorage quando JSON salvo é inválido", async () => {
    localStorage.setItem("access_token", "token-123");
    localStorage.setItem("auth_user", "json-invalido");

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("unauthenticated");
    });
    expect(localStorage.getItem("access_token")).toBeNull();
  });

  it("deve fazer login salvando token e user no localStorage", async () => {
    mockAuthService.login.mockResolvedValue({ accessToken: "tk", user: mockUser });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByText("login").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("authenticated");
    });
    expect(localStorage.getItem("access_token")).toBe("tk");
  });

  it("deve registrar salvando token e user no localStorage", async () => {
    mockAuthService.register.mockResolvedValue({ accessToken: "tk2", user: mockUser });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByText("register").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("authenticated");
    });
    expect(localStorage.getItem("access_token")).toBe("tk2");
  });

  it("deve fazer logout limpando localStorage e user", async () => {
    localStorage.setItem("access_token", "token-123");
    localStorage.setItem("auth_user", JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("authenticated");
    });

    await act(async () => {
      screen.getByText("logout").click();
    });

    expect(screen.getByTestId("status").textContent).toBe("unauthenticated");
    expect(screen.getByTestId("user").textContent).toBe("null");
    expect(localStorage.getItem("access_token")).toBeNull();
  });
});

describe("useAuthContext fora do Provider", () => {
  it("deve lançar erro quando usado fora do AuthProvider", () => {
    
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);

    function BadConsumer() {
      useAuthContext();
      return null;
    }

    expect(() => render(<BadConsumer />)).toThrow(
      "useAuthContext deve ser usado dentro de <AuthProvider>",
    );

    spy.mockRestore();
  });
});
