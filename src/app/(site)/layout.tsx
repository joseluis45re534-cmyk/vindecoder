import { MissionStrip, SiteHeader, SiteFooter } from "@/components/SiteChrome";
import ChatWidget from "@/components/ChatWidget";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <MissionStrip />
      <SiteHeader />
      {children}
      <SiteFooter />
      <ChatWidget />
    </>
  );
}
