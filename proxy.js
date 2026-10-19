import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Hanya proteksi rute /admin kecuali /admin/login
  const ruteAdmin = pathname.startsWith("/admin");
  const ruteLogin = pathname === "/admin/login";

  if (!ruteAdmin || ruteLogin) {
    return NextResponse.next();
  }

  // Buat Supabase client di proxy untuk memeriksa sesi dari cookie
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const rawUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!rawUrl || !publishableKey) {
    // Jika env belum diisi, izinkan request lanjut (akan error di halaman)
    return response;
  }

  let url = rawUrl.trim();
  try {
    url = new URL(url).origin;
  } catch {
    // Gunakan nilai asli
  }

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};

