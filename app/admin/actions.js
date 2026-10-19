"use server";

import { redirect } from "next/navigation";
import { buatClientAdmin } from "@/lib/supabase/admin";

/**
 * Server Action untuk memproses login admin menggunakan Supabase Auth.
 */
export async function masukAdmin(formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    redirect(
      "/admin/login?error=" +
        encodeURIComponent("Email dan password wajib diisi.")
    );
  }

  let pesanError = null;

  try {
    const supabase = await buatClientAdmin();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(email).trim(),
      password: String(password),
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        pesanError = "Email atau password salah. Silakan coba lagi.";
      } else {
        pesanError = error.message;
      }
    }
  } catch (err) {
    pesanError = err?.message || "Terjadi kesalahan saat proses login.";
  }

  if (pesanError) {
    redirect("/admin/login?error=" + encodeURIComponent(pesanError));
  }

  redirect("/admin");
}

/**
 * Server Action untuk mengakhiri sesi admin lalu kembali ke halaman login.
 */
export async function keluarAdmin() {
  try {
    const supabase = await buatClientAdmin();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Gagal keluar:", err);
  }

  redirect("/admin/login");
}

/**
 * Server Action untuk mengganti password admin yang sedang login.
 */
export async function gantiPassword(formData) {
  const supabase = await buatClientAdmin();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const passwordBaru = formData.get("password_baru");
  const konfirmasiPassword = formData.get("konfirmasi_password");

  if (!passwordBaru || !konfirmasiPassword) {
    redirect(
      "/admin/password?error=" +
        encodeURIComponent("Semua kolom password wajib diisi.")
    );
  }

  if (String(passwordBaru).length < 8) {
    redirect(
      "/admin/password?error=" +
        encodeURIComponent("Password baru minimal 8 karakter.")
    );
  }

  if (passwordBaru !== konfirmasiPassword) {
    redirect(
      "/admin/password?error=" +
        encodeURIComponent(
          "Password baru dan konfirmasi password tidak sama."
        )
    );
  }

  let pesanError = null;

  try {
    const { error } = await supabase.auth.updateUser({
      password: String(passwordBaru),
    });

    if (error) {
      pesanError = error.message;
    }
  } catch (err) {
    pesanError = err?.message || "Terjadi kesalahan saat mengganti password.";
  }

  if (pesanError) {
    redirect("/admin/password?error=" + encodeURIComponent(pesanError));
  }

  redirect(
    "/admin/password?sukses=" +
      encodeURIComponent("Password berhasil diganti.")
  );
}
