import { createClient } from "@supabase/supabase-js";

/**
 * Membuat koneksi Supabase di sisi server untuk pengunjung
 * menggunakan SUPABASE_URL dan SUPABASE_SECRET_KEY dari environment variable.
 * Kunci rahasia melewati RLS sehingga aman digunakan untuk membaca katalog dan detail produk.
 */
export function buatClientServer() {
  const rawUrl = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!rawUrl || !secretKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_SECRET_KEY belum diisi di environment variable."
    );
  }

  // Normalisasi URL untuk memastikan base URL valid (tanpa path ekstra seperti /rest/v1)
  let url = rawUrl.trim();
  try {
    url = new URL(url).origin;
  } catch {
    // Gunakan nilai asli jika parsing URL gagal
  }

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

