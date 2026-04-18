import { CmsLegalEditor } from "@/components/admin/cms-legal-editor";

export default function AdminPrivacyPage() {
  return (
    <CmsLegalEditor
      section="privacy"
      title="Privacy policy"
      description="This text is shown on the public /privacy page. Include cookies, ads (e.g. AdSense), and data practices."
    />
  );
}
