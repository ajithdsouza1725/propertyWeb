import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { apiFetch } from "@/lib/api";

async function getTermsBody(): Promise<string> {
  try {
    const m = await apiFetch<Record<string, unknown>>("/api/public/cms/terms");
    if (typeof m.content === "string" && m.content.trim()) return m.content.trim();
  } catch {
    // ignore
  }
  return "Terms of use are not configured yet. Please sign in as admin → Terms to add content.";
}

export default async function TermsPage() {
  const content = await getTermsBody();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Terms</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Terms &amp; Conditions</h1>
      <div className="prose prose-zinc mt-4 max-w-none whitespace-pre-wrap dark:prose-invert">{content}</div>
    </div>
  );
}
