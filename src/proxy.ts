import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const response = intl(request);
  // Vercel says which country the visit comes from; the page starts prices in that country's currency.
  const country = request.headers.get("x-vercel-ip-country");
  if (country) response.cookies.set("aigency-country", country, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 });
  return response;
}

export const config = {
  // Skip API routes, Next internals and static/public files.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
