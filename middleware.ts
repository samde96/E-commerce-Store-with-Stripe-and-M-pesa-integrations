import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/api/:path*",
    "/sign-in/:path*",
    "/sign-up/:path*",
  ],
};

























// import { clerkMiddleware } from "@clerk/nextjs/server";
// // This example protects all routes including api/trpc routes
// // Please edit this to allow other routes to be public as needed.

// export default clerkMiddleware();

// export const config = {
//  matcher: [
//    // Skip static files
//    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//    // Protect API routes
//    "/api/:path*",
//    // Protect authentication routes
//    "/sign-in/:path*",
//    "/sign-up/:path*",
//   ],
// };

