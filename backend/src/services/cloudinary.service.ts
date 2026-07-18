import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  bytes: number;
  format: string;
};

export function isCloudinaryConfigured() {
  return Boolean(env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret);
}

/**
 * Upload a data URL or remote image URL to Cloudinary (signed upload).
 * Used for GPS proof screenshots so we don't store huge base64 blobs in Postgres.
 */
export async function uploadImageToCloudinary(
  file: string,
  folder = "mountainrun/proofs",
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new ApiError(503, "Image upload is not configured (Cloudinary)");
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/upload`;
  const timestamp = Math.floor(Date.now() / 1000).toString();

  // Signature: sorted params excluding file/api_key/resource_type + secret
  const toSign = `folder=${folder}&timestamp=${timestamp}${env.cloudinaryApiSecret}`;
  const signature = await sha1Hex(toSign);

  const body = new URLSearchParams();
  body.set("file", file);
  body.set("api_key", env.cloudinaryApiKey);
  body.set("timestamp", timestamp);
  body.set("folder", folder);
  body.set("signature", signature);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(502, `Image upload failed: ${text.slice(0, 200)}`);
  }

  return (await response.json()) as CloudinaryUploadResult;
}

async function sha1Hex(input: string) {
  const { createHash } = await import("node:crypto");
  return createHash("sha1").update(input).digest("hex");
}
