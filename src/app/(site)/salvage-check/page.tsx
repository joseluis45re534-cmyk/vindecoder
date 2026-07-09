import { CheckLandingPage, checkMetadata } from '@/components/checks/CheckLandingPage';

export const runtime = 'edge';
export const metadata = checkMetadata('salvage-check');

export default function Page() {
  return <CheckLandingPage slug="salvage-check" />;
}
