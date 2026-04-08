import type { CoursePreviewMediaType } from "./course-preview-media";
import type { SubtopicButton } from "./subtopic-buttons";

export type LeadAttribution = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  fbclid: string | null;
  landingPath: string | null;
};

export type CourseMeta = {
  id: string;
  title: string;
  subtitle: string;
  heroTitle: string;
  heroSummary: string;
  ctaLabel: string;
  previewMediaType: CoursePreviewMediaType;
  previewThumbnailUrl: string;
  previewVideoUrl: string;
};

export type TopicRecord = {
  id: string;
  title: string;
  summary: string;
  position: number;
};

export type SubtopicRecord = {
  id: string;
  topicId: string;
  title: string;
  summary: string;
  position: number;
  durationSeconds: number;
  videoUrl: string;
  buttons: SubtopicButton[];
};

export type LeadRecord = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  companies: string[];
  propertyTypes: string[];
  salesFocus: string;
  attribution: LeadAttribution;
  createdAt: string;
  updatedAt: string;
};

export type AuthEventRecord = {
  id: string;
  leadId: string;
  type: "form-access" | "resume-login" | "magic-link-sent" | "magic-link-opened";
  createdAt: string;
};

export type WatchEventRecord = {
  id: string;
  leadId: string;
  subtopicId: string;
  sessionId: string;
  watchedSeconds: number;
  positionSeconds: number;
  createdAt: string;
};

export type FunnelDatabase = {
  course: CourseMeta;
  topics: TopicRecord[];
  subtopics: SubtopicRecord[];
  leads: LeadRecord[];
  authEvents: AuthEventRecord[];
  watchEvents: WatchEventRecord[];
};

export type LeadCourseSnapshot = {
  course: CourseMeta;
  topics: Array<TopicRecord & { subtopics: SubtopicRecord[] }>;
};
