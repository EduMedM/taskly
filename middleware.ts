import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/organization(.*)",
  "/board(.*)",
  "/select-org",
  "/api/cards(.*)",
  //"/api/webhook",
]);

export default clerkMiddleware((auth, req) => {
  if (req.url.includes("/api/webhook")) {
    return NextResponse.next();
  }

  if (!auth().userId && isProtectedRoute(req)) {
    return auth().redirectToSignIn({ returnBackUrl: req.url });
  }

  if (auth().userId && !isProtectedRoute(req)) {
    let path: string = "/select-org";
    if (auth().orgId) {
      path = `/organization/${auth().orgId}`;
    }

    return NextResponse.redirect(new URL(path, req.url));
  }

  if (
    auth().userId &&
    !auth().orgId &&
    req.nextUrl.pathname !== "/select-org"
  ) {
    return NextResponse.redirect(new URL("/select-org", req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
