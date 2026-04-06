export type MemberRole = 'ADMIN' | 'MEMBER';
export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED';

export type ChurchMember = {
  id: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
};
