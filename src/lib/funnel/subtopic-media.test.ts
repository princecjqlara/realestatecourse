import { describe, expect, it } from "vitest";

import { resolveSubmittedVideoUrl } from "./subtopic-media";

describe("resolveSubmittedVideoUrl", () => {
  it("prefers the uploaded Cloudinary URL when present", () => {
    expect(
      resolveSubmittedVideoUrl({
        cloudinaryVideoUrl: "https://res.cloudinary.com/demo/video/upload/course/lesson.mp4",
        videoUrl: "https://example.com/manual.mp4",
      }),
    ).toBe("https://res.cloudinary.com/demo/video/upload/course/lesson.mp4");
  });

  it("falls back to the manually provided video URL", () => {
    expect(
      resolveSubmittedVideoUrl({
        cloudinaryVideoUrl: "",
        videoUrl: "https://res.cloudinary.com/demo/video/upload/course/manual.mp4",
      }),
    ).toBe("https://res.cloudinary.com/demo/video/upload/course/manual.mp4");
  });
});
