export type CoursePreviewMediaType = "image" | "video";

export function resolveSubmittedCoursePreviewMedia(input: {
  previewMediaType: string;
  previewThumbnailUrl: string;
  previewVideoUrl: string;
}) {
  const previewMediaType = input.previewMediaType.trim();
  const previewThumbnailUrl = input.previewThumbnailUrl.trim();
  const previewVideoUrl = input.previewVideoUrl.trim();

  if (previewMediaType !== "image" && previewMediaType !== "video") {
    throw new Error("Please choose a valid preview media type.");
  }

  if (!previewThumbnailUrl) {
    throw new Error("Please provide a preview thumbnail or preview media URL.");
  }

  if (!previewVideoUrl) {
    throw new Error("Please provide a preview video URL.");
  }

  return {
    previewMediaType,
    previewThumbnailUrl,
    previewVideoUrl,
  } as {
    previewMediaType: CoursePreviewMediaType;
    previewThumbnailUrl: string;
    previewVideoUrl: string;
  };
}
