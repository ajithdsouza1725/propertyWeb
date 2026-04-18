import { Suspense } from "react";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { SellerGuard } from "@/components/seller/seller-guard";
import { Building2, FilePlus2, LayoutDashboard, List, MessageSquare, User } from "lucide-react";
import { Search } from "lucide-react";

export default function SellerPanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SellerGuard>
      <div className="min-h-dvh bg-muted/20">
        <div className="mx-auto flex max-w-7xl">
          <AppSidebar
            title="Seller Panel"
            subtitle="Manage listings & enquiries"
            items={[
              { href: "/seller", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
              { href: "/seller/properties/new", label: "Add Property", icon: <FilePlus2 className="size-4" /> },
              { href: "/seller/properties", label: "My Properties", icon: <List className="size-4" /> },
              { href: "/listings", label: "Browse Listings", icon: <Search className="size-4" /> },
              { href: "/seller/enquiries", label: "Enquiries", icon: <MessageSquare className="size-4" /> },
              { href: "/seller/profile", label: "Profile", icon: <User className="size-4" /> },
              { href: "/", label: "Back to site", icon: <Building2 className="size-4" /> },
            ]}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <Suspense fallback={<div className="h-[52px] border-b bg-background" />}>
              <AppTopbar placeholder="Search listings or enquiries (URL ?q=)…" />
            </Suspense>
            <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading…</div>}>
              <div className="p-4 md:p-6">{children}</div>
            </Suspense>
          </div>
        </div>
      </div>
    </SellerGuard>
  );
}
