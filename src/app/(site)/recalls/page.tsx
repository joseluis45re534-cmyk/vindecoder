import { CheckLandingPage, checkMetadata } from '@/components/checks/CheckLandingPage';

export const runtime = 'edge';
export const metadata = checkMetadata('recalls');

export default function Page() {
  return <CheckLandingPage slug="recalls" />;
}
