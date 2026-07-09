import { ProblemArticlePage, problemMetadata } from '@/components/problems/ProblemArticlePage';

export const runtime = 'edge';
export const metadata = problemMetadata('most-totaled-cars');

export default function Page() {
  return <ProblemArticlePage slug="most-totaled-cars" />;
}
