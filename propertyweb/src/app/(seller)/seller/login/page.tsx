import { redirect } from "next/navigation";

// Unified sign-in: /seller/login used to be a dedicated portal. It's now a
// permanent redirect to the single /login page, which auto-routes the user to
// /seller after authenticating. Bookmarks and old marketing links keep working.
export default function SellerLoginRedirect() {
  redirect("/login");
}
