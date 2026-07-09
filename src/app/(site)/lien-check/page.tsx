import { CheckLandingPage, checkMetadata } from '@/components/checks/CheckLandingPage';

export const runtime = 'edge';
export const metadata = checkMetadata('lien-check');

export default function Page() {
  return <CheckLandingPage slug="lien-check" />;
}
