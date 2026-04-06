export type PostStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type PostAuthor = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type PostChurch = {
  id: string;
  name: string;
  logoUrl: string | null;
};

export type Post = {
  id: string;
  title: string | null;
  content: string;
  imageUrl: string | null;
  status: PostStatus;
  churchId: string | null;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor;
  church: PostChurch | null;
  _count: {
    likes: number;
    comments: number;
  };
  likedByMe?: boolean;
};

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor;
  _count: {
    likes: number;
  };
};

export type CreatePostPayload = {
  title?: string;
  content: string;
  imageUrl?: string;
  churchId?: string;
};

export type UpdatePostPayload = Partial<CreatePostPayload>;
