'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, Input, Textarea, ImageUpload } from '@/components';
import { useCreatePost } from '@/hooks';
import type { CreatePostPayload } from '@/types';

type Props = {
    onCreated: () => void;
    onCancel: () => void;
};

const CreateFeedPost: React.FC<Props> = ({ onCreated, onCancel }) => {
    const { createPost, isLoading } = useCreatePost();
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const handleCreate = async (): Promise<void> => {
        if (!content.trim()) return;
        const payload: CreatePostPayload = {
            content,
            title: title.trim() || undefined,
            imageUrl: imageUrl || undefined,
        };
        const post = await createPost(payload);
        if (post) {
            setContent('');
            setTitle('');
            setImageUrl('');
            onCreated();
        }
    };

    return (
        <Box className="glass-card rounded-2xl p-5 flex flex-col gap-3">
            <Typography variant="h6" weight="semibold" className="text-neutral-800">
                Nova publicação
            </Typography>
            <Input
                placeholder="Título (opcional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                size="sm"
            />
            <Textarea
                placeholder="O que você quer compartilhar?"
                rows={4}
                value={content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                fullWidth
            />
            <ImageUpload
                label="Imagem (opcional)"
                value={imageUrl}
                onChange={setImageUrl}
                shape="square"
                size="md"
            />
            <Box className="flex items-center justify-between">
                <Typography variant="caption" className="text-neutral-400">
                    Post publicado no feed geral
                </Typography>
                <Box className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button size="sm" onClick={handleCreate} isLoading={isLoading} disabled={!content.trim()}>
                        Publicar
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

CreateFeedPost.displayName = 'CreateFeedPost';

export default CreateFeedPost;
