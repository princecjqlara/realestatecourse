type CloudinaryServerConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder: string;
};

export function getCloudinaryServerConfig(): CloudinaryServerConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER?.trim() || "course-at-home/media";

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary server configuration is incomplete.");
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
    folder,
  };
}
