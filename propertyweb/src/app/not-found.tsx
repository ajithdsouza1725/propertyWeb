import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-dvh max-w-6xl place-items-center px-4 py-16">
      <div className="text-center">
        <div className="text-sm font-medium text-muted-foreground">404</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          That page doesn’t exist
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Try going back home or browsing listings.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/listings">Browse listings</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

