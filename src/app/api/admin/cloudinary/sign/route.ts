import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { parseSessionCookieValue } from "@/lib/auth/cookies";
import { ADMIN_COOKIE_NAME } from "@/lib/auth/constants";
import { getCloudinaryServerConfig } from "@/lib/cloudinary/config";
import { buildCloudinarySignature } from "@/lib/cloudinary/signature";

const signRequestSchema = z.object({
  resourceType: z.enum(["image", "video", "raw"]),
});

export async function POST(request: NextRequest) {
  const adminId = parseSessionCookieValue(request.cookies.get(ADMIN_COOKIE_NAME)?.value, "admin");
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsedBody = signRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  let config;

  try {
    config = getCloudinaryServerConfig();
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Cloudinary is not configured.",
      },
      { status: 503 },
    );
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const signatureParameters = {
    folder: config.folder,
    timestamp,
    unique_filename: "true",
    use_filename: "true",
  };

  return NextResponse.json({
    apiKey: config.apiKey,
    cloudName: config.cloudName,
    folder: config.folder,
    resourceType: parsedBody.data.resourceType,
    signature: buildCloudinarySignature(signatureParameters, config.apiSecret),
    timestamp,
    uniqueFilename: true,
    useFilename: true,
  });
}
