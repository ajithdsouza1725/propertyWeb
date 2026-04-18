"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { apiFetch } from "@/lib/api";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Contact</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 grid gap-8 md:grid-cols-12">
        <section className="md:col-span-5">
          <h1 className="text-3xl font-semibold tracking-tight">Contact us</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Have a question about listing, approvals, or how the platform works? Send a message and we’ll respond.
          </p>

          <Card className="mt-6 border-muted/60">
            <CardContent className="space-y-2 p-6 text-sm">
              <div className="font-semibold">Support</div>
              <div className="text-muted-foreground">+91 98XX-XXX-XXX</div>
              <div className="text-muted-foreground">support@mangalorehomes.in</div>
              <div className="pt-2 font-semibold">Address</div>
              <div className="text-muted-foreground">Mangalore, Karnataka (demo address)</div>
            </CardContent>
          </Card>
        </section>

        <section className="md:col-span-7">
          <Card className="border-muted/60">
            <CardHeader>
              <CardTitle className="text-base">Send a message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">{error}</div>
              ) : null}
              {done ? (
                <div className="rounded-xl border bg-muted/30 p-3 text-sm">
                  Thanks — your message was received. We’ll get back to you soon.
                </div>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                    <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <Input
                    placeholder="Email (optional)"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Textarea
                    placeholder="How can we help?"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <Button
                    disabled={loading || !name.trim() || !message.trim()}
                    onClick={async () => {
                      setLoading(true);
                      setError(null);
                      try {
                        await apiFetch<{ ok: boolean }>("/api/public/contact", {
                          body: {
                            name: name.trim(),
                            phone: phone.trim() || null,
                            email: email.trim() || null,
                            message: message.trim(),
                          },
                        });
                        setDone(true);
                      } catch (e: unknown) {
                        const err = e as { message?: string };
                        setError(err?.message ?? "Submit failed");
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    {loading ? "Submitting…" : "Submit"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
