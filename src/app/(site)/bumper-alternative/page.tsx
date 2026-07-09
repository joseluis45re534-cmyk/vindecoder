import { AlternativePage, altMetadata } from '@/components/compare/AlternativePage';

export const runtime = 'edge';
export const metadata = altMetadata('bumper');

export default function Page() {
  return <AlternativePage slug="bumper" />;
}
