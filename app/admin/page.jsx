import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { buatClientServer } from "@/lib/supabase/server";

export default async function HalamanAdmin() {
  const supabase = buatClientServer();
  const { data, error } = await supabase.from('produk').select('*').order('id');
  const daftarProduk = data ?? [];

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      {error && <div className="text-red-500">Error fetching products: {error.message}</div>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        {/* US-08 (bonus): tambah produk */}
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>
      <TabelProduk daftarProduk={daftarProduk} />
    </div>
  );
}

