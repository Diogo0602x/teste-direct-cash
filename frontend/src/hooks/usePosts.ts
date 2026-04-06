'use client';

import { useState, useCallback, useEffect } from 'react';
import { extractErrorMessage } from '@/utils';
import { postsService } from '@/services';
import { useToast } from '@/context';
import type {
  Post,
  Comment,
  CreatePostPayload,
} from '@/types';

type UsePostsReturn = {
  posts: Post[];
  total: number;
  isLoading: boolean;
  error: string | null;
  fetchPosts: (page?: number, churchId?: string) => Promise<void>;
};

type UsePostReturn = {
  post: Post | null;
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  fetchPost: (id: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
};

type UseCreatePostReturn = {
  isLoading: boolean;
  error: string | null;
  createPost: (payload: CreatePostPayload) => Promise<Post | null>;
};

type UsePendingPostsReturn = {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  fetchPending: (churchId?: string) => Promise<void>;
  approvePost: (postId: string) => Promise<void>;
  rejectPost: (postId: string) => Promise<void>;
};

export function usePosts(initialChurchId?: string): UsePostsReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(
    async (page = 1, churchId?: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const params: Record<string, unknown> = { page, limit: 10 };
        if (churchId ?? initialChurchId) {
          params.churchId = churchId ?? initialChurchId;
        }
        const result = await postsService.list(page, 10, (churchId ?? initialChurchId) as string | undefined);
        setPosts(result.data);
        setTotal(result.total);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [initialChurchId],
  );

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  return { posts, total, isLoading, error, fetchPosts };
}

export function usePost(): UsePostReturn {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await postsService.getById(id);
      const { comments: postComments, ...postData } = result;
      setPost(postData as Post);
      setComments(postComments ?? []);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleLike = useCallback(async (postId: string): Promise<void> => {
    try {
      const result = await postsService.toggleLike(postId);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              likedByMe: result.liked,
              _count: { ...prev._count, likes: result.count },
            }
          : prev,
      );
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }, []);

  const addComment = useCallback(
    async (postId: string, content: string): Promise<void> => {
      try {
        const result = await postsService.addComment(postId, content);
        setComments((prev) => [result, ...prev]);
        setPost((prev) =>
          prev
            ? {
                ...prev,
                _count: {
                  ...prev._count,
                  comments: prev._count.comments + 1,
                },
              }
            : prev,
        );
      } catch (err) {
        setError(extractErrorMessage(err));
      }
    },
    [],
  );

  const deleteComment = useCallback(async (commentId: string): Promise<void> => {
    try {
      await postsService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setPost((prev) =>
        prev
          ? {
              ...prev,
              _count: {
                ...prev._count,
                comments: Math.max(0, prev._count.comments - 1),
              },
            }
          : prev,
      );
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }, []);

  return { post, comments, isLoading, error, fetchPost, toggleLike, addComment, deleteComment };
}

export function useCreatePost(): UseCreatePostReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { error: showError, success: showSuccess } = useToast();

  const createPost = useCallback(
    async (payload: CreatePostPayload): Promise<Post | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await postsService.create(payload);
        showSuccess('Publicação enviada para aprovação!');
        return result;
      } catch (err) {
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

  return { isLoading, error, createPost };
}

export function usePendingPosts(): UsePendingPostsReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { error: showError, success: showSuccess } = useToast();

  const fetchPending = useCallback(async (churchId?: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await postsService.getPending(churchId);
      setPosts(result.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approvePost = useCallback(async (postId: string): Promise<void> => {
    try {
      await postsService.approve(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      showSuccess('Publicação aprovada!');
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg);
      showError(msg);
    }
  }, [showSuccess, showError]);

  const rejectPost = useCallback(async (postId: string): Promise<void> => {
    try {
      await postsService.reject(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      showSuccess('Publicação rejeitada.');
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg);
      showError(msg);
    }
  }, [showSuccess, showError]);

  return { posts, isLoading, error, fetchPending, approvePost, rejectPost };
}
