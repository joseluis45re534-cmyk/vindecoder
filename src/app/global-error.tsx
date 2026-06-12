'use client';

// Catches errors in the root layout/template. Replaces the whole document, so
// it must render its own <html>/<body>. Keeps users off a bare 500 page.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-US">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#f8fafc', margin: 0 }}>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <p style={{ fontSize: '3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Oops</p>
          <h1 style={{ fontSize: '1.25rem', color: '#0f172a', marginTop: '0.5rem' }}>Something went wrong</h1>
          <p style={{ color: '#64748b', maxWidth: 420, marginTop: '0.5rem' }}>
            We hit an unexpected error loading this page. Please try again.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => reset()}
              style={{
                background: '#2563eb',
                color: '#fff',
                fontWeight: 600,
                padding: '0.7rem 1.4rem',
                borderRadius: 9999,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                background: '#fff',
                color: '#334155',
                fontWeight: 600,
                padding: '0.7rem 1.4rem',
                borderRadius: 9999,
                border: '1px solid #e2e8f0',
                textDecoration: 'none',
              }}
            >
              Go home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
