import type { Metadata } from 'next';
import { ChurchDetail } from '@/containers/Churches';

export const metadata: Metadata = {
  title: 'Igreja',
  description: 'Detalhes da igreja',
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ChurchPage({ params }: Props): Promise<React.JSX.Element> {
  const { id } = await params;
  return <ChurchDetail churchId={id} />;
}
