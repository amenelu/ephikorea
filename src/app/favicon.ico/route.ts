import { NextResponse } from "next/server";

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#111827"/>
  <path fill="#38bdf8" d="M18 38c0-9 6-16 14-16s14 7 14 16v4H18v-4Z"/>
  <path fill="#facc15" d="M24 42h16v5H24z"/>
</svg>`;

export function GET() {
  return new NextResponse(favicon, {
    headers: {
      "Cache-Control": "public, max-age=86400",
      "Content-Type": "image/svg+xml",
    },
  });
}
