import Link from "next/link";

import { ResumeForm } from "@/components/funnel/resume-form";
import { getCourseSnapshot } from "@/lib/funnel/repository";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const statusMessages: Record<string, string> = {
  "invalid-link": "The access link is incomplete. Request a new one below.",
  "missing-config": "Magic-link auth is not configured yet, so local resume mode is active.",
  "expired-link": "That access link expired. Request a fresh one below.",
  "email-not-found": "We could not match that email to a lead yet.",
};

type ResumePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResumePage({ searchParams }: ResumePageProps) {
  const snapshot = await getCourseSnapshot();
  const params = await searchParams;
  const status = Array.isArray(params.status) ? params.status[0] : params.status;
  const statusMessage = status ? statusMessages[status] : null;

  return (
    <main className="appShell narrowShell pageStack">
      <header className="topbar">
        <div>
          <p className="eyebrow">Resume your course</p>
          <h1>{snapshot.course.title}</h1>
        </div>

        <Link className="buttonSecondary" href="/">
          Back to landing page
        </Link>
      </header>

      <section className="panel compactGap">
        <h2>Use the same email you entered on the lead form.</h2>
        <p>
          {isSupabaseConfigured()
            ? "We will send you a secure magic link so you can continue watching later."
            : "Local mode is enabled, so entering your email here will reopen the course directly."}
        </p>
        {statusMessage ? <p className="formMessage success">{statusMessage}</p> : null}
      </section>

      <ResumeForm />

      <section className="panel compactGap">
        <p className="eyebrow">If you are still inside Facebook</p>
        <h2>Open the resume page in your external browser.</h2>
        <p>
          If Facebook keeps opening the page inside the app, use the three-dot menu and choose
          <strong> Open in browser</strong>, then enter the same email you submitted.
        </p>
      </section>
    </main>
  );
}
