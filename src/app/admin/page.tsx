import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getAdminSessionId } from "@/lib/auth/cookies";
import { getAdminCredentials, isUsingDefaultAdminCredentials } from "@/lib/admin";

export default async function AdminPage() {
  const adminSession = await getAdminSessionId();
  if (adminSession) {
    redirect("/admin/dashboard");
  }

  const credentials = getAdminCredentials();

  return (
    <main className="appShell narrowShell pageStack">
      <section className="panel compactGap">
        <p className="eyebrow">Restricted route</p>
        <h1>Admin login</h1>
        <p>
          This route is hidden behind `/admin`, but the real protection is the admin credential
          gate and the signed admin session.
        </p>
      </section>

      {isUsingDefaultAdminCredentials() ? (
        <section className="panel compactGap warningPanel">
          <p className="eyebrow">Development fallback</p>
          <p>
            Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your environment before production. Current
            local defaults are `{credentials?.email}` and `{credentials?.password}`.
          </p>
        </section>
      ) : null}

      <AdminLoginForm />
    </main>
  );
}
