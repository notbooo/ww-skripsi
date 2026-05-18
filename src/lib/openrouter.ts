// One-shot (non-streaming) synthesis via OpenRouter. Browser-safe: OpenRouter
// sends permissive CORS headers, so a direct fetch with Bearer auth works with
// no backend. The API key lives only in this browser's localStorage.

export const DEFAULT_MODEL = "google/gemini-3.1-flash-lite";
export const FALLBACK_MODEL = "google/gemini-3-flash-preview";

export async function callOpenRouter(
  apiKey: string,
  systemPrompt: string,
  userContent: string,
  model: string = DEFAULT_MODEL
): Promise<string> {
  if (!apiKey.trim()) {
    throw new Error(
      "API key OpenRouter belum diisi. Buka Pengaturan untuk menambahkannya."
    );
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "Skripsi Food Waste Tool",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.2,
      max_tokens: 4096,
      stream: false,
    }),
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      detail = (await res.json())?.error?.message || detail;
    } catch {
      /* keep statusText */
    }
    throw new Error(`OpenRouter ${res.status}: ${detail}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("OpenRouter mengembalikan respons kosong. Coba lagi.");
  }
  return text;
}
