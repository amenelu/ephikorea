import { NextRequest, NextResponse } from "next/server";

import { readProductMedia } from "@/lib/product-media-storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: { filename: string } },
) {
  const media = await readProductMedia(params.filename);

  if (!media) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(media.body, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": media.contentType,
    },
  });
}
