import type { Metadata } from 'next';
import { AuctionCategoryPage, auctionMetadata } from '@/components/auctions/AuctionCategoryPage';

export const runtime = 'edge';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  return auctionMetadata('type', type);
}

export default async function Page({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  return <AuctionCategoryPage kind="type" slug={type} />;
}
