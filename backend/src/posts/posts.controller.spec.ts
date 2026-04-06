import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";
import { AuthenticatedRequest } from "../types";

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findPending: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  approve: jest.fn(),
  reject: jest.fn(),
  toggleLike: jest.fn(),
  getComments: jest.fn(),
  addComment: jest.fn(),
  removeComment: jest.fn(),
  toggleCommentLike: jest.fn(),
};

const req = { user: { sub: "user-1", email: "u@email.com" } } as AuthenticatedRequest;
const postResult = { id: "p1", title: "Post", status: "APPROVED" };

describe("PostsController", () => {
  let controller: PostsController;

  beforeEach(() => {
    controller = new PostsController(mockService as unknown as PostsService);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("deve chamar service.create com dto e userId", async () => {
      const dto = { title: "Post", content: "Texto" };
      mockService.create.mockResolvedValue(postResult);

      const result = await controller.create(dto, req);

      expect(mockService.create).toHaveBeenCalledWith(dto, "user-1");
      expect(result).toEqual(postResult);
    });
  });

  describe("findAll", () => {
    it("deve chamar service.findAll com params padrão", async () => {
      mockService.findAll.mockResolvedValue({ data: [postResult], total: 1 });

      await controller.findAll("1", "10", undefined);

      expect(mockService.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 }, undefined);
    });

    it("deve usar defaults quando page e limit são undefined", async () => {
      mockService.findAll.mockResolvedValue({ data: [], total: 0 });

      await controller.findAll(
        undefined as unknown as string,
        undefined as unknown as string,
        undefined,
      );

      expect(mockService.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 }, undefined);
    });

    it("deve limitar o limit a 50", async () => {
      mockService.findAll.mockResolvedValue({ data: [], total: 0 });

      await controller.findAll("1", "999", "c1");

      expect(mockService.findAll).toHaveBeenCalledWith({ page: 1, limit: 50 }, "c1");
    });
  });

  describe("findPending", () => {
    it("deve chamar service.findPending com churchId e userId", async () => {
      mockService.findPending.mockResolvedValue({ data: [], total: 0 });

      await controller.findPending("c1", "1", "10", req);

      expect(mockService.findPending).toHaveBeenCalledWith({ page: 1, limit: 10 }, "c1", "user-1");
    });

    it("deve usar defaults quando page e limit são undefined", async () => {
      mockService.findPending.mockResolvedValue({ data: [], total: 0 });

      await controller.findPending(
        "c1",
        undefined as unknown as string,
        undefined as unknown as string,
        req,
      );

      expect(mockService.findPending).toHaveBeenCalledWith({ page: 1, limit: 10 }, "c1", "user-1");
    });
  });

  describe("findOne", () => {
    it("deve chamar service.findById com id", async () => {
      mockService.findById.mockResolvedValue(postResult);
      const fakeReq = { user: undefined };

      const result = await controller.findOne("p1", fakeReq);

      expect(mockService.findById).toHaveBeenCalledWith("p1", undefined);
      expect(result).toEqual(postResult);
    });

    it("deve passar userId quando usuário autenticado", async () => {
      mockService.findById.mockResolvedValue(postResult);

      await controller.findOne("p1", req as unknown as { user?: { sub: string } });

      expect(mockService.findById).toHaveBeenCalledWith("p1", "user-1");
    });
  });

  describe("update", () => {
    it("deve chamar service.update com id, dto e userId", async () => {
      const dto = { title: "Atualizado" };
      mockService.update.mockResolvedValue(postResult);

      await controller.update("p1", dto, req);

      expect(mockService.update).toHaveBeenCalledWith("p1", dto, "user-1");
    });
  });

  describe("remove", () => {
    it("deve chamar service.remove com id e userId", async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove("p1", req);

      expect(mockService.remove).toHaveBeenCalledWith("p1", "user-1");
    });
  });

  describe("approve", () => {
    it("deve chamar service.approve com id e userId", async () => {
      mockService.approve.mockResolvedValue({ ...postResult, status: "APPROVED" });

      await controller.approve("p1", req);

      expect(mockService.approve).toHaveBeenCalledWith("p1", "user-1");
    });
  });

  describe("reject", () => {
    it("deve chamar service.reject com id e userId", async () => {
      mockService.reject.mockResolvedValue({ ...postResult, status: "REJECTED" });

      await controller.reject("p1", req);

      expect(mockService.reject).toHaveBeenCalledWith("p1", "user-1");
    });
  });

  describe("toggleLike", () => {
    it("deve chamar service.toggleLike com postId e userId", async () => {
      mockService.toggleLike.mockResolvedValue({ liked: true, count: 1 });

      await controller.toggleLike("p1", req);

      expect(mockService.toggleLike).toHaveBeenCalledWith("p1", "user-1");
    });
  });

  describe("getComments", () => {
    it("deve chamar service.getComments com postId e params", async () => {
      mockService.getComments.mockResolvedValue({ data: [], total: 0 });

      await controller.getComments("p1", "1", "20");

      expect(mockService.getComments).toHaveBeenCalledWith("p1", { page: 1, limit: 20 });
    });

    it("deve usar defaults quando page e limit são undefined", async () => {
      mockService.getComments.mockResolvedValue({ data: [], total: 0 });

      await controller.getComments(
        "p1",
        undefined as unknown as string,
        undefined as unknown as string,
      );

      expect(mockService.getComments).toHaveBeenCalledWith("p1", { page: 1, limit: 20 });
    });

    it("deve limitar o limit a 50", async () => {
      mockService.getComments.mockResolvedValue({ data: [], total: 0 });

      await controller.getComments("p1", "1", "999");

      expect(mockService.getComments).toHaveBeenCalledWith("p1", { page: 1, limit: 50 });
    });
  });

  describe("addComment", () => {
    it("deve chamar service.addComment com postId, content e userId", async () => {
      mockService.addComment.mockResolvedValue({ id: "cm1", content: "Texto" });

      await controller.addComment("p1", { content: "Texto" }, req);

      expect(mockService.addComment).toHaveBeenCalledWith("p1", "Texto", "user-1");
    });
  });

  describe("removeComment", () => {
    it("deve chamar service.removeComment com commentId e userId", async () => {
      mockService.removeComment.mockResolvedValue(undefined);

      await controller.removeComment("cm1", req);

      expect(mockService.removeComment).toHaveBeenCalledWith("cm1", "user-1");
    });
  });

  describe("toggleCommentLike", () => {
    it("deve chamar service.toggleCommentLike com commentId e userId", async () => {
      mockService.toggleCommentLike.mockResolvedValue({ liked: true, count: 1 });

      await controller.toggleCommentLike("cm1", req);

      expect(mockService.toggleCommentLike).toHaveBeenCalledWith("cm1", "user-1");
    });
  });
});
