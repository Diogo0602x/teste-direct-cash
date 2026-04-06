'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PenSquare, X, ArrowLeft, Newspaper, Filter, CheckCircle, Clock } from 'lucide-react';
import { Box, Container, Typography, Button, Badge } from '@/components';
import { usePosts, usePendingPosts, useChurches } from '@/hooks';
import { useAuthContext } from '@/context';
import { useMyProfile } from '@/hooks';
import CreateFeedPost from './CreateFeedPost';
import FeedPostCard from './FeedPostCard';
import type { Church } from '@/types';

const Feed: React.FC = () => {
  const { user } = useAuthContext();
  const { profile } = useMyProfile();
  const { posts, isLoading, error, fetchPosts } = usePosts();
  const { posts: pendingPosts, fetchPending, approvePost, rejectPost } = usePendingPosts();
  const { churches } = useChurches(1, 50);

  const [showForm, setShowForm] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'pending'>('feed');

  const isAdmin = !!profile?.adminChurch;

  useEffect(() => {
    void fetchPosts(1, selectedChurch?.id);
  }, [selectedChurch, fetchPosts]);

  useEffect(() => {
    if (isAdmin && activeTab === 'pending') {
      void fetchPending();
    }
  }, [isAdmin, activeTab, fetchPending]);

  const handleChurchSelect = (church: Church | null): void => {
    setSelectedChurch(church);
    setShowFilter(false);
    setShowForm(false);
  };

  return (
    <Container as="main" size="lg" className="py-8">
      <Box className="flex flex-col gap-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 transition-colors w-fit"
        >
          <ArrowLeft size={15} /> Voltar ao painel
        </Link>

        <Box className="flex flex-wrap items-center justify-between gap-3">
          <Box>
            <Typography variant="h5" weight="bold" className="text-neutral-900">
              {selectedChurch ? selectedChurch.name : 'Comunidade Fé Viva'}
            </Typography>
            <Typography variant="body2" className="text-neutral-500">
              {selectedChurch
                ? 'Publicações desta igreja'
                : 'Publicações gerais da comunidade'}
            </Typography>
          </Box>
          <Box className="flex items-center gap-2">
            <Box
              as="button"
              onClick={() => setShowFilter((v) => !v)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedChurch
                  ? 'border-primary-600 bg-primary-50 text-primary-600'
                  : 'border-neutral-300 text-neutral-600 hover:border-neutral-400'
              }`}
            >
              <Filter size={14} />
              {selectedChurch ? selectedChurch.name : 'Filtrar por Igreja'}
            </Box>
            {user && !selectedChurch && (
              <Button
                size="sm"
                variant={showForm ? 'outline' : 'primary'}
                leftIcon={showForm ? <X size={15} /> : <PenSquare size={15} />}
                onClick={() => setShowForm((v) => !v)}
              >
                {showForm ? 'Cancelar' : 'Novo Post'}
              </Button>
            )}
          </Box>
        </Box>

        {showFilter && (
          <Box className="glass-card rounded-xl p-4 flex flex-col gap-2">
            <Typography variant="body2" weight="semibold" className="text-neutral-700 mb-1">
              Selecionar Igreja
            </Typography>
            <Box
              as="button"
              onClick={() => handleChurchSelect(null)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition-colors ${
                !selectedChurch
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <Newspaper size={14} />
              Feed Geral (sem filtro)
            </Box>
            {churches.map((church) => (
              <Box
                key={church.id}
                as="button"
                onClick={() => handleChurchSelect(church)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition-colors ${
                  selectedChurch?.id === church.id
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {church.name}
              </Box>
            ))}
          </Box>
        )}

        {showForm && user && !selectedChurch && (
          <CreateFeedPost
            onCreated={() => {
              setShowForm(false);
              void fetchPosts(1, undefined);
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {isAdmin && !selectedChurch && (
          <Box className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <Box className="flex min-w-max gap-2 border-b border-neutral-200">
              {[
                { key: 'feed' as const, label: 'Feed', icon: <Newspaper size={14} /> },
                {
                  key: 'pending' as const,
                  label: `Pendentes${pendingPosts.length > 0 ? ` (${pendingPosts.length})` : ''}`,
                  icon: <Clock size={14} />,
                },
              ].map((tab) => (
                <Box
                  key={tab.key}
                  as="button"
                  onClick={() => {
                    setActiveTab(tab.key);
                    if (tab.key === 'pending') void fetchPending();
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === tab.key
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {activeTab === 'pending' && isAdmin && !selectedChurch && (
          <Box className="flex flex-col gap-4">
            {pendingPosts.length === 0 ? (
              <Box className="flex flex-col items-center gap-3 py-14 text-center">
                <Box className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50">
                  <CheckCircle size={24} className="text-green-400" />
                </Box>
                <Typography variant="body2" className="text-neutral-400">
                  Nenhum post general pendente de aprovação.
                </Typography>
              </Box>
            ) : (
              pendingPosts.map((post) => (
                <Box
                  key={post.id}
                  className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 flex flex-col gap-3"
                >
                  <Box className="flex items-start justify-between gap-3">
                    <Box className="flex items-center gap-2">
                      <Box className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 flex-shrink-0">
                        <Typography variant="caption" weight="bold" className="text-primary-700">
                          {post.author.name.charAt(0).toUpperCase()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" weight="semibold" className="text-neutral-800">
                          {post.author.name}
                        </Typography>
                        <Typography variant="caption" className="text-neutral-400">
                          {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                        </Typography>
                      </Box>
                    </Box>
                    <Badge variant="warning">Pendente</Badge>
                  </Box>
                  {post.title && (
                    <Typography variant="h6" weight="semibold" className="text-neutral-900">
                      {post.title}
                    </Typography>
                  )}
                  <Typography variant="body1" className="text-neutral-700">
                    {post.content}
                  </Typography>
                  <Box className="flex gap-2 justify-end border-t border-yellow-200 pt-3">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() =>
                        void approvePost(post.id).then(() => void fetchPosts(1))
                      }
                    >
                      Aprovar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => void rejectPost(post.id)}
                    >
                      Rejeitar
                    </Button>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        )}

        {activeTab === 'feed' && (
          <>
            {isLoading && (
              <Box className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <Box key={i} className="glass-card rounded-2xl p-5 flex flex-col gap-3 animate-pulse">
                    <Box className="flex items-center gap-2">
                      <Box className="h-8 w-8 rounded-full bg-neutral-200" />
                      <Box className="flex flex-col gap-1.5">
                        <Box className="h-3 w-28 rounded bg-neutral-200" />
                        <Box className="h-2.5 w-20 rounded bg-neutral-100" />
                      </Box>
                    </Box>
                    <Box className="h-4 w-3/4 rounded bg-neutral-200" />
                    <Box className="h-3 w-full rounded bg-neutral-100" />
                  </Box>
                ))}
              </Box>
            )}

            {!isLoading && error && (
              <Box className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <Typography variant="body2" className="text-red-600">
                  {error}
                </Typography>
              </Box>
            )}

            {!isLoading && posts.length === 0 && !error && (
              <Box className="flex flex-col items-center gap-4 py-20 text-center">
                <Box className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
                  <Newspaper size={32} className="text-neutral-400" />
                </Box>
                <Box>
                  <Typography variant="h6" weight="semibold" className="text-neutral-600">
                    Nenhuma publicação ainda
                  </Typography>
                  <Typography variant="body2" className="text-neutral-400 mt-1">
                    {selectedChurch
                      ? 'Esta igreja ainda não tem publicações aprovadas.'
                      : 'Seja o primeiro a compartilhar algo com a comunidade!'}
                  </Typography>
                </Box>
                {user && !showForm && !selectedChurch && (
                  <Button size="sm" leftIcon={<PenSquare size={15} />} onClick={() => setShowForm(true)}>
                    Criar primeira publicação
                  </Button>
                )}
              </Box>
            )}

            <Box className="flex flex-col gap-4">
              {posts.map((post) => (
                <FeedPostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                  onRefresh={() => void fetchPosts(1, selectedChurch?.id)}
                />
              ))}
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

Feed.displayName = 'Feed';

export default Feed;
