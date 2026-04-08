export function resolveSubmittedVideoUrl(input: {
  cloudinaryVideoUrl: string;
  videoUrl: string;
}) {
  return input.cloudinaryVideoUrl.trim() || input.videoUrl.trim();
}
