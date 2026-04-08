import type { FunnelDatabase } from "./types";

const sampleVideoUrl =
  "https://res.cloudinary.com/demo/video/upload/docs/walking_tour.mp4";

export const defaultDatabase: FunnelDatabase = {
  course: {
    id: "facebook-ads-masterclass",
    title: "Facebook Ads Home Seller Funnel",
    subtitle: "Free course for agents, teams, and property marketers",
    heroTitle: "Get the free Facebook Ads course that shows how to turn clicks into property leads.",
    heroSummary:
      "This funnel is built for companies selling property, listings, and real estate services that need stronger lead quality from Meta campaigns.",
    ctaLabel: "Unlock the course",
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
    },
    {
      id: "lesson-audience",
      topicId: "topic-foundation",
      title: "Audience selection",
      summary: "Choose the segments and exclusions that protect lead quality before you scale budget.",
      position: 2,
      durationSeconds: 280,
      videoUrl: sampleVideoUrl,
    },
    {
      id: "lesson-creative-system",
      topicId: "topic-creative",
      title: "Creative system",
      summary: "Pair pain-point angles with property-specific proof and tighter CTA framing.",
      position: 1,
      durationSeconds: 360,
      videoUrl: sampleVideoUrl,
    },
    {
      id: "lesson-follow-up",
      topicId: "topic-optimization",
      title: "Watch-to-lead follow-up",
      summary: "Capture viewing signals and turn them into practical sales follow-up triggers.",
      position: 1,
      durationSeconds: 300,
      videoUrl: sampleVideoUrl,
    },
  ],
  leads: [],
  authEvents: [],
  watchEvents: [],
};
