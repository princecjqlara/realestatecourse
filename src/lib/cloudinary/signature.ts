import { createHash } from "node:crypto";

type CloudinarySignatureParams = Record<string, string | number | undefined | null>;

type CloudinaryDeliveryUrlInput = {
  cloudName: string;
  resourceType: "image" | "video" | "raw";
  publicId: string;
  format?: string | null;
  version?: string | number | null;
  transformations?: string | null;
};

export function buildCloudinarySignature(
  parameters: CloudinarySignatureParams,
  apiSecret: string,
) {
  const serialized = Object.entries(parameters)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1")
    .update(`${serialized}${apiSecret}`)
    .digest("hex");
}

export function buildCloudinaryDeliveryUrl({
  cloudName,
  format,
  publicId,
  resourceType,
  transformations,
  version,
}: CloudinaryDeliveryUrlInput) {
  const versionSegment = version ? `v${version}/` : "";
  const transformationSegment = transformations ? `${transformations}/` : "";
  const formatSuffix = format ? `.${format}` : "";

  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${transformationSegment}${versionSegment}${publicId}${formatSuffix}`;
}
