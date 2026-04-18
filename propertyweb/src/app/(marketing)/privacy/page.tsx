import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { apiFetch } from "@/lib/api";

async function getPrivacyBody(): Promise<string> {
  try {
    const m = await apiFetch<Record<string, unknown>>("/api/public/cms/privacy");
    if (typeof m.content === "string" && m.content.trim()) return m.content.trim();
  } catch {
    // ignore
  }
  return "Privacy policy is not configured yet. Please sign in as admin → Privacy to add content.";
}

export default async function PrivacyPage() {
  const content = await getPrivacyBody();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Privacy</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <div className="prose prose-zinc mt-4 max-w-none whitespace-pre-wrap dark:prose-invert">{content}</div>
    </div>
  );
}
