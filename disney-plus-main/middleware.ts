import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Allow all routes to render; client-side authentication is handled by ClientShell
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
