import { LeadForm } from "@/components/funnel/lead-form";
import { getCourseSnapshot } from "@/lib/funnel/repository";

import styles from "./page.module.css";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function resolveParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function Home({ searchParams }: HomePageProps) {
  const snapshot = await getCourseSnapshot();
  const params = await searchParams;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.copyColumn}>
          <p className={styles.kicker}>Free course funnel</p>
          <h1>{snapshot.course.heroTitle}</h1>
          <p className={styles.summary}>{snapshot.course.heroSummary}</p>

          <div className={styles.promiseStrip}>
            <div>
              <strong>Instant access</strong>
              <span>They submit once and start watching immediately.</span>
            </div>
            <div>
              <strong>Return flow</strong>
              <span>They come back later with the same email and resume the course.</span>
            </div>
            <div>
              <strong>Admin analytics</strong>
              <span>Track form answers, views, watch time, retention, and repeat logins.</span>
            </div>
          </div>

          <section className={styles.curriculumPanel}>
            <p className={styles.curriculumLabel}>What they will watch</p>
            <div className={styles.curriculumList}>
              {snapshot.topics.map((topic) => (
                <article className={styles.curriculumItem} key={topic.id}>
                  <h2>{topic.title}</h2>
                  <p>{topic.summary}</p>
                  <small>{topic.subtopics.length} lessons</small>
                </article>
              ))}
            </div>
          </section>
        </section>

        <section className={styles.formColumn}>
          <div className={styles.formIntro}>
            <p className={styles.kicker}>Unlock the Facebook Ads course</p>
            <h2>Simple landing page. Single CTA. Straight to the form.</h2>
          </div>
          <LeadForm
            attribution={{
              utmSource: resolveParam(params.utm_source),
              utmMedium: resolveParam(params.utm_medium),
              utmCampaign: resolveParam(params.utm_campaign),
              utmContent: resolveParam(params.utm_content),
              fbclid: resolveParam(params.fbclid),
              landingPath: "/",
            }}
            ctaLabel={snapshot.course.ctaLabel}
          />
        </section>
      </main>
    </div>
  );
}
