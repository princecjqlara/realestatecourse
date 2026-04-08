import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAdminAction } from "@/app/actions";
import { AdminContentManager } from "@/components/admin/admin-content-manager";
import { getAdminSessionId } from "@/lib/auth/cookies";
import { getCourseSnapshot } from "@/lib/funnel/repository";

type ContentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminContentPage({ searchParams }: ContentPageProps) {
  const adminSession = await getAdminSessionId();
  if (!adminSession) {
    redirect("/admin");
  }

  const snapshot = await getCourseSnapshot();
  const params = await searchParams;
  const topicSaved = params.topicSaved === "1";
  const subtopicSaved = params.subtopicSaved === "1";
  const topicError = params.topicError === "1";
  const subtopicError = params.subtopicError === "1";

  return (
    <main className="appShell pageStack">
      <header className="topbar">
        <div>
          <p className="eyebrow">Content controls</p>
          <h1>Topics and subtopics</h1>
        </div>

        <div className="topbarActions">
          <Link className="buttonSecondary" href="/admin/dashboard">
            Back to dashboard
          </Link>
          <form action={signOutAdminAction}>
            <button className="buttonGhost" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>

      {topicSaved ? <p className="formMessage success">Topic saved.</p> : null}
      {subtopicSaved ? <p className="formMessage success">Subtopic saved.</p> : null}
      {topicError ? <p className="formMessage error">Topic save failed.</p> : null}
      {subtopicError ? <p className="formMessage error">Subtopic save failed.</p> : null}

      <AdminContentManager snapshot={snapshot} />
    </main>
  );
}
