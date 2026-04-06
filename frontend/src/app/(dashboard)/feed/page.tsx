import type { Metadata } from 'next';
import { Feed } from '@/containers/Feed';

export const metadata: Metadata = {
  title: 'Feed',
  description: 'Publicações da comunidade Fé Viva',
};

export default function FeedPage(): React.JSX.Element {
  return <Feed />;
}
