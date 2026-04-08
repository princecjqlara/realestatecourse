import { LandingCaptureShell } from "@/components/funnel/landing-capture-shell";
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
  const previewLesson = snapshot.topics[0]?.subtopics[0];
  const previewLessonCount = snapshot.topics.reduce((total, topic) => total + topic.subtopics.length, 0);

  return (
    <div className={styles.page}>
      <div className={styles.pageShell}>
        {previewLesson ? (
          <LandingCaptureShell
            attribution={{
              utmSource: resolveParam(params.utm_source),
              utmMedium: resolveParam(params.utm_medium),
              utmCampaign: resolveParam(params.utm_campaign),
              utmContent: resolveParam(params.utm_content),
              fbclid: resolveParam(params.fbclid),
              landingPath: "/",
            }}
            ctaLabel={snapshot.course.ctaLabel}
            previewLessonCount={previewLessonCount}
            previewMediaType={snapshot.course.previewMediaType}
            previewSummary="Pindutin mo ang play para simulan ang flow at ma-unlock ang FREE course mo."
            previewThumbnailUrl={snapshot.course.previewThumbnailUrl}
            previewVideoUrl={snapshot.course.previewVideoUrl}
            previewTitle={previewLesson.title}
          />
        ) : null}
      </div>
    </div>
  );
}
