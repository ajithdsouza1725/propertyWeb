import { Card, CardContent } from "@/components/ui/card";

export default function ListingsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="h-5 w-48 animate-pulse rounded-md bg-muted" />
      <div className="mt-6 h-9 w-64 animate-pulse rounded-md bg-muted" />
      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <Card className="border-muted/60">
            <CardContent className="h-80 animate-pulse bg-muted/40 p-6" />
          </Card>
        </aside>
        <section className="lg:col-span-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden border-muted/60">
                <div className="aspect-16/10 animate-pulse bg-muted/50" />
                <CardContent className="space-y-3 p-4">
                  <div className="h-4 w-[75%] animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
