import type { FunnelDatabase } from "./types";

const sampleVideoUrl =
  "https://res.cloudinary.com/demo/video/upload/docs/walking_tour.mp4";
const sampleThumbnailUrl =
  "https://res.cloudinary.com/demo/video/upload/so_3/docs/walking_tour.jpg";

export const defaultDatabase: FunnelDatabase = {
  course: {
    id: "facebook-ads-masterclass",
    title: "Facebook Ads Home Seller Funnel",
    subtitle: "Free course for agents, teams, and property marketers",
    heroTitle: "Aralin kung paano kumuha ng mas quality na real estate leads gamit ang Facebook Ads.",
    heroSummary:
      "Free Taglish course ito para sa agents, brokers, at real estate teams na gustong gawing mas qualified ang leads mula Meta campaigns.",
    ctaLabel: "Kunin ang free course",
    previewMediaType: "image",
    previewThumbnailUrl: sampleThumbnailUrl,
    previewVideoUrl: sampleVideoUrl,
  },
  topics: [
    {
      id: "topic-foundation",
      title: "Foundation",
      summary: "Define the offer, audience, and promise that gets the right people to raise their hand.",
      position: 1,
    },
    {
      id: "topic-creative",
      title: "Creative",
      summary: "Structure ads and angles that filter for buyer intent instead of vanity traffic.",
      position: 2,
    },
    {
      id: "topic-optimization",
      title: "Optimization",
      summary: "Read performance signals, improve retention, and tighten follow-up around qualified leads.",
      position: 3,
    },
  ],
  subtopics: [
    {
      id: "lesson-offer",
      topicId: "topic-foundation",
      title: "Offer and hook",
      summary: "Build a free-course promise that makes a seller stop scrolling and opt in.",
      position: 1,
      durationSeconds: 320,
      videoUrl: sampleVideoUrl,
      buttons: [],
    },
    {
      id: "lesson-audience",
      topicId: "topic-foundation",
      title: "Audience selection",
      summary: "Choose the segments and exclusions that protect lead quality before you scale budget.",
      position: 2,
      durationSeconds: 280,
      videoUrl: sampleVideoUrl,
      buttons: [],
    },
    {
      id: "lesson-creative-system",
      topicId: "topic-creative",
      title: "Creative system",
      summary: "Pair pain-point angles with property-specific proof and tighter CTA framing.",
      position: 1,
      durationSeconds: 360,
      videoUrl: sampleVideoUrl,
      buttons: [],
    },
    {
      id: "lesson-follow-up",
      topicId: "topic-optimization",
      title: "Watch-to-lead follow-up",
      summary: "Capture viewing signals and turn them into practical sales follow-up triggers.",
      position: 1,
      durationSeconds: 300,
      videoUrl: sampleVideoUrl,
      buttons: [],
    },
  ],
  leads: [],
  authEvents: [],
  watchEvents: [],
};
