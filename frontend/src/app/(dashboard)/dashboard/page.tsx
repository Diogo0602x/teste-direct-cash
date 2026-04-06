import type { Metadata } from 'next';
import UserDashboard from '@/containers/UserDashboard';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Painel de controle do Fé Viva',
};

export default function DashboardPage(): React.JSX.Element {
  return <UserDashboard />;
}
