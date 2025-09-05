import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // The `withAuth` HOC ensures an authenticated user is present before this runs.
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl; // If a logged-in user tries to visit the login page, redirect them away.

    if (pathname === "/login") {
      const url = token?.role === "OWNER" ? "/manager/dashboard" : "/";
      return NextResponse.redirect(new URL(url, req.url));
    } // Redirect logged-in OWNER from the homepage to their dashboard.

    if (token?.role === "OWNER" && pathname === "/") {
      return NextResponse.redirect(new URL("/manager/dashboard", req.url));
    } // Prevent a logged-in USER from accessing any /manager routes.

    if (token?.role === "USER" && pathname.startsWith("/manager")) {
      // Redirect them to the homepage or an "access denied" page for better UX.
      return NextResponse.redirect(new URL("/", req.url));
    } // If no special rules match, allow the request to proceed.

    return NextResponse.next();
  },
  {
    callbacks: {
      // This logic runs before the middleware function.
      // If it returns false, the user is redirected to the `signIn` page.
      authorized: ({ token }) => !!token,
    },
    pages: {
      // Custom login page path.
      signIn: "/",
    },
  }
);

// Apply this middleware to relevant paths.
export const config = {
  matcher: [
    "/manager/:path*", // Protect all manager routes
    "/", // Apply rules to the homepage
  ],
};
