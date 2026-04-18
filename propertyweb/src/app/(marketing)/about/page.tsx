import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>About</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 grid gap-8 md:grid-cols-12">
        <section className="md:col-span-7">
          <h1 className="text-3xl font-semibold tracking-tight">
            Built for Mangalore — with clarity and trust.
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            MangaloreHomes is a focused property marketplace for buyers, renters,
            owners, and agents. The goal is simple: reduce noise, improve listing
            quality, and make enquiries direct and trackable.
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            This project is designed to scale with admin tooling: approvals,
            locality management, homepage CMS, and SEO controls — all backed by a
            clean Postgres schema.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild>
              <Link href="/listings">Browse listings</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/list-your-property">List a property</Link>
            </Button>
          </div>
        </section>

        <aside className="md:col-span-5">
          <Card className="border-muted/60">
            <CardContent className="space-y-3 p-6">
              <div className="text-sm font-semibold tracking-tight">What we optimize for</div>
              <div className="text-sm text-muted-foreground">
                - Fast search + filters
                <br />
                - Clean locality pages for discovery
                <br />
                - Seller dashboards that reduce back-and-forth
                <br />
                - Admin review to keep quality high
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

