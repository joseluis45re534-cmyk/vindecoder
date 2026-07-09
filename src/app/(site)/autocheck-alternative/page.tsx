import { AlternativePage, altMetadata } from '@/components/compare/AlternativePage';

export const runtime = 'edge';
export const metadata = altMetadata('autocheck');

export default function Page() {
  return <AlternativePage slug="autocheck" />;
}
