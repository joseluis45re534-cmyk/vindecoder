import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import ChatWidget from "@/components/ChatWidget";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
      <ChatWidget />
    </>
  );
}
