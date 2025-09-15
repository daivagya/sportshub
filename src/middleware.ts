import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Define public routes that do not require authentication
const PUBLIC_ROUTES = ["/login", "/register"];

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
    const userRole = token?.role;

    // If the user is authenticated, handle redirects
    if (token) {
      // Redirect logged-in users away from public routes (e.g., /login)
      if (PUBLIC_ROUTES.includes(pathname)) {
        if (userRole === "ADMIN") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        if (userRole === "OWNER") return NextResponse.redirect(new URL("/manager/dashboard", req.url));
        return NextResponse.redirect(new URL("/", req.url));
      }

      // Redirect ADMIN and OWNER from the homepage to their respective dashboards
      if (pathname === "/") {
        if (userRole === "ADMIN") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        if (userRole === "OWNER") return NextResponse.redirect(new URL("/manager/dashboard", req.url));
      }
    }

    // If no specific redirect logic matches, allow the request to proceed.
    // The `withAuth` HOC will handle the protection of non-public routes.
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to public routes for everyone
        if (PUBLIC_ROUTES.includes(pathname)) {
          return true;
        }
        
        // For all other routes, user must be authenticated
        return !!token;
      },
    },
    pages: {
      // If authorization fails, redirect to the homepage to trigger the login modal
      signIn: "/",
    },
  }
);

// Apply this middleware to all relevant paths
export const config = {
  matcher: [
    "/admin/:path*",
    "/manager/:path*",
    "/",
    "/login",
    "/register",
  ],
};
