import { afterEach, describe, expect, it } from "vitest";

import { getCloudinaryServerConfig } from "./config";

const originalEnv = {
  ...process.env,
};

afterEach(() => {
  process.env = {
    ...originalEnv,
  };
});

describe("getCloudinaryServerConfig", () => {
  it("returns the upload configuration when Cloudinary env is present", () => {
    process.env.CLOUDINARY_CLOUD_NAME = "media-cloud";
    process.env.CLOUDINARY_API_KEY = "123456";
    process.env.CLOUDINARY_API_SECRET = "secret-value";
    process.env.CLOUDINARY_UPLOAD_FOLDER = "course-at-home/media";

    expect(getCloudinaryServerConfig()).toEqual({
      apiKey: "123456",
      apiSecret: "secret-value",
      cloudName: "media-cloud",
      folder: "course-at-home/media",
    });
  });

  it("throws when required Cloudinary env is missing", () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;

    expect(() => getCloudinaryServerConfig()).toThrow(/cloudinary/i);
  });
});
