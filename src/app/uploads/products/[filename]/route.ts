import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const CONTENT_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { filename: string } },
) {
  const filename = path.basename(params.filename);
  const extension = path.extname(filename).toLowerCase();
  const contentType = CONTENT_TYPES[extension];

  if (!contentType || filename !== params.filename) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "products",
      filename,
    );
    const file = await readFile(filePath);

    return new NextResponse(file, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": contentType,
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
