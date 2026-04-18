import { redirect } from "next/navigation";

type SP = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function SellPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const locality = first(sp.locality);
  const budget = first(sp.budget);
  const params = new URLSearchParams();
  params.set("purpose", "sell");
  if (locality) params.set("locality", locality);
  if (budget) params.set("budget", budget);
  redirect(`/listings?${params.toString()}`);
}

