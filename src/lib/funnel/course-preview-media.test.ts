import { describe, expect, it } from "vitest";

import { resolveSubmittedCoursePreviewMedia } from "./course-preview-media";

describe("resolveSubmittedCoursePreviewMedia", () => {
  it("accepts image thumbnails with preview video", () => {
    expect(
      resolveSubmittedCoursePreviewMedia({
        previewMediaType: "image",
        previewThumbnailUrl: " https://res.cloudinary.com/demo/image/upload/sample.jpg ",
        previewVideoUrl: " https://res.cloudinary.com/demo/video/upload/sample.mp4 ",
      }),
    ).toEqual({
      previewMediaType: "image",
      previewThumbnailUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      previewVideoUrl: "https://res.cloudinary.com/demo/video/upload/sample.mp4",
    });
  });

  it("accepts video thumbnails with preview video", () => {
    expect(
      resolveSubmittedCoursePreviewMedia({
        previewMediaType: "video",
        previewThumbnailUrl: "https://res.cloudinary.com/demo/video/upload/thumb.mp4",
        previewVideoUrl: "https://res.cloudinary.com/demo/video/upload/full.mp4",
      }),
    ).toEqual({
      previewMediaType: "video",
      previewThumbnailUrl: "https://res.cloudinary.com/demo/video/upload/thumb.mp4",
      previewVideoUrl: "https://res.cloudinary.com/demo/video/upload/full.mp4",
    });
  });

  it("rejects incomplete preview media", () => {
    expect(() =>
      resolveSubmittedCoursePreviewMedia({
        previewMediaType: "image",
        previewThumbnailUrl: "",
        previewVideoUrl: "https://res.cloudinary.com/demo/video/upload/full.mp4",
      }),
    ).toThrow(/preview thumbnail/i);
  });
});
