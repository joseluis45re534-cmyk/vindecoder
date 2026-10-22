import Script from 'next/script';

// Google "Add as a preferred source" button — lets readers pick CarVinLookup as a
// preferred source for Top Stories / AI Overviews in one click, then returns them
// here. Official embed (developers.google.com/search/docs/appearance/preferred-sources):
// Google's script finds the <div google-add-preferred-source-btn> and renders a
// localized button into it. Lives in the persistent site footer so the div is in
// the server-rendered HTML when the script runs.
export default function PreferredSourceButton({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  return (
    <>
      <Script id="google-preferred-source" src="https://news.google.com/swg/js/v1/publisher.js" strategy="afterInteractive" />
      <div google-add-preferred-source-btn="" data-theme={theme} suppressHydrationWarning />
    </>
  );
}
