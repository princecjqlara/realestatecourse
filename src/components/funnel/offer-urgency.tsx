import type { getUrgencyCountdown } from "@/lib/funnel/urgency";

import styles from "@/app/page.module.css";

type OfferUrgencyProps = {
  values: ReturnType<typeof getUrgencyCountdown>;
};

export function OfferUrgency({ values }: OfferUrgencyProps) {
  return (
    <section className={styles.urgencyBanner}>
      <div className={styles.bannerCopy}>
        <p className={styles.urgencyLabel}>Free course claim window</p>
        <h2>
          {values.isExpired
            ? "Expired na ang free-claim window mo."
            : "May 3 days ka lang para ma-claim ang FREE course na ito."}
        </h2>
        <p>
          {values.isExpired
            ? "Naubos na ang timer mo sa browser na ito."
            : "Naka-reserve ang timer na ito sa browser mo ngayon, kaya habang may oras ka pa, i-claim mo na ang free access."}
        </p>
      </div>

      <div className={styles.bannerMeta}>
        <strong>{values.isExpired ? "Offer closed" : `${values.slotsLeft} slots left`}</strong>
        <div className={styles.countdownGrid}>
          <div className={styles.countdownCell}>
            <strong>{String(values.days).padStart(2, "0")}</strong>
            <span>Araw</span>
          </div>
          <div className={styles.countdownCell}>
            <strong>{String(values.hours).padStart(2, "0")}</strong>
            <span>Oras</span>
          </div>
          <div className={styles.countdownCell}>
            <strong>{String(values.minutes).padStart(2, "0")}</strong>
            <span>Min</span>
          </div>
          <div className={styles.countdownCell}>
            <strong>{String(values.seconds).padStart(2, "0")}</strong>
            <span>Sec</span>
          </div>
        </div>
      </div>
    </section>
  );
}
