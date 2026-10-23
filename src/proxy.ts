import { NextResponse, type NextRequest } from "next/server";
import { routeForHost } from "@/lib/operators-host";
import { SITE_URL } from "@/lib/site-url";

/** Serves the bus operator portal at operators.instatickets.co.zw (see src/lib/operators-host.ts). */
export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const route = routeForHost(request.headers.get("host"), url.pathname);
  switch (route.kind) {
    case "rewrite": {
      const target = url.clone();
      target.pathname = route.pathname;
      return NextResponse.rewrite(target);
    }
    case "redirect-local": {
      const target = url.clone();
      target.pathname = route.pathname;
      return NextResponse.redirect(target, 308);
    }
    case "redirect-main":
      return NextResponse.redirect(new URL(`${route.pathname}${url.search}`, SITE_URL), 308);
    default:
      return NextResponse.next();
  }
}

export const config = {
  // Pages only: framework files, images and other files with an extension pass straight through.
  matcher: ["/((?!_next/|api/|brand/|.*\\..*).*)"],
};
