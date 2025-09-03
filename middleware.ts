// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// This middleware will run before every request that matches the matcher paths
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token; // comes from NextAuth JWT
    const url = req.nextUrl;

    // If no token → redirect to login
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Role-based redirection
    if (url.pathname === "/") {
      // Example: redirect user based on role from root
      if (token.role === "USER") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      } else if (token.role === "OWNER") {
        return NextResponse.redirect(new URL("/dashboard/manager/dashboard", req.url));
      } else if (token.role === "ADMIN") {
        // return NextResponse.redirect(new URL("/dashboard/admin", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Protect routes by requiring token
      authorized: ({ token }) => !!token,
    },
  }
);

// Define which routes are protected by middleware
export const config = {
  matcher: [
    "/",                 // Root → role-based redirect
    "/dashboard/:path*", // Protect dashboard routes
    "/venues/:path*",    // Example of protected routes
  ],
};
