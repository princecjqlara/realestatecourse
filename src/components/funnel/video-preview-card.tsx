'use client';

import Image from "next/image";

import type { CoursePreviewMediaType } from "@/lib/funnel/course-preview-media";
import styles from "@/app/page.module.css";

type VideoPreviewCardProps = {
  lessonCount: number;
  onPlayAttempt: () => void;
  previewMediaType: CoursePreviewMediaType;
  previewVideoUrl: string;
  summary: string;
  thumbnailUrl: string;
  title: string;
};

export function VideoPreviewCard({
  lessonCount,
  onPlayAttempt,
  previewMediaType,
  previewVideoUrl,
  summary,
  thumbnailUrl,
  title,
}: VideoPreviewCardProps) {
  return (
    <div className={styles.previewCard}>
      <div className={styles.previewTopbar}>
        <div className={styles.previewTopmeta}>
          <span>{lessonCount} lessons</span>
          <span>FREE access</span>
        </div>

        <button className={styles.watchNowButton} onClick={onPlayAttempt} type="button">
          Watch now
        </button>
      </div>

      <div className={styles.previewImageShell}>
        {previewMediaType === "video" ? (
          <video autoPlay className={styles.previewMediaVideo} loop muted playsInline preload="metadata" src={previewVideoUrl} />
        ) : (
          <Image
            alt={title}
            className={styles.previewImage}
            fill
            priority
            sizes="(max-width: 960px) 100vw, 720px"
            src={thumbnailUrl}
          />
        )}

        <button className={styles.playButton} onClick={onPlayAttempt} type="button">
          <span className={styles.playIcon}>▶</span>
        </button>

        <div className={styles.previewOverlay}>
          <span>Click play to unlock</span>
        </div>
      </div>

      <div className={styles.previewCopy}>
        <p className={styles.previewLabel}>Preview ng course</p>
        <h2>{title}</h2>
        <p>{summary}</p>
      </div>
    </div>
  );
}
