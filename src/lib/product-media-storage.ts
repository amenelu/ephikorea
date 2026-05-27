import "server-only";

import { createHash, randomUUID } from "crypto";
import path from "path";

import { getCloudflareEnv } from "@/lib/cloudflare";

const LOCAL_UPLOAD_PATH = ["public", "uploads", "products"];
const MEDIA_PREFIX = "products";
const DEFAULT_CLOUDINARY_FOLDER = "ephikorea/products";

const CONTENT_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export function getUploadExtension(file: File) {
  const fileName = file.name || "";
  const fileExtension = path.extname(fileName).toLowerCase();

  if (CONTENT_TYPES[fileExtension]) {
    return fileExtension;
  }

  switch (file.type) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "image/avif":
      return ".avif";
    default:
      return null;
  }
}

export function getMediaContentType(filename: string) {
  return CONTENT_TYPES[path.extname(filename).toLowerCase()] || null;
}

async function getCloudinaryConfig() {
  const env = await getCloudflareEnv();

  return {
    cloudName:
      env?.CLOUDINARY_CLOUD_NAME?.trim() ||
      process.env.CLOUDINARY_CLOUD_NAME?.trim() ||
      "",
    apiKey:
      env?.CLOUDINARY_API_KEY?.trim() ||
      process.env.CLOUDINARY_API_KEY?.trim() ||
      "",
    apiSecret:
      env?.CLOUDINARY_API_SECRET?.trim() ||
      process.env.CLOUDINARY_API_SECRET?.trim() ||
      "",
    folder:
      env?.CLOUDINARY_FOLDER?.trim() ||
      process.env.CLOUDINARY_FOLDER?.trim() ||
      DEFAULT_CLOUDINARY_FOLDER,
  };
}

function signCloudinaryUpload(params: Record<string, string>, apiSecret: string) {
  const payload = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1")
    .update(`${payload}${apiSecret}`)
    .digest("hex");
}

async function uploadToCloudinary(file: File, fileBuffer: ArrayBuffer) {
  const config = await getCloudinaryConfig();

  if (!config.cloudName || !config.apiKey || !config.apiSecret) {
    return null;
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signedParams = {
    folder: config.folder,
    timestamp,
  };
  const formData = new FormData();

  formData.set("file", new Blob([fileBuffer], { type: file.type || "application/octet-stream" }));
  formData.set("api_key", config.apiKey);
  formData.set("folder", signedParams.folder);
  formData.set("timestamp", signedParams.timestamp);
  formData.set("signature", signCloudinaryUpload(signedParams, config.apiSecret));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Cloudinary upload failed: ${response.status} ${body}`);
  }

  const result = (await response.json()) as { secure_url?: string };

  if (!result.secure_url) {
    throw new Error("Cloudinary upload did not return a secure image URL.");
  }

  return result.secure_url;
}

export async function saveProductMedia(file: File) {
  const extension = getUploadExtension(file);

  if (!extension) {
    throw new Error("Unsupported image format. Use JPG, PNG, WebP, GIF, or AVIF.");
  }

  const fileName = `${randomUUID()}${extension}`;
  const key = `${MEDIA_PREFIX}/${fileName}`;
  const fileBuffer = await file.arrayBuffer();
  const env = await getCloudflareEnv();
  const cloudinaryUrl = await uploadToCloudinary(file, fileBuffer);

  if (cloudinaryUrl) {
    return cloudinaryUrl;
  }

  if (!env) {
    const [{ mkdir, writeFile }] = await Promise.all([import("fs/promises")]);
    const uploadDirectory = path.join(process.cwd(), ...LOCAL_UPLOAD_PATH);

    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(path.join(uploadDirectory, fileName), Buffer.from(fileBuffer));

    return `/media/products/${fileName}`;
  }

  if (env.PRODUCT_MEDIA) {
    await env.PRODUCT_MEDIA.put(key, fileBuffer, {
      httpMetadata: { contentType: file.type || getMediaContentType(fileName) || undefined },
    });

    return `/media/products/${fileName}`;
  }

  throw new Error(
    "Product image uploads are not enabled on this hosting plan. Paste an image URL instead.",
  );
}

export async function readProductMedia(filename: string) {
  const safeFilename = path.basename(filename);
  const contentType = getMediaContentType(safeFilename);

  if (!contentType || safeFilename !== filename) {
    return null;
  }

  const env = await getCloudflareEnv();

  if (env?.PRODUCT_MEDIA) {
    const object = await env.PRODUCT_MEDIA.get(`${MEDIA_PREFIX}/${safeFilename}`);

    if (!object) {
      return null;
    }

    return {
      body: object.body,
      contentType: object.httpMetadata?.contentType || contentType,
    };
  }

  if (env) {
    return null;
  }

  try {
    const { readFile } = await import("fs/promises");
    const file = await readFile(path.join(process.cwd(), ...LOCAL_UPLOAD_PATH, safeFilename));

    return {
      body: file,
      contentType,
    };
  } catch {
    return null;
  }
}
