import { redirect } from "next/navigation";

export default async function RentTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { type } = await params;
  const sp = await searchParams;
  const locality = Array.isArray(sp.locality) ? sp.locality[0] : sp.locality;
  const budget = Array.isArray(sp.budget) ? sp.budget[0] : sp.budget;
  const q = Array.isArray(sp.q) ? sp.q[0] : sp.q;

  const qs = new URLSearchParams();
  qs.set("purpose", "rent");
  qs.set("type", type);
  if (locality) qs.set("locality", locality);
  if (budget) qs.set("budget", budget);
  if (q) qs.set("q", q);
  redirect(`/listings?${qs.toString()}`);
}

