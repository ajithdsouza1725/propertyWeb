import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BadgeCheck, ClipboardList, Image as ImageIcon, ShieldCheck } from "lucide-react";

export default function ListYourPropertyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>List your property</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 grid items-center gap-10 md:grid-cols-12">
        <div className="md:col-span-7">
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight">
            List your property in Mangalore — and get genuine enquiries.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
            Create a listing in minutes, upload photos, and submit for approval. Once approved, your
            property goes live on the marketplace and starts receiving leads.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/seller/properties/new">Post Property</Link>
            </Button>
            <Button variant="secondary" asChild size="lg">
              <Link href="/contact">Talk to support</Link>
            </Button>
          </div>
        </div>

        <div className="md:col-span-5">
          <Card className="border-muted/60">
            <CardContent className="p-6">
              <div className="text-sm font-semibold tracking-tight">Why list here</div>
              <div className="mt-4 grid gap-3 text-sm">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 size-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Cleaner leads</div>
                    <div className="text-muted-foreground">
                      Enquiries are structured and stored so you can follow up faster.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 size-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Verified signals</div>
                    <div className="text-muted-foreground">
                      Verified badges improve trust and conversion.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ImageIcon className="mt-0.5 size-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Photos-first</div>
                    <div className="text-muted-foreground">
                      Great galleries and neat cards make your listing stand out.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
        <p className="mt-2 text-sm text-muted-foreground">A straightforward flow designed for speed and quality.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            { title: "Add details", desc: "Purpose, type, title, description, pricing." },
            { title: "Upload images", desc: "Cover + gallery images for better conversion." },
            { title: "Admin approval", desc: "Quick review for quality and safety checks." },
            { title: "Get enquiries", desc: "Receive leads in dashboard and manage follow-ups." },
          ].map((s, idx) => (
            <Card key={s.title} className="border-muted/60">
              <CardContent className="p-6">
                <div className="text-xs text-muted-foreground">Step {idx + 1}</div>
                <div className="mt-1 flex items-center gap-2 font-semibold">
                  <ClipboardList className="size-4 text-muted-foreground" />
                  {s.title}
                </div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">{s.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

