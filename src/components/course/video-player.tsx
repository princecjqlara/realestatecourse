'use client';

import { useEffect, useEffectEvent, useRef } from "react";

type VideoPlayerProps = {
  subtopicId: string;
  title: string;
  summary: string;
  videoUrl: string;
};

export function VideoPlayer({ subtopicId, title, summary, videoUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pendingSecondsRef = useRef(0);
  const lastTimestampRef = useRef(0);
  const sessionIdRef = useRef<string>("");

  const captureProgress = useEffectEvent((currentTime: number) => {
    if (currentTime <= lastTimestampRef.current) {
      lastTimestampRef.current = currentTime;
      return;
    }

    pendingSecondsRef.current += currentTime - lastTimestampRef.current;
    lastTimestampRef.current = currentTime;
  });

  const flushProgress = useEffectEvent(async (positionSeconds: number) => {
    const watchedSeconds = Math.round(pendingSecondsRef.current);
    if (watchedSeconds <= 0) {
      return;
    }

    pendingSecondsRef.current = 0;

    await fetch("/api/watch-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
      body: JSON.stringify({
        subtopicId,
        sessionId: sessionIdRef.current,
        watchedSeconds,
        positionSeconds: Math.round(positionSeconds),
      }),
    }).catch(() => {
      pendingSecondsRef.current += watchedSeconds;
    });
  });

  useEffect(() => {
    sessionIdRef.current = crypto.randomUUID();
    const video = videoRef.current;
    if (!video) {
      return;
    }

    let heartbeat: ReturnType<typeof setInterval> | null = null;

    const startHeartbeat = () => {
      if (heartbeat) {
        return;
      }

      lastTimestampRef.current = video.currentTime;
      heartbeat = setInterval(() => {
        captureProgress(video.currentTime);
        void flushProgress(video.currentTime);
      }, 10000);
    };

    const stopHeartbeat = () => {
      if (heartbeat) {
        clearInterval(heartbeat);
        heartbeat = null;
      }
    };

    const handlePlay = () => {
      startHeartbeat();
    };

    const handlePause = () => {
      captureProgress(video.currentTime);
      void flushProgress(video.currentTime);
      stopHeartbeat();
    };

    const handleEnded = () => {
      captureProgress(video.duration || video.currentTime);
      void flushProgress(video.duration || video.currentTime);
      stopHeartbeat();
    };

    const handleSeeking = () => {
      lastTimestampRef.current = video.currentTime;
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("seeking", handleSeeking);

    return () => {
      handlePause();
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("seeking", handleSeeking);
    };
  }, [subtopicId]);

  return (
    <section className="panel videoPanel">
      <div className="videoHeader">
        <div>
          <p className="eyebrow">Now watching</p>
          <h1>{title}</h1>
        </div>
        <p>{summary}</p>
      </div>

      <video className="videoElement" controls preload="metadata" ref={videoRef} src={videoUrl} />
    </section>
  );
}
