import { api } from '@/utils';
import type {
  Post,
  Comment,
  CreatePostPayload,
  PaginatedResponse,
} from '@/types';

export const postsService = {
  list: async (
    page: number,
    limit: number,
    churchId?: string,
  ): Promise<PaginatedResponse<Post>> => {
    const params: Record<string, unknown> = { page, limit };
    if (churchId) params.churchId = churchId;
    const { data } = await api.get<PaginatedResponse<Post>>('/posts', { params });
    return data;
  },

  getById: async (id: string): Promise<Post & { comments: Comment[] }> => {
    const { data } = await api.get<Post & { comments: Comment[] }>(`/posts/${id}`);
    return data;
  },

  create: async (payload: CreatePostPayload): Promise<Post> => {
    const { data } = await api.post<Post>('/posts', payload);
    return data;
  },

  toggleLike: async (postId: string): Promise<{ liked: boolean; count: number }> => {
    const { data } = await api.post<{ liked: boolean; count: number }>(
      `/posts/${postId}/like`,
    );
    return data;
  },

  addComment: async (postId: string, content: string): Promise<Comment> => {
    const { data } = await api.post<Comment>(`/posts/${postId}/comments`, { content });
    return data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete(`/posts/comments/${commentId}`);
  },

  getPending: async (churchId?: string): Promise<PaginatedResponse<Post>> => {
    const params: Record<string, unknown> = {};
    if (churchId) params.churchId = churchId;
    const { data } = await api.get<PaginatedResponse<Post>>('/posts/pending', { params });
    return data;
  },

  approve: async (postId: string): Promise<void> => {
    await api.patch(`/posts/${postId}/approve`);
  },

  reject: async (postId: string): Promise<void> => {
    await api.patch(`/posts/${postId}/reject`);
  },
};
