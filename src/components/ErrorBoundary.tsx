import { type ReactNode, useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

export default function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(event.error instanceof Error ? event.error : new Error(event.message));
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg border border-red-200 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Something went wrong</h1>
          <p className="text-zinc-500 mb-4">{error.message || 'An unexpected error occurred'}</p>
          <button
            onClick={() => setError(null)}
            className="px-6 py-2 bg-primary text-white font-bold rounded hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
