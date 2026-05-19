import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import AutoTextarea from "../components/AutoTextarea";
import {
  INFORMANTS,
  INFORMANT_BY_ID,
  QUESTIONS_BY_INFORMANT,
} from "../data/interviews";
import { cellTitle } from "../data/model";
import { useStore } from "../store/useStore";

export default function InterviewPage() {
  const { informantId } = useParams();
  const nav = useNavigate();
  const answers = useStore((s) => s.answers);
  const setAnswer = useStore((s) => s.setAnswer);

  if (!informantId) {
    return (
      <Layout title="Wawancara">
        <p className="mb-4 text-[14px] text-ink-dim">
          Pilih informan. Dikte jawabannya — nanti dirapikan otomatis saat
          sintesis.
        </p>
        <ul className="space-y-3">
          {INFORMANTS.map((inf) => {
            const qs = QUESTIONS_BY_INFORMANT[inf.id];
            const answered = qs.filter((q) => answers[q.id]?.trim()).length;
            return (
              <li key={inf.id}>
                <Link
                  to={`/interview/${inf.id}`}
                  className="flex min-h-[64px] items-center gap-3 rounded-2xl border border-line bg-raised px-4 py-3"
                >
                  <span className="rounded-lg bg-accent/15 px-2.5 py-1 text-[13px] font-semibold text-accent">
                    {inf.code}
                  </span>
                  <span className="flex-1">
                    <span className="block text-[16px] text-ink">
                      {inf.role}
                    </span>
                    <span className="block text-[12px] text-ink-dim">
                      {answered}/{qs.length} pertanyaan terjawab
                    </span>
                  </span>
                  <span className="text-ink-dim" aria-hidden>
                    ›
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Layout>
    );
  }

  const inf = INFORMANT_BY_ID[informantId];
  if (!inf) {
    return (
      <Layout title="Informan tidak ditemukan">
        <Link to="/interview" className="text-accent underline">
          Kembali ke daftar informan
        </Link>
      </Layout>
    );
  }
  const qs = QUESTIONS_BY_INFORMANT[informantId];

  return (
    <Layout
      title={`${inf.code} · ${inf.role}`}
      back={
        <button
          onClick={() => nav("/interview")}
          className="-ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-ink-dim active:bg-panel"
          aria-label="Kembali"
        >
          ‹
        </button>
      }
    >
      <p className="mb-4 text-[13px] text-ink-dim">
        Tiap jawaban tersimpan otomatis & mengisi sel matriks terkait.
      </p>
      <ol className="space-y-5">
        {qs.map((q, i) => (
          <li key={q.id}>
            <div className="mb-2 flex items-baseline gap-2">
              <span className="text-[14px] font-semibold text-ink-dim">
                {i + 1}.
              </span>
              <p className="flex-1 text-[16px] leading-snug text-ink">
                {q.text}
              </p>
            </div>
            <AutoTextarea
              value={answers[q.id] ?? ""}
              onChange={(v) => setAnswer(q.id, v)}
              minRows={4}
              ariaLabel={`Jawaban pertanyaan ${i + 1}`}
              placeholder="Dikte jawaban informan apa adanya…"
            />
            {q.cellId ? (
              <Link
                to={`/cell/${q.cellId}`}
                className="mt-1.5 inline-block text-[12px] text-ink-dim underline"
              >
                → mengisi sel: {cellTitle(q.cellId)}
              </Link>
            ) : (
              <span className="mt-1.5 inline-block text-[12px] text-ink-dim/70">
                Profil / konteks (untuk deskripsi informan & pembahasan)
              </span>
            )}
          </li>
        ))}
      </ol>
      <div className="h-6" />
    </Layout>
  );
}
