'use client';

import { useEffect, useRef, useState } from "react";

import styles from "@/app/page.module.css";
import { LeadForm } from "@/components/funnel/lead-form";
import { OfferUrgency } from "@/components/funnel/offer-urgency";
import { VideoPreviewCard } from "@/components/funnel/video-preview-card";
import type { CoursePreviewMediaType } from "@/lib/funnel/course-preview-media";
import { getLeadCaptureGateCopy } from "@/lib/funnel/capture-gate";
import { getUrgencyCountdown } from "@/lib/funnel/urgency";

type LandingCaptureShellProps = {
  attribution: {
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    utmContent: string;
    fbclid: string;
    landingPath: string;
  };
  ctaLabel: string;
  previewLessonCount: number;
  previewMediaType: CoursePreviewMediaType;
  previewSummary: string;
  previewThumbnailUrl: string;
  previewVideoUrl: string;
  previewTitle: string;
};

export function LandingCaptureShell({
  attribution,
  ctaLabel,
  previewLessonCount,
  previewMediaType,
  previewSummary,
  previewThumbnailUrl,
  previewVideoUrl,
  previewTitle,
}: LandingCaptureShellProps) {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(() =>
    getUrgencyCountdown(
      {
        expiresAtMs: Date.now() + 3 * 24 * 60 * 60 * 1000,
        slotsLeft: 8,
      },
      Date.now(),
    ),
  );
  const modalContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let timer: number | null = null;
    let frame: number | null = null;

    const syncCountdown = async () => {
      const response = await fetch("/api/offer-window", {
        cache: "no-store",
      }).catch(() => null);

      if (!response?.ok) {
        const expiredOffer = {
          expiresAtMs: Date.now(),
          slotsLeft: 0,
        };

        setCountdown(getUrgencyCountdown(expiredOffer, Date.now()));
        return;
      }

      const offerWindow = (await response.json()) as {
        expiresAtMs: number;
        slotsLeft: number;
      };

      const updateCountdown = () => {
        setCountdown(getUrgencyCountdown(offerWindow, Date.now()));
      };

      updateCountdown();
      timer = window.setInterval(updateCountdown, 1000);
      frame = window.requestAnimationFrame(updateCountdown);
    };

    void syncCountdown();

    return () => {
      if (timer) {
        window.clearInterval(timer);
      }

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  const isClaimClosed = countdown.isExpired;
  const gateCopy = getLeadCaptureGateCopy(!isClaimClosed);

  function unlockForm() {
    if (isClaimClosed) {
      return;
    }

    setIsFormModalOpen(true);

    requestAnimationFrame(() => {
      modalContentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <>
      <OfferUrgency values={countdown} />

      <main className={styles.main}>
        <section className={styles.copyColumn}>
        <p className={styles.kicker}>Free real estate ads course</p>
        <h1>
          Learn paano kumuha ng quality real estate leads gamit ang Facebook Ads sa
          <span className={styles.highlight}> FREE course</span> na ito.
        </h1>
        <p className={styles.summary}>
          Simple, diretso, at natural na Taglish training ito para sa agents, brokers, at real estate
          teams na gustong mas dumami ang legit inquiries, hindi lang likes at random clicks.
        </p>

        <div className={styles.heroSurface}>
          <VideoPreviewCard
            lessonCount={previewLessonCount}
            onPlayAttempt={unlockForm}
            previewMediaType={previewMediaType}
            summary={previewSummary}
            thumbnailUrl={previewThumbnailUrl}
            previewVideoUrl={previewVideoUrl}
            title={previewTitle}
          />
        </div>

        <div className={styles.promiseStrip}>
          <div>
            <strong>Instant access agad</strong>
            <span>Pag-submit mo ng form, diretsong bukas ang FREE course. Walang paligoy-ligoy.</span>
          </div>
          <div>
            <strong>Balikan anytime</strong>
            <span>Same email lang ang gamitin mo para makabalik at ituloy ang panonood mo.</span>
          </div>
          <div>
            <strong>Para talaga sa real estate</strong>
            <span>Bagay ito sa agents at teams na gusto ng mas quality na leads, hindi puro usisa lang.</span>
          </div>
        </div>
        </section>
      </main>

      {isFormModalOpen && !isClaimClosed ? (
        <div className={styles.modalBackdrop} onClick={() => setIsFormModalOpen(false)} role="presentation">
          <div className={styles.formModalCard} onClick={(event) => event.stopPropagation()} ref={modalContentRef} role="dialog" aria-modal="true">
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.kicker}>{gateCopy.kicker}</p>
                <h2>
                  Kailangan mo munang fill up ang details mo para mapanood ang <span className={styles.formHighlight}>FREE course</span>.
                </h2>
              </div>
              <button className={styles.closeButton} onClick={() => setIsFormModalOpen(false)} type="button">
                Close
              </button>
            </div>

            <p className={styles.formSummary}>
              Short form lang ito. Pag-submit mo, automatic ka nang mapupunta sa account mo at puwede ka nang manood ng buong course.
            </p>

            <LeadForm attribution={attribution} ctaLabel={ctaLabel} />
          </div>
        </div>
      ) : null}
    </>
  );
}
