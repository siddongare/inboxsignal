import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedPageRoute = createRouteMatcher(["/app(.*)"]);
const isProtectedApiRoute = createRouteMatcher(["/api/audit(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedPageRoute(req) || isProtectedApiRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
