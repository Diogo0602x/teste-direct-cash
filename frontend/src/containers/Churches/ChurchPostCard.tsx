'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Trash2 } from 'lucide-react';
import { Box, Typography, Button } from '@/components';
import type { Post } from '@/types';
import { postsService } from '@/services';
import { api } from '@/utils';

type Props = {
  post: Post;
  isAdmin: boolean;
  currentUserId?: string;
  onRefresh: () => void;
};

const ChurchPostCard: React.FC<Props> = ({ post, isAdmin, currentUserId, onRefresh }) => {
  const [likedByMe, setLikedByMe] = useState(post.likedByMe ?? false);
  const [likeCount, setLikeCount] = useState(post._count.likes);

  const handleLike = async (): Promise<void> => {
    if (!currentUserId) return;
    try {
      const { data } = await api.post<{ liked: boolean; count: number }>(`/posts/${post.id}/like`);
      setLikedByMe(data.liked);
      setLikeCount(data.count);
    } catch {
    }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      await postsService.remove(post.id);
      onRefresh();
    } catch {
    }
  };

  return (
    <Box className="glass-card rounded-2xl p-5 flex flex-col gap-3">
      <Box className="flex items-center justify-between">
        <Box className="flex items-center gap-2">
          <Box className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 overflow-hidden flex-shrink-0">
            {post.author.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.author.avatarUrl} alt={post.author.name} className="h-full w-full object-cover" />
            ) : (
              <Typography variant="caption" weight="bold" className="text-primary-700">
                {post.author.name.charAt(0).toUpperCase()}
              </Typography>
            )}
          </Box>
          <Typography variant="body2" weight="semibold" className="text-neutral-800">
            {post.author.name}
          </Typography>
          <Typography variant="caption" className="text-neutral-400">
            {new Date(post.createdAt).toLocaleDateString('pt-BR')}
          </Typography>
        </Box>
        {(isAdmin || currentUserId === post.author.id) && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => void handleDelete()}
            aria-label="Excluir post"
            leftIcon={<Trash2 size={15} />}
          />
        )}
      </Box>
      {post.title && (
        <Typography variant="h6" weight="semibold" className="text-neutral-900">
          {post.title}
        </Typography>
      )}
      <Typography variant="body1" className="text-neutral-700 whitespace-pre-wrap">
        {post.content}
      </Typography>
      {post.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.imageUrl}
          alt="Imagem do post"
          className="w-full rounded-xl"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
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
        <Typography variant="caption" className="text-neutral-400 flex items-center gap-1.5">
          <MessageCircle size={14} /> {post._count.comments}
        </Typography>
      </Box>
    </Box>
  );
};

ChurchPostCard.displayName = 'ChurchPostCard';

export default ChurchPostCard;
