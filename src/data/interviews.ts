// Interview question banks. Each question links to a matrix cell so that
// typing an answer auto-advances that cell's status. Questions are in
// Bahasa Indonesia, open-ended, phrased to be answered out loud (the brother
// dictates the informant's reply via the phone voice keyboard).

export interface Informant {
  id: string;
  code: string; // anonymised code used in BAB IV (e.g. CHEF-A)
  role: string;
}

export interface Question {
  id: string;
  informantId: string;
  text: string;
  cellId: string; // which matrix cell this answer feeds
}

export const INFORMANTS: Informant[] = [
  { id: "chef", code: "CHEF-A", role: "Kepala Dapur / Head Chef" },
  { id: "owner", code: "MGR-B", role: "Pemilik / Manajer" },
  { id: "staff", code: "STAFF-C", role: "Staf Dapur / Prep" },
  { id: "stew", code: "STEW-D", role: "Steward / Staf Bar (pembuangan)" },
];

export const QUESTIONS: Question[] = [
  // CHEF-A — kitchen authority: storage, prep, cooking
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
    id: "chef-4",
    informantId: "chef",
    text: "Pas prep — trimming, kupas, potong — bagian yang dibuang itu kira-kira seberapa banyak dari bahan?",
    cellId: "persiapan:volume",
  },
  {
    id: "chef-5",
    informantId: "chef",
    text: "Kalau masak kebanyakan / pesanan batal, sisa masakannya diapakan?",
    cellId: "pengolahan:volume",
  },
  {
    id: "chef-6",
    informantId: "chef",
    text: "Trimming dan potongan sisa prep itu langsung dibuang atau ada yang dimanfaatkan (kaldu, staff meal)?",
    cellId: "persiapan:penyebab",
  },

  // MGR-B — procurement, policy, current management decisions
  {
    id: "owner-1",
    informantId: "owner",
    text: "Cara menentukan jumlah belanja bahan tiap kali order — based on apa? Pernah kelebihan stok?",
    cellId: "pengadaan:penyebab",
  },
  {
    id: "owner-2",
    informantId: "owner",
    text: "Ada kebijakan / aturan tertulis soal food waste di tempat ini? Atau lebih ke kebiasaan?",
    cellId: "pembuangan:praktik",
  },
  {
    id: "owner-3",
    informantId: "owner",
    text: "Sampah makanan akhirnya ke mana? Dibuang ke TPS, diambil pihak ketiga, dikasih ke orang/ternak, atau dikompos?",
    cellId: "pembuangan:pengelolaan",
  },
  {
    id: "owner-4",
    informantId: "owner",
    text: "Pernah hitung kerugian dari bahan yang kebuang? Kira-kira berapa nilainya per minggu/bulan?",
    cellId: "pembuangan:volume",
  },
  {
    id: "owner-5",
    informantId: "owner",
    text: "Ada usaha mengurangi waste yang sudah dilakukan sejauh ini? Berhasil atau tidak?",
    cellId: "penyimpanan:pengelolaan",
  },

  // STAFF-C — daily reality on the line, plate returns
  {
    id: "staff-1",
    informantId: "staff",
    text: "Sehari-hari, bagian mana dari kerjaan kamu yang paling banyak ngebuang bahan?",
    cellId: "persiapan:penyebab",
  },
  {
    id: "staff-2",
    informantId: "staff",
    text: "Pas barang datang dari supplier, pernah ada yang ditolak / dikembalikan? Karena apa biasanya?",
    cellId: "penerimaan:penyebab",
  },
  {
    id: "staff-3",
    informantId: "staff",
    text: "Waktu beresin meja, piring tamu sering sisa banyak nggak? Menu apa yang paling sering disisain?",
    cellId: "konsumsi:volume",
  },
  {
    id: "staff-4",
    informantId: "staff",
    text: "Porsi yang keluar ke tamu itu ukurannya pas, kebanyakan, atau kekurangan menurut kamu?",
    cellId: "penyajian:penyebab",
  },
  {
    id: "staff-5",
    informantId: "staff",
    text: "Pas terima barang, gimana cara ngecek kualitasnya? Ada yang ditimbang / dicatat?",
    cellId: "penerimaan:praktik",
  },

  // STEW-D — what physically gets thrown, end-of-night
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
    id: "stew-3",
    informantId: "stew",
    text: "Sisa makanan dari piring tamu — langsung masuk tempat sampah atau ada yang dipisah/dimanfaatkan?",
    cellId: "konsumsi:pengelolaan",
  },
  {
    id: "stew-4",
    informantId: "stew",
    text: "Ada makanan yang masih layak tapi tetap dibuang? Contohnya apa, kenapa harus dibuang?",
    cellId: "pengolahan:volume",
  },
];

export const QUESTIONS_BY_INFORMANT: Record<string, Question[]> =
  INFORMANTS.reduce((acc, inf) => {
    acc[inf.id] = QUESTIONS.filter((q) => q.informantId === inf.id);
    return acc;
  }, {} as Record<string, Question[]>);

export const QUESTIONS_BY_CELL: Record<string, Question[]> = QUESTIONS.reduce(
  (acc, q) => {
    (acc[q.cellId] ||= []).push(q);
    return acc;
  },
  {} as Record<string, Question[]>
);

export const INFORMANT_BY_ID: Record<string, Informant> = Object.fromEntries(
  INFORMANTS.map((i) => [i.id, i])
);
