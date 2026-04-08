import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutLeadAction } from "@/app/actions";
import { VideoPlayer } from "@/components/course/video-player";
import { getLeadSessionId } from "@/lib/auth/cookies";
import { getCourseSnapshot, getLeadById } from "@/lib/funnel/repository";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

type CoursePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CoursePage({ searchParams }: CoursePageProps) {
  const leadId = await getLeadSessionId();
  if (!leadId) {
    redirect("/resume");
  }

  const lead = await getLeadById(leadId);
  if (!lead) {
    redirect("/resume");
  }

  const snapshot = await getCourseSnapshot();
  const params = await searchParams;
  const requestedLesson = Array.isArray(params.lesson) ? params.lesson[0] : params.lesson;
  const lessons = snapshot.topics.flatMap((topic) => topic.subtopics);
  const selectedLesson = lessons.find((lesson) => lesson.id === requestedLesson) ?? lessons[0];

  if (!selectedLesson) {
    return (
      <main className="appShell pageStack">
        <header className="topbar">
          <div>
            <p className="eyebrow">Free course unlocked</p>
            <h1>{snapshot.course.title}</h1>
          </div>
        </header>

        <section className="panel compactGap">
          <p className="eyebrow">Content not seeded yet</p>
          <h2>The course is ready, but no lessons have been published yet.</h2>
          <p>Use the admin content page to add topics and subtopics before sending traffic.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="appShell pageStack">
      <header className="topbar">
        <div>
          <p className="eyebrow">Free course unlocked</p>
          <h1>{snapshot.course.title}</h1>
        </div>

        <div className="topbarActions">
          <Link className="buttonSecondary" href="/resume">
            Resume page
          </Link>
          <form action={signOutLeadAction}>
            <button className="buttonGhost" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="panel heroPanel compactGap">
        <p className="eyebrow">Welcome back</p>
        <h2>{lead.fullName}</h2>
        <p>
          Your access is active now. Watch inside this browser, or use the resume page later with the
          same email address.
        </p>
      </section>

      <div className="courseLayout">
        <VideoPlayer
          key={selectedLesson.id}
          subtopicId={selectedLesson.id}
          summary={selectedLesson.summary}
          title={selectedLesson.title}
          videoUrl={selectedLesson.videoUrl}
        />

        <aside className="panel sidebarPanel">
          <p className="eyebrow">Course map</p>
          <div className="stackList">
            {snapshot.topics.map((topic) => (
              <section key={topic.id} className="topicCard">
                <div className="topicHeader">
                  <h3>{topic.title}</h3>
                  <p>{topic.summary}</p>
                </div>

                <div className="lessonList">
                  {topic.subtopics.map((subtopic) => {
                    const isActive = subtopic.id === selectedLesson.id;

                    return (
                      <Link
                        className={`lessonLink ${isActive ? "activeLesson" : ""}`}
                        href={`/course?lesson=${subtopic.id}`}
                        key={subtopic.id}
                      >
                        <span>{subtopic.title}</span>
                        <small>{formatDuration(subtopic.durationSeconds)}</small>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </aside>
      </div>

      <div className="splitGrid">
        <section className="panel compactGap">
          <p className="eyebrow">Watch later</p>
          <h2>Open the course again with the same email.</h2>
          <p>
            {isSupabaseConfigured()
              ? "Use the resume page to request a secure magic link, or open this in your external browser and enter the same email from the form."
              : "Use the resume page in any browser and enter the same email from the form. Local mode will reopen your course directly."}
          </p>
          <div className="inlineLinks">
            <Link className="buttonPrimary" href="/resume">
              Go to resume page
            </Link>
            <a className="buttonSecondary" href="/resume" target="_blank" rel="noreferrer">
              Open in browser
            </a>
          </div>
        </section>

        <section className="panel compactGap">
          <p className="eyebrow">Lead profile captured</p>
          <div className="detailGrid">
            <div>
              <span>Companies</span>
              <strong>{lead.companies.join(", ")}</strong>
            </div>
            <div>
              <span>Property types</span>
              <strong>{lead.propertyTypes.join(", ")}</strong>
            </div>
            <div>
              <span>Sales focus</span>
              <strong>{lead.salesFocus}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{lead.email}</strong>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
