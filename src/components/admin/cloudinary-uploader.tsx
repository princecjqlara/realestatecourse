'use client';

import Image from "next/image";
import { startTransition, useId, useMemo, useState } from "react";

type CloudinaryResourceType = "image" | "video" | "raw";

type UploadedAsset = {
  secureUrl: string;
  publicId: string;
  resourceType: CloudinaryResourceType;
  format: string;
  bytes: number;
  originalFilename: string;
};

type SignaturePayload = {
  apiKey: string;
  cloudName: string;
  folder: string;
  resourceType: CloudinaryResourceType;
  signature: string;
  timestamp: string;
  uniqueFilename: boolean;
  useFilename: boolean;
};

type CloudinaryUploaderProps = {
  title: string;
  description: string;
  resourceType?: CloudinaryResourceType;
  allowResourceTypeSelection?: boolean;
  urlFieldName?: string;
  publicIdFieldName?: string;
  resourceTypeFieldName?: string;
  formatFieldName?: string;
};

function getAcceptValue(resourceType: CloudinaryResourceType) {
  switch (resourceType) {
    case "image":
      return "image/*";
    case "video":
      return "video/*";
    default:
      return "*/*";
  }
}

export function CloudinaryUploader({
  allowResourceTypeSelection = false,
  description,
  formatFieldName,
  publicIdFieldName,
  resourceType = "image",
  resourceTypeFieldName,
  title,
  urlFieldName,
}: CloudinaryUploaderProps) {
  const inputId = useId();
  const [asset, setAsset] = useState<UploadedAsset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedResourceType, setSelectedResourceType] = useState<CloudinaryResourceType>(
    resourceType,
  );

  const accept = useMemo(() => getAcceptValue(selectedResourceType), [selectedResourceType]);

  async function uploadToCloudinary(file: File, currentResourceType: CloudinaryResourceType) {
    const signatureResponse = await fetch("/api/admin/cloudinary/sign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resourceType: currentResourceType,
      }),
    });

    const signaturePayload = (await signatureResponse.json().catch(() => null)) as
      | SignaturePayload
      | { error?: string }
      | null;

    if (!signatureResponse.ok || !signaturePayload || !("signature" in signaturePayload)) {
      throw new Error(
        (signaturePayload && "error" in signaturePayload && signaturePayload.error) ||
          "Unable to prepare the Cloudinary upload.",
      );
    }

    const uploadBody = new FormData();
    uploadBody.set("api_key", signaturePayload.apiKey);
    uploadBody.set("file", file);
    uploadBody.set("folder", signaturePayload.folder);
    uploadBody.set("signature", signaturePayload.signature);
    uploadBody.set("timestamp", signaturePayload.timestamp);
    uploadBody.set("unique_filename", String(signaturePayload.uniqueFilename));
    uploadBody.set("use_filename", String(signaturePayload.useFilename));

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${signaturePayload.cloudName}/${currentResourceType}/upload`,
      {
        method: "POST",
        body: uploadBody,
      },
    );

    const uploadPayload = (await uploadResponse.json().catch(() => null)) as
      | {
          bytes?: number;
          format?: string;
          original_filename?: string;
          public_id?: string;
          resource_type?: CloudinaryResourceType;
          secure_url?: string;
          error?: { message?: string };
        }
      | null;

    if (!uploadResponse.ok || !uploadPayload?.secure_url || !uploadPayload.public_id) {
      throw new Error(uploadPayload?.error?.message || "Cloudinary upload failed.");
    }

    return {
      bytes: uploadPayload.bytes ?? file.size,
      format: uploadPayload.format ?? "",
      originalFilename: uploadPayload.original_filename ?? file.name,
      publicId: uploadPayload.public_id,
      resourceType: uploadPayload.resource_type ?? currentResourceType,
      secureUrl: uploadPayload.secure_url,
    } satisfies UploadedAsset;
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const nextAsset = await uploadToCloudinary(file, selectedResourceType);

      startTransition(() => {
        setAsset(nextAsset);
      });
    } catch (uploadError) {
      startTransition(() => {
        setAsset(null);
        setError(
          uploadError instanceof Error ? uploadError.message : "Unable to upload the media.",
        );
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="uploadShell">
      <div className="uploadHeader compactGap">
        <div>
          <span className="fieldTitle">{title}</span>
          <p className="uploadHint">{description}</p>
        </div>

        {allowResourceTypeSelection ? (
          <label className="field">
            <span>Media type</span>
            <select
              onChange={(event) => {
                setSelectedResourceType(event.target.value as CloudinaryResourceType);
                setAsset(null);
                setError(null);
              }}
              value={selectedResourceType}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="raw">Other file</option>
            </select>
          </label>
        ) : null}
      </div>

      {urlFieldName ? <input name={urlFieldName} type="hidden" value={asset?.secureUrl ?? ""} /> : null}
      {publicIdFieldName ? (
        <input name={publicIdFieldName} type="hidden" value={asset?.publicId ?? ""} />
      ) : null}
      {resourceTypeFieldName ? (
        <input
          name={resourceTypeFieldName}
          type="hidden"
          value={asset?.resourceType ?? selectedResourceType}
        />
      ) : null}
      {formatFieldName ? (
        <input name={formatFieldName} type="hidden" value={asset?.format ?? ""} />
      ) : null}

      <div className="uploadControls">
        <label className="buttonSecondary uploadButton" htmlFor={inputId}>
          {isUploading ? "Uploading..." : `Upload ${selectedResourceType}`}
        </label>
        <input
          accept={accept}
          className="srOnlyInput"
          id={inputId}
          onChange={handleFileChange}
          type="file"
        />
        <span className="uploadHint">Uploads directly to Cloudinary from the admin page.</span>
      </div>

      {error ? <p className="formMessage error">{error}</p> : null}

      {asset ? (
        <div className="uploadPreview panel compactGap">
          {asset.resourceType === "image" ? (
            <div className="imagePreviewFrame">
              <Image
                alt={asset.originalFilename}
                className="previewMedia imagePreview"
                fill
                sizes="(max-width: 960px) 100vw, 420px"
                src={asset.secureUrl}
                unoptimized
              />
            </div>
          ) : null}

          {asset.resourceType === "video" ? (
            <video className="previewMedia" controls preload="metadata" src={asset.secureUrl} />
          ) : null}

          <div className="uploadMeta compactGap">
            <label className="field">
              <span>Secure URL</span>
              <input className="monoInput" readOnly type="text" value={asset.secureUrl} />
            </label>
            <label className="field">
              <span>Public ID</span>
              <input className="monoInput" readOnly type="text" value={asset.publicId} />
            </label>
            <div className="uploadFacts">
              <span>{asset.resourceType}</span>
              <span>{asset.format || "original format"}</span>
              <span>{Math.max(1, Math.round(asset.bytes / 1024))} KB</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
