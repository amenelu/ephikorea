import "server-only";

import { randomUUID } from "crypto";
import path from "path";

import { getCloudflareEnv } from "@/lib/cloudflare";

const LOCAL_UPLOAD_PATH = ["public", "uploads", "products"];
const MEDIA_PREFIX = "products";

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

export async function saveProductMedia(file: File) {
  const extension = getUploadExtension(file);

  if (!extension) {
    throw new Error("Unsupported image format. Use JPG, PNG, WebP, GIF, or AVIF.");
  }

  const fileName = `${randomUUID()}${extension}`;
  const key = `${MEDIA_PREFIX}/${fileName}`;
  const fileBuffer = await file.arrayBuffer();
  const env = await getCloudflareEnv();

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
