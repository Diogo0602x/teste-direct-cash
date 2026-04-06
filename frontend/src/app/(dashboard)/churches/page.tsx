import type { Metadata } from 'next';
import { ChurchesList } from '@/containers/Churches';

export const metadata: Metadata = {
  title: 'Igrejas',
  description: 'Explore e gerencie igrejas na plataforma Fé Viva',
};

export default function ChurchesPage(): React.JSX.Element {
  return <ChurchesList />;
}
