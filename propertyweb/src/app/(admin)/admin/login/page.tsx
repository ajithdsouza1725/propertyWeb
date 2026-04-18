import { redirect } from "next/navigation";

// Unified sign-in: /admin/login used to be a dedicated portal. It's now a
// redirect to /login — which, on success, routes admins to /admin.
// Bookmarks, old emails, and the route guards in /admin/* still work.
export default function AdminLoginRedirect() {
  redirect("/login");
}
