'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
          <h2>Algo deu errado!</h2>
          <p style={{ color: 'red' }}>{error.message}</p>
          <pre style={{ background: '#f0f0f0', padding: '1rem', overflow: 'auto' }}>
            {error.stack}
          </pre>
          <button 
            onClick={() => reset()}
            style={{ padding: '0.5rem 1rem', marginTop: '1rem', cursor: 'pointer' }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
