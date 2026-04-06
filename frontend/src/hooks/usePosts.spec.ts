import { renderHook, act, waitFor } from "@testing-library/react";
import { usePosts, usePost, useCreatePost, usePendingPosts } from "./usePosts";

jest.mock("@/context", () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn(), toast: jest.fn() }),
}));

jest.mock("@/services", () => ({
  postsService: {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    toggleLike: jest.fn(),
    addComment: jest.fn(),
    deleteComment: jest.fn(),
    getPending: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
  },
}));

jest.mock("@/utils", () => ({
  extractErrorMessage: jest.fn((e: unknown) => (e instanceof Error ? e.message : "erro")),
}));

import { postsService } from "@/services";
import { extractErrorMessage } from "@/utils";

const mockService = postsService as jest.Mocked<typeof postsService>;
const mockExtract = extractErrorMessage as jest.Mock;

const post = {
  id: "p1",
  title: "Post",
  content: "X",
  imageUrl: null,
  status: "APPROVED" as const,
  churchId: "c1",
  createdAt: "",
  updatedAt: "",
  author: { id: "u1", name: "João", avatarUrl: null },
  church: null,
  _count: { likes: 0, comments: 0 },
  likedByMe: false,
};

const comment = {
  id: "cm1",
  content: "Ótimo",
  createdAt: "",
  updatedAt: "",
  author: { id: "u1", name: "João", avatarUrl: null },
  _count: { likes: 0 },
};

const paginated = { data: [post], total: 1, page: 1, limit: 10, totalPages: 1 };

describe("usePosts", () => {
  beforeEach(jest.resetAllMocks);

  it("deve buscar posts na montagem", async () => {
    mockService.list.mockResolvedValue(paginated);

    const { result } = renderHook(() => usePosts());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.posts).toHaveLength(1);
    expect(result.current.total).toBe(1);
  });

  it("deve buscar posts com churchId fornecido na montagem", async () => {
    mockService.list.mockResolvedValue(paginated);

    const { result } = renderHook(() => usePosts("c1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockService.list).toHaveBeenCalledWith(1, 10, "c1");
  });

  it("deve setar erro quando busca falha", async () => {
    mockService.list.mockRejectedValue(new Error("Falha"));
    mockExtract.mockReturnValue("Falha");

    const { result } = renderHook(() => usePosts());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Falha");
  });

  it("deve buscar com churchId e page via fetchPosts", async () => {
    mockService.list.mockResolvedValue(paginated);

    const { result } = renderHook(() => usePosts());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.fetchPosts(2, "c1");
    });

    expect(mockService.list).toHaveBeenLastCalledWith(2, 10, "c1");
  });
});

describe("usePost", () => {
  beforeEach(jest.resetAllMocks);

  it("deve buscar um post com comentários via fetchPost", async () => {
    mockService.getById.mockResolvedValue({ ...post, comments: [comment] });

    const { result } = renderHook(() => usePost());

    await act(async () => {
      await result.current.fetchPost("p1");
    });

    expect(result.current.post).toBeDefined();
    expect(result.current.comments).toHaveLength(1);
  });

  it("deve buscar post sem comments (undefined)", async () => {
    mockService.getById.mockResolvedValue({ ...post, comments: undefined as unknown as typeof comment[] });

    const { result } = renderHook(() => usePost());

    await act(async () => {
      await result.current.fetchPost("p1");
    });

    expect(result.current.comments).toEqual([]);
  });

  it("deve setar erro quando fetchPost falha", async () => {
    mockService.getById.mockRejectedValue(new Error("Not found"));
    mockExtract.mockReturnValue("Not found");

    const { result } = renderHook(() => usePost());

    await act(async () => {
      await result.current.fetchPost("p1");
    });

    expect(result.current.error).toBe("Not found");
  });

  it("deve alternar like e atualizar contador", async () => {
    mockService.getById.mockResolvedValue({ ...post, comments: [] });
    mockService.toggleLike.mockResolvedValue({ liked: true, count: 1 });

    const { result } = renderHook(() => usePost());

    await act(async () => {
      await result.current.fetchPost("p1");
    });

    await act(async () => {
      await result.current.toggleLike("p1");
    });

    expect(result.current.post?._count.likes).toBe(1);
    expect(result.current.post?.likedByMe).toBe(true);
  });

  it("deve lidar com toggleLike quando post é null", async () => {
    mockService.toggleLike.mockResolvedValue({ liked: true, count: 1 });

    const { result } = renderHook(() => usePost());

    await act(async () => {
      await result.current.toggleLike("p1");
    });

    expect(result.current.post).toBeNull();
  });

  it("deve setar erro quando toggleLike falha", async () => {
    mockService.toggleLike.mockRejectedValue(new Error("Erro like"));
    mockExtract.mockReturnValue("Erro like");

    const { result } = renderHook(() => usePost());

    await act(async () => {
      await result.current.toggleLike("p1");
    });

    expect(result.current.error).toBe("Erro like");
  });

  it("deve adicionar comentário e atualizar contador", async () => {
    mockService.getById.mockResolvedValue({ ...post, comments: [] });
    mockService.addComment.mockResolvedValue(comment);

    const { result } = renderHook(() => usePost());

    await act(async () => {
      await result.current.fetchPost("p1");
      await result.current.addComment("p1", "Ótimo!");
    });

    expect(result.current.comments).toHaveLength(1);
    expect(result.current.post?._count.comments).toBe(1);
  });

  it("deve lidar com addComment quando post é null", async () => {
    mockService.addComment.mockResolvedValue(comment);

    const { result } = renderHook(() => usePost());

    await act(async () => {
      await result.current.addComment("p1", "Ótimo!");
    });

    expect(result.current.post).toBeNull();
  });

  it("deve setar erro quando addComment falha", async () => {
    mockService.addComment.mockRejectedValue(new Error("Erro comentário"));
    mockExtract.mockReturnValue("Erro comentário");

    const { result } = renderHook(() => usePost());

    await act(async () => {
      await result.current.addComment("p1", "X");
    });

    expect(result.current.error).toBe("Erro comentário");
  });

  it("deve deletar comentário e decrementar contador", async () => {
    mockService.getById.mockResolvedValue({
      ...post,
      _count: { likes: 0, comments: 1 },
      comments: [comment],
    });
    mockService.deleteComment.mockResolvedValue(undefined);

    const { result } = renderHook(() => usePost());

    await act(async () => {
      await result.current.fetchPost("p1");
      await result.current.deleteComment("cm1");
    });

    expect(result.current.comments).toHaveLength(0);
    expect(result.current.post?._count.comments).toBe(0);
  });

  it("deve lidar com deleteComment quando post é null", async () => {
    mockService.deleteComment.mockResolvedValue(undefined);

    const { result } = renderHook(() => usePost());

    await act(async () => {
      await result.current.deleteComment("cm1");
    });

    expect(result.current.post).toBeNull();
  });

  it("deve setar erro quando deleteComment falha", async () => {
    mockService.deleteComment.mockRejectedValue(new Error("Erro delete"));
    mockExtract.mockReturnValue("Erro delete");

    const { result } = renderHook(() => usePost());

    await act(async () => {
      await result.current.deleteComment("cm1");
    });

    expect(result.current.error).toBe("Erro delete");
  });
});

