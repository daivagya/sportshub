import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    console.log("--------------------------",token)
    // Not logged in
    if (!token) return NextResponse.redirect(new URL("/", req.url));

    const role = token.role;

    // Redirect OWNER to manager dashboard if on root
    if (role === "OWNER" && req.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/manager/dashboard", req.url));
    }

    // Prevent USER accessing /manager
    if (role === "USER" && req.nextUrl.pathname.startsWith("/manager")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
    pages: { signIn: "/login" },
  }
);

// Apply middleware only on /manager/ paths and homepage '/'
export const config = {
  matcher: ["/manager/:path", "/"],
};
