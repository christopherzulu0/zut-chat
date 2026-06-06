import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { isAdminRole } from "@/lib/auth/roles";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  if (isAdminRoute(req)) {
    const session = await auth();
    const admin = isAdminRole(
      session.sessionClaims as {
        metadata?: { role?: string };
        publicMetadata?: { role?: string };
      },
      session.userId
    );

    if (!admin) {
      const deniedUrl = new URL("/chat", req.url);
      deniedUrl.searchParams.set("admin", "denied");
      return Response.redirect(deniedUrl);
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
