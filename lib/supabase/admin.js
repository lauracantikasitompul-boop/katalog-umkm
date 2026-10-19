import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Membuat koneksi sesi admin menggunakan SUPABASE_PUBLISHABLE_KEY dan cookie browser (@supabase/ssr).
 * Digunakan untuk login, keluar, ganti password, dan aksi pengubahan produk yang menjaga sesi admin.
 */
export async function buatClientAdmin() {
  const cookieStore = await cookies();

  const rawUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!rawUrl || !publishableKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_PUBLISHABLE_KEY belum diisi di environment variable."
    );
  }

  // Normalisasi URL untuk memastikan base URL valid
  let url = rawUrl.trim();
  try {
    url = new URL(url).origin;
  } catch {
    // Gunakan nilai asli jika parsing gagal
  }

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ditangani saat dipanggil dari konteks Server Component
        }
      },
    },
  });
}

