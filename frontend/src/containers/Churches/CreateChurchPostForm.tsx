'use client';

import React, { useState } from 'react';
import { PenSquare } from 'lucide-react';
import { Box, Typography, Button, Input, Textarea, ImageUpload } from '@/components';
import { useCreatePost } from '@/hooks';

type Props = {
    churchId: string;
    onCreated: () => void;
    isAdmin: boolean;
};

const CreateChurchPostForm: React.FC<Props> = ({ churchId, onCreated, isAdmin }) => {
    const { createPost, isLoading } = useCreatePost();
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const handleSubmit = async (): Promise<void> => {
        if (!content.trim()) return;
        const post = await createPost({
            title: title.trim() || undefined,
            content,
            imageUrl: imageUrl || undefined,
            churchId,
        });
        if (post) {
            setTitle('');
            setContent('');
            setImageUrl('');
            setShowForm(false);
            onCreated();
        }
    };

    if (!showForm) {
        return (
            <Button size="sm" variant="outline" leftIcon={<PenSquare size={15} />} onClick={() => setShowForm(true)}>
                Criar Post
            </Button>
        );
    }

    return (
        <Box className="glass-card rounded-2xl p-5 flex flex-col gap-3">
            <Typography variant="h6" weight="semibold">
                Novo Post {isAdmin ? '' : '(aguardará aprovação)'}
            </Typography>
            <Input
                placeholder="Título (opcional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
            />
            <Textarea
                placeholder="Conteúdo *"
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
            <Box className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
                    Cancelar
                </Button>
                <Button size="sm" onClick={handleSubmit} isLoading={isLoading} disabled={!content.trim()}>
                    Publicar
                </Button>
            </Box>
        </Box>
    );
};

CreateChurchPostForm.displayName = 'CreateChurchPostForm';

export default CreateChurchPostForm;
