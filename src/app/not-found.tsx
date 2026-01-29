import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-2xl font-semibold">Not Found</h2>
      <p className="text-muted-foreground">Could not find the requested resource.</p>
      <Link
        href="/"
        className="text-primary underline underline-offset-4 hover:no-underline"
      >
        Return Home
      </Link>
    </div>
  );
}
