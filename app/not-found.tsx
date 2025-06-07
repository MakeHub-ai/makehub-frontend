import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
      <p className="text-gray-600 text-center mb-8 max-w-md">
        Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
      </p>
      <div className="flex gap-4">
        <Button asChild variant="default">
          <Link href="/">
            Go Home
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/docs">
            View Docs
          </Link>
        </Button>
      </div>
    </div>
  );
}
