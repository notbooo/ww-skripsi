// Interview question banks (semi-structured). Most questions link to a matrix
// cell so an answer auto-advances that cell's status and feeds synthesis.
// Questions WITHOUT a cellId are cross-cutting (informant profile, persepsi,
// harapan) — they feed a "Profil & Konteks Informan" section in synthesis,
// which a skripsi BAB IV needs for deskripsi informan + analisis persepsi.
// Bahasa Indonesia, open-ended, voice-dictation friendly, with light probes.

export interface Informant {
  id: string;
  code: string; // anonymised code used in BAB IV (e.g. CHEF-A)
  role: string;
}

export interface Question {
  id: string;
  informantId: string;
  text: string;
  cellId?: string; // matrix cell this answer feeds; omit = context/profile
}

export const INFORMANTS: Informant[] = [
  { id: "chef", code: "CHEF-A", role: "Kepala Dapur / Head Chef" },
  { id: "owner", code: "MGR-B", role: "Pemilik / Manajer" },
  { id: "staff", code: "STAFF-C", role: "Staf Dapur / Prep" },
  { id: "stew", code: "STEW-D", role: "Steward / Staf Bar (pembuangan)" },
];

export const QUESTIONS: Question[] = [
  // ===== CHEF-A — kitchen authority: storage, prep, cooking =====
  {
    id: "chef-p1",
    informantId: "chef",
    text: "Boleh ceritakan posisi Bapak/Ibu di sini dan sudah berapa lama bekerja di dunia dapur?",
  },
  {
    id: "chef-p2",
    informantId: "chef",
    text: "Sehari-hari, apa saja tanggung jawab utama Bapak/Ibu, terutama yang berhubungan dengan bahan makanan?",
  },
  {
    id: "chef-1",
    informantId: "chef",
    text: "Coba ceritakan, dari bahan datang sampai jadi menu, tahap mana yang paling sering bikin bahan kebuang?",
    cellId: "pengolahan:penyebab",
  },
  {
    id: "chef-2",
    informantId: "chef",
    text: "Untuk penyimpanan — daging, ayam, sayur — berapa lama biasanya tahan di chiller/freezer, dan gimana cara rotasinya?",
    cellId: "penyimpanan:praktik",
  },
  {
    id: "chef-3",
    informantId: "chef",
    text: "Bahan apa yang paling sering rusak duluan sebelum sempat dipakai? Kenapa bisa gitu?",
    cellId: "penyimpanan:penyebab",
  },
  {
    id: "chef-8",
    informantId: "chef",
    text: "Kapasitas dan kondisi chiller/freezer memadai untuk kebutuhan? Pernah penuh atau mati listrik sampai bahan rusak?",
    cellId: "penyimpanan:penyebab",
  },
  {
    id: "chef-10",
    informantId: "chef",
    text: "Untuk mencegah bahan rusak di penyimpanan, ada teknik yang dipakai (labeling tanggal, FIFO, par stock, vakum)? Yang benar-benar jalan yang mana?",
    cellId: "penyimpanan:pengelolaan",
  },
  {
    id: "chef-4",
    informantId: "chef",
    text: "Pas prep — trimming, kupas, potong — bagian yang dibuang itu kira-kira seberapa banyak dari bahan?",
    cellId: "persiapan:volume",
  },
  {
    id: "chef-6",
    informantId: "chef",
    text: "Trimming dan potongan sisa prep itu langsung dibuang atau ada yang dimanfaatkan (kaldu, staff meal)?",
    cellId: "persiapan:penyebab",
  },
  {
    id: "chef-11",
    informantId: "chef",
    text: "Banyaknya prep/produksi harian ditentukan dari apa — reservasi, perkiraan, atau pengalaman? Kalau ramai/sepi meleset, bahannya gimana?",
    cellId: "pengolahan:penyebab",
  },
  {
    id: "chef-5",
    informantId: "chef",
    text: "Kalau masak kebanyakan / pesanan batal, sisa masakannya diapakan?",
    cellId: "pengolahan:volume",
  },
  {
    id: "chef-12",
    informantId: "chef",
    text: "Kalau ada makanan matang berlebih tapi masih layak, biasanya diapakan? (staff meal, disimpan, dijual diskon, atau dibuang?)",
    cellId: "pengolahan:pengelolaan",
  },
  {
    id: "chef-7",
    informantId: "chef",
    text: "Seberapa besar pengaruh permintaan dapur ke jumlah bahan yang dibeli? Pernah minta/stok kebanyakan lalu sisa?",
    cellId: "pengadaan:penyebab",
  },
  {
    id: "chef-9",
    informantId: "chef",
    text: "Ukuran porsi tiap menu pakai standar/timbangan atau perkiraan? Menu mana yang porsinya cenderung kebesaran?",
    cellId: "penyajian:penyebab",
  },
  {
    id: "chef-13",
    informantId: "chef",
    text: "Menurut Bapak/Ibu, makanan/bahan terbuang di sini termasuk masalah serius atau masih wajar? Kenapa?",
  },
  {
    id: "chef-14",
    informantId: "chef",
    text: "Kalau boleh mengubah satu hal untuk mengurangi bahan terbuang, apa yang paling Bapak/Ibu inginkan?",
  },

  // ===== MGR-B — procurement, policy, money, current management =====
  {
    id: "owner-p1",
    informantId: "owner",
    text: "Boleh diceritakan peran Bapak/Ibu di usaha ini dan sudah berjalan berapa lama?",
  },
  {
    id: "owner-p2",
    informantId: "owner",
    text: "Keputusan apa saja soal pembelian bahan, menu, dan operasional yang ada di tangan Bapak/Ibu?",
  },
  {
    id: "owner-1",
    informantId: "owner",
    text: "Cara menentukan jumlah belanja bahan tiap kali order — based on apa? Pernah kelebihan stok?",
    cellId: "pengadaan:penyebab",
  },
  {
    id: "owner-6",
    informantId: "owner",
    text: "Belanja bahan ditentukan harian/mingguan? Apa yang paling memengaruhi jumlahnya — reservasi, hari ramai, atau minimum order supplier?",
    cellId: "pengadaan:penyebab",
  },
  {
    id: "owner-7",
    informantId: "owner",
    text: "Ada perencanaan menu atau perkiraan penjualan yang dipakai sebelum belanja? Menu yang lambat laku, bahannya biasanya bagaimana?",
    cellId: "pengadaan:praktik",
  },
  {
    id: "owner-5",
    informantId: "owner",
    text: "Ada usaha mengurangi waste yang sudah dilakukan sejauh ini? Berhasil atau tidak?",
    cellId: "penyimpanan:pengelolaan",
  },
  {
    id: "owner-2",
    informantId: "owner",
    text: "Ada kebijakan / aturan tertulis soal food waste di tempat ini? Atau lebih ke kebiasaan?",
    cellId: "pembuangan:praktik",
  },
  {
    id: "owner-10",
    informantId: "owner",
    text: "Ada SOP tertulis dan pelatihan soal penanganan bahan & sisa? Dijalankan konsisten oleh tim?",
    cellId: "pembuangan:praktik",
  },
  {
    id: "owner-4",
    informantId: "owner",
    text: "Pernah hitung kerugian dari bahan yang kebuang? Kira-kira berapa nilainya per minggu/bulan?",
    cellId: "pembuangan:volume",
  },
  {
    id: "owner-9",
    informantId: "owner",
    text: "Kira-kira kerugian dari bahan terbuang seberapa besar terhadap biaya operasional? Sudah dicatat/dihitung atau belum?",
    cellId: "pembuangan:volume",
  },
  {
    id: "owner-3",
    informantId: "owner",
    text: "Sampah makanan akhirnya ke mana? Dibuang ke TPS, diambil pihak ketiga, dikasih ke orang/ternak, atau dikompos?",
    cellId: "pembuangan:pengelolaan",
  },
  {
    id: "owner-8",
    informantId: "owner",
    text: "Sisa makanan/bahan pernah atau berencana disumbangkan, diberi ke peternak, atau dikompos? Apa yang menghambat?",
    cellId: "pembuangan:pengelolaan",
  },
  {
    id: "owner-11",
    informantId: "owner",
    text: "Ke depan, ada rencana atau harapan untuk menekan food waste di sini? Butuh dukungan apa?",
  },

  // ===== STAFF-C — daily reality on the line, receiving, plate returns =====
  {
    id: "staff-p1",
    informantId: "staff",
    text: "Posisi kamu di sini apa, dan sudah berapa lama? Sehari-hari pegang bagian apa?",
  },
  {
    id: "staff-5",
    informantId: "staff",
    text: "Pas terima barang, gimana cara ngecek kualitasnya? Ada yang ditimbang / dicatat?",
    cellId: "penerimaan:praktik",
  },
  {
    id: "staff-2",
    informantId: "staff",
    text: "Pas barang datang dari supplier, pernah ada yang ditolak / dikembalikan? Karena apa biasanya?",
    cellId: "penerimaan:penyebab",
  },
  {
    id: "staff-6",
    informantId: "staff",
    text: "Pas ambil/simpan bahan, sering nemu yang sudah rusak atau kelupaan kepakai? Biasanya kenapa bisa gitu?",
    cellId: "penyimpanan:penyebab",
  },
  {
    id: "staff-1",
    informantId: "staff",
    text: "Sehari-hari, bagian mana dari kerjaan kamu yang paling banyak ngebuang bahan?",
    cellId: "persiapan:penyebab",
  },
  {
    id: "staff-7",
    informantId: "staff",
    text: "Dari bahan yang kamu prep, kira-kira berapa banyak yang kebuang (kulit, batang, lemak)? Ada yang sebenarnya masih bisa dipakai?",
    cellId: "persiapan:volume",
  },
  {
    id: "staff-4",
    informantId: "staff",
    text: "Porsi yang keluar ke tamu itu ukurannya pas, kebanyakan, atau kekurangan menurut kamu?",
    cellId: "penyajian:penyebab",
  },
  {
    id: "staff-3",
    informantId: "staff",
    text: "Waktu beresin meja, piring tamu sering sisa banyak nggak? Menu apa yang paling sering disisain?",
    cellId: "konsumsi:volume",
  },
  {
    id: "staff-9",
    informantId: "staff",
    text: "Komponen apa yang paling sering disisakan tamu (nasi, lalapan, garnish, side)? Menurutmu kenapa?",
    cellId: "konsumsi:volume",
  },
  {
    id: "staff-8",
    informantId: "staff",
    text: "Sisa di piring tamu kamu lihat diapakan? Pernah ada yang masih utuh/banyak tapi tetap dibuang?",
    cellId: "konsumsi:pengelolaan",
  },
  {
    id: "staff-10",
    informantId: "staff",
    text: "Pernah dapat arahan/training soal mengurangi bahan terbuang? Menurut kamu apa yang bikin masih banyak yang kebuang?",
  },

  // ===== STEW-D — disposal end-of-night + the BAR/beverage side =====
  {
    id: "stew-p1",
    informantId: "stew",
    text: "Kamu pegang bagian apa di sini (cuci/steward/bar) dan sudah berapa lama?",
  },
  {
    id: "stew-4",
    informantId: "stew",
    text: "Ada makanan yang masih layak tapi tetap dibuang? Contohnya apa, kenapa harus dibuang?",
    cellId: "pengolahan:volume",
  },
  {
    id: "stew-8",
    informantId: "stew",
    text: "Es, garnish, atau bahan minuman yang disiapkan di awal shift sering kebuang di akhir kalau sepi?",
    cellId: "pengolahan:penyebab",
  },
  {
    id: "stew-6",
    informantId: "stew",
    text: "Di sisi bar, bahan apa yang paling sering terbuang? (jeruk nipis/lemon, mint, buah garnish, susu/krim, juice, simple syrup basi?)",
    cellId: "penyimpanan:penyebab",
  },
  {
    id: "stew-7",
    informantId: "stew",
    text: "Minuman/cocktail yang dibuang sering nggak? Karena salah bikin, tamu nggak habis, atau es/batch kebanyakan?",
    cellId: "konsumsi:volume",
  },
  {
    id: "stew-3",
    informantId: "stew",
    text: "Sisa makanan dari piring tamu — langsung masuk tempat sampah atau ada yang dipisah/dimanfaatkan?",
    cellId: "konsumsi:pengelolaan",
  },
  {
    id: "stew-1",
    informantId: "stew",
    text: "Tiap tutup, sampah makanan kira-kira berapa kantong/ember? Isinya kebanyakan apa?",
    cellId: "pembuangan:volume",
  },
  {
    id: "stew-2",
    informantId: "stew",
    text: "Sampah makanan dipisah dari sampah lain nggak? Prosesnya gimana sampai keluar dari sini?",
    cellId: "pembuangan:praktik",
  },
  {
    id: "stew-9",
    informantId: "stew",
    text: "Sampah organik dipisah dari plastik/kaca? Ada yang ditimbang atau dicatat sebelum dibuang?",
    cellId: "pembuangan:praktik",
  },
  {
    id: "stew-5",
    informantId: "stew",
    text: "Setelah dikumpulkan, sampah makanan dibawa ke mana / diambil siapa? Ada yang dipisah untuk diberikan ke orang atau ternak?",
    cellId: "pembuangan:pengelolaan",
  },
  {
    id: "stew-10",
    informantId: "stew",
    text: "Menurut kamu, yang paling banyak terbuang di tempat ini apa, dan kenapa masih sering kebuang?",
  },
];

export const QUESTIONS_BY_INFORMANT: Record<string, Question[]> =
  INFORMANTS.reduce((acc, inf) => {
    acc[inf.id] = QUESTIONS.filter((q) => q.informantId === inf.id);
    return acc;
  }, {} as Record<string, Question[]>);

export const QUESTIONS_BY_CELL: Record<string, Question[]> = QUESTIONS.reduce(
  (acc, q) => {
    if (!q.cellId) return acc; // context/profile questions feed no cell
    (acc[q.cellId] ||= []).push(q);
    return acc;
  },
  {} as Record<string, Question[]>
);

// Cross-cutting questions (profile / persepsi / harapan) — fed to synthesis
// as a leading "Profil & Konteks Informan" block.
export const CONTEXT_QUESTIONS: Question[] = QUESTIONS.filter((q) => !q.cellId);

export const INFORMANT_BY_ID: Record<string, Informant> = Object.fromEntries(
  INFORMANTS.map((i) => [i.id, i])
);
