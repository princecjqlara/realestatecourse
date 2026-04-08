import Link from "next/link";
import { redirect } from "next/navigation";

import { addSubtopicAction, addTopicAction, signOutAdminAction } from "@/app/actions";
import { CloudinaryUploader } from "@/components/admin/cloudinary-uploader";
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

      <section className="panel compactGap">
        <p className="eyebrow">Cloudinary media</p>
        <h2>Upload photos, videos, and other media directly from admin.</h2>
        <CloudinaryUploader
          allowResourceTypeSelection
          description="Upload any media to Cloudinary and keep the secure URL or public ID for later use in the funnel."
          title="General media uploader"
        />
      </section>

      <div className="splitGrid">
        <form action={addTopicAction} className="panel formPanel compactPanel">
          <p className="eyebrow">Add topic</p>
          <label className="field">
            <span>Topic title</span>
            <input name="title" placeholder="Retargeting system" required type="text" />
          </label>
          <label className="field">
            <span>Summary</span>
            <textarea
              name="summary"
              placeholder="What this topic teaches and why it matters"
              required
              rows={4}
            />
          </label>
          <button className="buttonPrimary" type="submit">
            Save topic
          </button>
        </form>

        <form action={addSubtopicAction} className="panel formPanel compactPanel">
          <p className="eyebrow">Add subtopic</p>
          <label className="field">
            <span>Topic</span>
            <select name="topicId" required>
              {snapshot.topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Subtopic title</span>
            <input name="title" placeholder="Lead follow-up timing" required type="text" />
          </label>
          <label className="field">
            <span>Summary</span>
            <textarea name="summary" placeholder="What this lesson covers" required rows={3} />
          </label>
          <label className="field">
            <span>Duration in seconds</span>
            <input min={30} name="durationSeconds" required step={1} type="number" />
          </label>
          <label className="field">
            <span>Existing Cloudinary or media URL</span>
            <input
              name="videoUrl"
              placeholder="https://res.cloudinary.com/your-cloud/video/upload/..."
              type="url"
            />
          </label>
          <CloudinaryUploader
            description="Upload the lesson video to Cloudinary. The secure URL will be attached to this subtopic automatically."
            formatFieldName="videoFormat"
            publicIdFieldName="videoPublicId"
            resourceType="video"
            resourceTypeFieldName="videoResourceType"
            title="Lesson video"
            urlFieldName="cloudinaryVideoUrl"
          />
          <button className="buttonPrimary" type="submit">
            Save subtopic
          </button>
        </form>
      </div>

      <section className="panel compactGap">
        <p className="eyebrow">Current structure</p>
        <div className="stackList">
          {snapshot.topics.map((topic) => (
            <article className="topicCard" key={topic.id}>
              <div className="topicHeader">
                <h2>{topic.title}</h2>
                <p>{topic.summary}</p>
              </div>
              <div className="lessonList staticLessons">
                {topic.subtopics.map((subtopic) => (
                  <div className="lessonLink activeLesson" key={subtopic.id}>
                    <span>{subtopic.title}</span>
                    <small>{subtopic.durationSeconds}s</small>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
