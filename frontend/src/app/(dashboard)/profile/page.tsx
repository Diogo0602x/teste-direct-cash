import type { Metadata } from 'next';
import { UserProfile } from '@/containers/UserProfile';

export const metadata: Metadata = {
  title: 'Meu Perfil',
  description: 'Gerencie suas informações pessoais',
};

export default function ProfilePage(): React.JSX.Element {
  return <UserProfile />;
}
