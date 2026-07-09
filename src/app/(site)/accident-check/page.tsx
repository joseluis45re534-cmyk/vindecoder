import { CheckLandingPage, checkMetadata } from '@/components/checks/CheckLandingPage';

export const runtime = 'edge';
export const metadata = checkMetadata('accident-check');

export default function Page() {
  return <CheckLandingPage slug="accident-check" />;
}
