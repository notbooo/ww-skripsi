# Alat Pengumpulan Data — Skripsi Food Waste

Aplikasi web satu-pemakai untuk mengumpulkan data lapangan (wawancara + observasi + dokumentasi) tentang **pengelolaan food waste** di sebuah bar/restoran, lalu menyusunnya menjadi draft **BAB IV** memakai AI.

Inti kualitas bukan di aplikasinya — tapi di **prompt sintesis** (bisa diedit di menu *Atur*). Aplikasi hanya mengumpulkan data mentah; AI yang mengubahnya jadi prosa akademik.

## Jalankan lokal

```bash
npm install
npm run dev      # buka http://localhost:5173
npm run build    # build produksi (cek tipe + bundle)
```

## Set API key (wajib untuk sintesis)

1. Buat akun di [openrouter.ai](https://openrouter.ai), isi sedikit kredit, buat **API key berlimit kecil** (key disimpan di browser, bisa terlihat sisi klien — jangan pakai key utama).
2. Buka app → tab **Atur** → tempel key.
3. Model default: `google/gemini-3.1-flash-lite` (murah, ±$0.25/1jt token input). Tombol *Flash* untuk hasil lebih kuat tapi lebih mahal.

## Cara pakai di lapangan

- **Matriks** = 8 tahap daur hidup × 4 dimensi = 32 sel; **16 sel prioritas** (bertanda biru) yang menanggung argumen skripsi. Isi yang prioritas dulu.
- Tiap sel: ketik/**dikte** catatan apa adanya (campur Indonesia/Inggris tidak apa-apa). Tersimpan otomatis tiap ketikan.
- **Wawancara**: bank pertanyaan per informan (CHEF-A, MGR-B, STAFF-C, STEW-D). Dikte jawaban; otomatis mengisi sel matriks terkait.
- Foto **tetap di HP** — app hanya simpan nama file (auto: `S{sesi}-tahap-dimensi-n`). Atur nomor sesi di *Atur*. Upload semua foto ke Drive di akhir misi.
- **Sintesis**: pilih lingkup (BAB IV penuh / per tahap / per sel) → *Susun draft*. Hasil bisa disalin / diunduh `.md`/`.txt`. Tanda **⚠️ CATATAN PENGUMPULAN DATA** = AI menandai apa yang masih kurang dan harus dikumpulkan lagi (bukan bagian skripsi final).

## Keselamatan data (penting)

Data utama tersimpan di `localStorage` browser (offline-first — capture tetap jalan tanpa internet di bar). Dua lapis cadangan:

1. **Export .json** (*Atur → Cadangan data*) — backup manual tiap selesai sesi.
2. **Sinkronisasi Cloud (Supabase)** — opsional, cadangan otomatis + akses lintas perangkat.

### Setup Supabase (sekali, TANPA login/akun di app)

1. Buat project di [supabase.com](https://supabase.com) (free tier cukup).
2. **SQL Editor** → tempel SQL dari *Atur → "Setup sekali: SQL (tabel + fungsi, tanpa auth)"* (tombol Salin SQL ada di app) → **Run**. Membuat tabel `snapshots` yang terkunci RLS + 2 fungsi `SECURITY DEFINER` (`app_get`/`app_set`). Tidak perlu setting Auth apa pun.
3. **Project Settings → API**: salin **Project URL** dan **anon public key**.
4. Di app → *Atur → Sinkronisasi Cloud*: tempel URL + anon key, lalu **Buat key baru** (sync key). **Salin key** itu dan tempelkan di perangkat lain agar semua perangkat berbagi data yang sama.

Begitu URL + anon key + sync key terisi: perubahan tersinkron otomatis (debounce ~4 dtk, dan saat app ke background). Status terlihat di *Atur*. Offline = tetap tersimpan lokal, sinkron sendiri saat online. Tombol **Sinkron sekarang** / **Tarik dari cloud** untuk kontrol manual. Kalau cloud lebih baru tapi ada perubahan lokal belum tersinkron, app menanyakan mau pakai yang mana (last-write-wins, single user).

> **Keamanan tanpa auth:** tabel dikunci RLS (anon tidak bisa akses langsung / enumerasi). Akses hanya lewat fungsi `app_get`/`app_set` dengan **sync key persis**. Sync key = rahasia, perlakukan seperti password. Anon key sendiri memang dirancang publik di sisi klien.

Jangan andalkan satu HP saja untuk data skripsi — pakai minimal salah satu lapis cadangan (Export .json atau cloud).

## Deploy ke Vercel

Tidak butuh env var atau backend — semua (OpenRouter key, Supabase URL/anon key, sync key) diisi runtime lewat menu *Atur* di app yang sudah live. `vercel.json` sudah mengarahkan semua route ke `index.html` (SPA, deep-link aman).

**Cara tercepat — Vercel CLI:**

```bash
npm i -g vercel        # sekali
vercel login           # sekali, ikuti device-flow di browser
vercel --prod          # dari folder ini → dapat URL produksi
```

Vercel auto-detect Vite (build `npm run build`, output `dist`). Tidak ada yang perlu di-set lagi.

**Alternatif — Dashboard:** push folder ini ke GitHub → [vercel.com/new](https://vercel.com/new) → Import → framework *Vite* (kebaca otomatis) → Deploy.

> Produksi sudah diverifikasi lokal: `npm run build` lalu `npm run preview` — root & deep-link (`/cell/pengadaan:penyebab`) sama-sama jalan.

## Stack

Vite · React 18 · TypeScript (strict) · React Router · Zustand (persist) · Tailwind. Tanpa backend; sintesis memanggil OpenRouter langsung dari browser (CORS diizinkan).
