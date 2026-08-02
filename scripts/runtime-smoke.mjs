import { createDecipheriv } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { gunzipSync } from "node:zlib";

function decodeKey(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64");
}

function decrypt(packed, key) {
  const nonce = packed.subarray(4, 16);
  const tag = packed.subarray(16, 32);
  const decipher = createDecipheriv("aes-256-gcm", key, nonce);
  decipher.setAuthTag(tag);
  return Buffer.concat([
    decipher.update(packed.subarray(32)),
    decipher.final()
  ]);
}

function normalize(values) {
  let sum = 0;
  for (const value of values) sum += value * value;
  const norm = Math.sqrt(sum) || 1;
  return Float32Array.from(values, (value) => value / norm);
}

function cosine(query, vectors, row, dimensions) {
  const offset = row * dimensions;
  let score = 0;
  for (let index = 0; index < dimensions; index += 1) {
    score += query[index] * vectors[offset + index];
  }
  return score;
}

const directory = resolve(process.argv[2] || ".");
const brainKey = decodeKey(process.env.JARVIS_BRAIN_KEY || "");
const apiKey = process.env.OPENROUTER_API_KEY || "";
if (brainKey.length !== 32 || !apiKey) throw new Error("Cheile de test lipsesc.");

const manifest = JSON.parse(
  await readFile(resolve(directory, "brain-manifest.json"), "utf8")
);
const [metaPacked, vectorPacked] = await Promise.all([
  readFile(resolve(directory, manifest.metaFile)),
  readFile(resolve(directory, manifest.vectorsFile))
]);
const meta = JSON.parse(
  gunzipSync(decrypt(metaPacked, brainKey)).toString("utf8")
);
const vectorBuffer = decrypt(vectorPacked, brainKey);
const vectors = new Float32Array(
  vectorBuffer.buffer,
  vectorBuffer.byteOffset,
  vectorBuffer.byteLength / 4
);
const headers = {
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
  "HTTP-Referer": "https://pupazanfabian-spec.github.io/jarvis-ai/",
  "X-Title": "JARVIS Web Brain"
};

const question = "Care sunt problemele mele deschise?";
const embeddingStarted = performance.now();
const embeddingResponse = await fetch(
  "https://openrouter.ai/api/v1/embeddings",
  {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: manifest.embeddingModel,
      input: question,
      input_type: "query"
    })
  }
);
const embeddingData = await embeddingResponse.json();
if (!embeddingResponse.ok || !embeddingData.data?.[0]?.embedding) {
  throw new Error(
    embeddingData.error?.message || `Embedding ${embeddingResponse.status}`
  );
}
const query = normalize(embeddingData.data[0].embedding);
if (query.length !== manifest.dimensions) throw new Error("Dimensiune diferită.");
const embeddingMs = Math.round(performance.now() - embeddingStarted);

const ranked = meta.chunks
  .map((chunk, row) => ({
    chunk,
    score: cosine(query, vectors, row, manifest.dimensions)
  }))
  .sort((left, right) => right.score - left.score)
  .slice(0, 5);
const context = ranked
  .map(
    (item, index) =>
      `[S${index + 1}] ${item.chunk.path} — ${item.chunk.title}\n${item.chunk.text}`
  )
  .join("\n\n---\n\n")
  .slice(0, 12000);

const chatStarted = performance.now();
const chatResponse = await fetch(
  "https://openrouter.ai/api/v1/chat/completions",
  {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "openrouter/free",
      messages: [
        {
          role: "system",
          content:
            "Răspunde în română, pe baza contextului. Citează [S1]. Nu inventa."
        },
        { role: "system", content: `CONTEXT:\n${context}` },
        { role: "user", content: question }
      ],
      max_tokens: 800,
      temperature: 0.2,
      reasoning: { effort: "low", exclude: true }
    })
  }
);
const chatData = await chatResponse.json();
const answer = chatData.choices?.[0]?.message?.content;
if (!chatResponse.ok || typeof answer !== "string" || answer.length < 10) {
  throw new Error(chatData.error?.message || `Chat ${chatResponse.status}`);
}

process.stdout.write(
  JSON.stringify({
    ok: true,
    documents: manifest.documents,
    chunks: manifest.chunks,
    embeddingMs,
    searchTopPath: ranked[0]?.chunk.path,
    searchTopScore: Number(ranked[0]?.score.toFixed(4)),
    chatMs: Math.round(performance.now() - chatStarted),
    answerChars: answer.length,
    model: chatData.model || "openrouter/free"
  })
);
