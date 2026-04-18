import { Suspense } from "react";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { AdminGuard } from "@/components/admin/admin-guard";
import {
  BarChart3,
  BookOpen,
  FileText,
  Globe,
  Home,
  Inbox,
  LayoutDashboard,
  MapPinned,
  MessageSquare,
  Scale,
  Settings,
  Shapes,
  Shield,
  Sparkles,
  Tags,
  Users,
} from "lucide-react";

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-dvh bg-[#f8f9fb]">
      <div className="flex">
        <AppSidebar
          title="Admin"
          subtitle="MangaloreHomes"
          items={[
            // ── Core operations
            { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="size-4" />, group: "Overview" },
            { href: "/admin/reports", label: "Reports", icon: <BarChart3 className="size-4" />, group: "Overview" },

            // ── Content moderation
            { href: "/admin/properties", label: "Properties", icon: <Shield className="size-4" />, group: "Moderation" },
            { href: "/admin/enquiries", label: "Enquiries", icon: <MessageSquare className="size-4" />, group: "Moderation" },
            { href: "/admin/users", label: "Users", icon: <Users className="size-4" />, group: "Moderation" },
            { href: "/admin/contact-messages", label: "Contact inbox", icon: <Inbox className="size-4" />, group: "Moderation" },

            // ── Catalog
            { href: "/admin/locations", label: "Locations", icon: <MapPinned className="size-4" />, group: "Catalog" },
            { href: "/admin/property-types", label: "Property types", icon: <Shapes className="size-4" />, group: "Catalog" },
            { href: "/admin/amenities", label: "Amenities", icon: <Tags className="size-4" />, group: "Catalog" },

            // ── CMS & Marketing
            { href: "/admin/homepage", label: "Homepage", icon: <Home className="size-4" />, group: "Content" },
            { href: "/admin/marketing", label: "Marketing", icon: <Sparkles className="size-4" />, group: "Content" },
            { href: "/admin/seo", label: "SEO", icon: <Globe className="size-4" />, group: "Content" },

            // ── Config
            { href: "/admin/settings", label: "Settings", icon: <Settings className="size-4" />, group: "System" },
            { href: "/admin/terms", label: "Terms", icon: <BookOpen className="size-4" />, group: "System" },
            { href: "/admin/privacy", label: "Privacy", icon: <Scale className="size-4" />, group: "System" },

            // ── Back
            { href: "/", label: "Back to site", icon: <Home className="size-4" /> },
          ]}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Suspense fallback={<div className="h-14 border-b bg-background" />}>
            <AppTopbar placeholder="Search properties, users, enquiries…" />
          </Suspense>
          <div className="p-5 md:p-7">
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
              <AdminGuard>{children}</AdminGuard>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
