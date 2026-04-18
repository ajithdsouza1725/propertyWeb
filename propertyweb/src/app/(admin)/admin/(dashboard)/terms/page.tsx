import { CmsLegalEditor } from "@/components/admin/cms-legal-editor";

export default function AdminTermsPage() {
  return (
    <CmsLegalEditor
      section="terms"
      title="Terms & conditions"
      description="This text is shown on the public /terms page."
    />
  );
}
