import NextAuth from "next-auth";
import authConfig from "./auth.config";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  protectedRoutes,
  publicRoutes,
} from "@/routes";
const { auth } = NextAuth(authConfig);
export default auth((req) => {
  console.log("route", req.nextUrl.pathname);
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  
  // Check if route is public (including dynamic routes)
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname) || 
    nextUrl.pathname.startsWith('/snippets/') || // Allow all snippet detail pages
    nextUrl.pathname.match(/^\/[^\/]+$/) && !protectedRoutes.includes(nextUrl.pathname); // Allow user profile pages like /[userslug]
  
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isProtectedRoute = protectedRoutes.includes(nextUrl.pathname);
  
  if (isApiAuthRoute) {
    return;
  }
  
  // If logged in and trying to access any auth page, redirect to default page
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return;
  }
  
  // If not logged in and trying to access protected route, redirect to login
  if (!isLoggedIn && isProtectedRoute) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }
  
  return;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

//Check out- replace return with return null; in future