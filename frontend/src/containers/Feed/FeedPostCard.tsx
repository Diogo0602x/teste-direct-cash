'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Trash2, X } from 'lucide-react';
import { Box, Typography, Button, Input, PostImage } from '@/components';
import type { Post } from '@/types';
import { postsService } from '@/services';
import { api, extractErrorMessage } from '@/utils';

type Comment = { id: string; content: string; author: { id: string; name: string } };

type Props = {
  post: Post;
  currentUserId?: string;
  onRefresh: () => void;
};

const FeedPostCard: React.FC<Props> = ({ post, currentUserId, onRefresh }) => {
  const [likedByMe, setLikedByMe] = useState(post.likedByMe ?? false);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [likeError, setLikeError] = useState<string | null>(null);

  const handleLike = async (): Promise<void> => {
    if (!currentUserId) return;
    try {
      const { data } = await api.post<{ liked: boolean; count: number }>(`/posts/${post.id}/like`);
      setLikedByMe(data.liked);
      setLikeCount(data.count);
    } catch (err) {
      setLikeError(extractErrorMessage(err));
    }
  };

  const loadComments = async (): Promise<void> => {
    if (commentsLoaded) {
      setShowComments((v) => !v);
      return;
    }
    try {
      const { data } = await api.get<{ data: Comment[] }>(`/posts/${post.id}/comments`);
      setComments(data.data);
      setCommentsLoaded(true);
      setShowComments(true);
    } catch {
    }
  };

  const submitComment = async (): Promise<void> => {
    if (!commentText.trim()) return;
    try {
      const { data } = await api.post<Comment>(`/posts/${post.id}/comments`, { content: commentText });
      setComments((prev) => [data, ...prev]);
      setCommentText('');
      onRefresh();
    } catch {
    }
  };

  const deleteComment = async (commentId: string): Promise<void> => {
    try {
      await api.delete(`/posts/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
    }
  };

  const isAuthor = currentUserId !== undefined && currentUserId === post.author.id;

  const handleDeletePost = async (): Promise<void> => {
    try {
      await postsService.remove(post.id);
      onRefresh();
    } catch {
    }
  };

  return (
    <Box className="glass-card rounded-2xl p-5 flex flex-col gap-3">
      <Box className="flex items-center justify-between gap-2">
        <Box className="flex min-w-0 flex-1 items-center gap-2">
          <Box className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100">
            {post.author.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.author.avatarUrl} alt={post.author.name} className="h-full w-full object-cover" />
            ) : (
              <Typography variant="caption" weight="bold" className="text-primary-700">
                {post.author.name.charAt(0).toUpperCase()}
              </Typography>
            )}
          </Box>
          <Box className="min-w-0 flex flex-col">
            <Typography variant="body2" weight="semibold" className="text-neutral-800">
              {post.author.name}
            </Typography>
            {post.church && (
              <Typography variant="caption" className="text-neutral-400">
                {post.church.name}
              </Typography>
            )}
          </Box>
        </Box>
        <Box className="flex flex-shrink-0 items-center gap-1">
          <Typography variant="caption" className="text-neutral-400">
            {new Date(post.createdAt).toLocaleDateString('pt-BR')}
          </Typography>
          {isAuthor && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => void handleDeletePost()}
              aria-label="Excluir publicação"
              leftIcon={<Trash2 size={15} />}
            />
          )}
        </Box>
      </Box>

      {post.title && (
        <Typography variant="h6" weight="semibold" className="text-neutral-900">
          {post.title}
        </Typography>
      )}

      <Typography variant="body1" className="text-neutral-700 whitespace-pre-wrap">
        {post.content}
      </Typography>

      {post.imageUrl && <PostImage src={post.imageUrl} />}

      {likeError && (
        <Typography variant="caption" className="text-red-500">
          {likeError}
        </Typography>
      )}

      <Box className="flex items-center gap-4 border-t border-neutral-100 pt-3">
        <Box
          as="button"
          onClick={() => void handleLike()}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${likedByMe ? 'text-red-500' : 'text-neutral-400 hover:text-red-400'}`}
        >
          <Heart size={16} className={likedByMe ? 'fill-current' : ''} />
          {likeCount}
        </Box>
        <Box
          as="button"
          onClick={() => void loadComments()}
          className="flex items-center gap-1.5 text-sm font-medium text-neutral-400 hover:text-primary-600 transition-colors"
        >
          <MessageCircle size={16} />
          {post._count.comments}
        </Box>
      </Box>

      {showComments && (
        <Box className="flex flex-col gap-3 border-t border-neutral-100 pt-3">
          {currentUserId && (
            <Box className="flex gap-2">
              <Input
                placeholder="Escreva um comentário..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void submitComment();
                }}
                fullWidth
                size="sm"
              />
              <Button
                size="sm"
                onClick={() => void submitComment()}
                aria-label="Enviar comentário"
                leftIcon={<Send size={15} />}
              />
            </Box>
          )}
          {comments.map((comment) => (
            <Box key={comment.id} className="flex items-start gap-2">
              <Box className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 flex-shrink-0">
                <Typography variant="caption" className="text-neutral-600">
                  {comment.author.name.charAt(0).toUpperCase()}
                </Typography>
              </Box>
              <Box className="flex-1 rounded-lg bg-neutral-50 px-3 py-2">
                <Typography variant="caption" weight="semibold" className="text-neutral-800">
                  {comment.author.name}
                </Typography>
                <Typography variant="caption" className="text-neutral-600 block">
                  {comment.content}
                </Typography>
              </Box>
              {currentUserId === comment.author.id && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => void deleteComment(comment.id)}
                  aria-label="Excluir comentário"
                  leftIcon={<X size={14} />}
                />
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

FeedPostCard.displayName = 'FeedPostCard';

export default FeedPostCard;
