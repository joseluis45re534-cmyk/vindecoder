import { ProblemArticlePage, problemMetadata } from '@/components/problems/ProblemArticlePage';

export const runtime = 'edge';
export const metadata = problemMetadata('worst-cars-to-buy');

export default function Page() {
  return <ProblemArticlePage slug="worst-cars-to-buy" />;
}