describe("useCreatePost", () => {
  beforeEach(jest.resetAllMocks);

  it("deve criar post e retornar dados", async () => {
    mockService.create.mockResolvedValue(post);

    const { result } = renderHook(() => useCreatePost());

    let created;
    await act(async () => {
      created = await result.current.createPost({ title: "Post", content: "X" });
    });

    expect(created).toEqual(post);
    expect(result.current.isLoading).toBe(false);
  });

  it("deve retornar null e setar erro quando createPost falha", async () => {
    mockService.create.mockRejectedValue(new Error("Erro criação"));
    mockExtract.mockReturnValue("Erro criação");

    const { result } = renderHook(() => useCreatePost());

    let created;
    await act(async () => {
      created = await result.current.createPost({ title: "P", content: "X" });
    });

    expect(created).toBeNull();
    expect(result.current.error).toBe("Erro criação");
  });

});

describe("usePendingPosts", () => {
  beforeEach(jest.resetAllMocks);

  it("deve buscar posts pendentes via fetchPending", async () => {
    mockService.getPending.mockResolvedValue(paginated);

    const { result } = renderHook(() => usePendingPosts());

    await act(async () => {
      await result.current.fetchPending("c1");
    });

    expect(result.current.posts).toHaveLength(1);
  });

  it("deve setar erro quando fetchPending falha", async () => {
    mockService.getPending.mockRejectedValue(new Error("Falha"));
    mockExtract.mockReturnValue("Falha");

    const { result } = renderHook(() => usePendingPosts());

    await act(async () => {
      await result.current.fetchPending("c1");
    });

    expect(result.current.error).toBe("Falha");
  });

  it("deve aprovar post e removê-lo da lista", async () => {
    mockService.getPending.mockResolvedValue(paginated);
    mockService.approve.mockResolvedValue(undefined);

    const { result } = renderHook(() => usePendingPosts());

    await act(async () => {
      await result.current.fetchPending("c1");
    });

    await act(async () => {
      await result.current.approvePost("p1");
    });

    expect(result.current.posts).toHaveLength(0);
  });

  it("deve setar erro quando approvePost falha", async () => {
    mockService.approve.mockRejectedValue(new Error("Erro aprovação"));
    mockExtract.mockReturnValue("Erro aprovação");

    const { result } = renderHook(() => usePendingPosts());

    await act(async () => {
      await result.current.approvePost("p1");
    });

    expect(result.current.error).toBe("Erro aprovação");
  });

  it("deve rejeitar post e removê-lo da lista", async () => {
    mockService.getPending.mockResolvedValue(paginated);
    mockService.reject.mockResolvedValue(undefined);

    const { result } = renderHook(() => usePendingPosts());

    await act(async () => {
      await result.current.fetchPending("c1");
    });

    await act(async () => {
      await result.current.rejectPost("p1");
    });

    expect(result.current.posts).toHaveLength(0);
  });

  it("deve setar erro quando rejectPost falha", async () => {
    mockService.reject.mockRejectedValue(new Error("Erro rejeição"));
    mockExtract.mockReturnValue("Erro rejeição");

    const { result } = renderHook(() => usePendingPosts());

    await act(async () => {
      await result.current.rejectPost("p1");
    });

    expect(result.current.error).toBe("Erro rejeição");
  });
});
