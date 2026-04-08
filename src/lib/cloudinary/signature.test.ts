import { describe, expect, it } from "vitest";

import { buildCloudinaryDeliveryUrl, buildCloudinarySignature } from "./signature";

describe("buildCloudinarySignature", () => {
  it("creates a deterministic signature from sorted parameters", () => {
    const signature = buildCloudinarySignature(
      {
        folder: "course-at-home/media",
        public_id: "lesson-intro",
        timestamp: "1700000000",
      },
      "very-secret-key",
    );

    expect(signature).toBe("c88a14a7544cbe6659d7d739a30c6648647d629a");
  });
});

describe("buildCloudinaryDeliveryUrl", () => {
  it("builds a Cloudinary delivery URL for uploaded videos", () => {
    const url = buildCloudinaryDeliveryUrl({
      cloudName: "media-cloud",
      resourceType: "video",
      publicId: "course-at-home/lesson-intro",
      format: "mp4",
    });

    expect(url).toBe(
      "https://res.cloudinary.com/media-cloud/video/upload/course-at-home/lesson-intro.mp4",
    );
  });
});
