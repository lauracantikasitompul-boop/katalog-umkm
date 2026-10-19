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

