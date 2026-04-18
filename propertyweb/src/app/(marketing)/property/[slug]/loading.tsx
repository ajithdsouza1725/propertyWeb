import { Card, CardContent } from "@/components/ui/card";

export default function PropertyDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="h-5 w-56 animate-pulse rounded-md bg-muted" />
      <div className="mt-6 grid gap-8 lg:grid-cols-12">
        <section className="lg:col-span-8 space-y-6">
          <div className="aspect-16/10 animate-pulse rounded-3xl bg-muted/50" />
          <div className="h-10 w-[66%] animate-pulse rounded-md bg-muted" />
          <div className="h-24 animate-pulse rounded-xl bg-muted/40" />
        </section>
        <aside className="lg:col-span-4">
          <Card className="border-muted/60">
            <CardContent className="h-72 animate-pulse bg-muted/30 p-6" />
          </Card>
        </aside>
      </div>
    </div>
  );
}
