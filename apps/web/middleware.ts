import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    // During build time, env vars may not be available — skip middleware
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            response.cookies.set(name, value, options as any)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Sanity Studio — skip all auth logic
  if (pathname.startsWith('/studio')) {
    return response;
  }

  // Public API routes (no auth required)
  const publicApiRoutes = [
    "/api/tournaments/public",
  ];
  const isPublicApi = publicApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // API routes that require authentication
  const protectedApiRoutes = [
    "/api/athletes",
    "/api/shortlists",
    "/api/messages",
    "/api/analytics",
    "/api/athlete",
    "/api/recruiting",
    "/api/film",
    "/api/tournaments",
    "/api/dashr",
    "/api/notifications",
    "/api/onboarding",
    "/api/recruiter",
    "/api/coach",
    "/api/club",
    "/api/parent",
  ];
  const isProtectedApi = !isPublicApi && protectedApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Public directory routes (no auth required)
  const publicDirectoryRoutes = [
    "/zones",
    "/positions",
    "/states",
    "/programs",
    "/card",
  ];
  const isPublicDirectory = publicDirectoryRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // App routes that require authentication
  const appRoutes = [
    "/dashboard",
    "/athlete",
    "/recruiter",
    "/coach",
    "/admin",
    "/parent",
    "/club",
    "/dashr",
    "/zone",
    "/messages",
    "/onboarding",
    "/settings",
    "/athletes",
    "/shortlist",
    "/tournaments",
  ];
  const isAppRoute = !isPublicDirectory && appRoutes.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users from protected routes
  if (!user && (isAppRoute || isProtectedApi)) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
