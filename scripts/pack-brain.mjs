import {
  createCipheriv,
  createHash,
  randomBytes
} from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const input = resolve(process.argv[2] || "brain-index.json");
const outputDirectory = resolve(process.argv[3] || ".");

function decodeKey(value) {
  if (!value) return randomBytes(32);
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64");
}

function encodeKey(value) {
  return value.toString("base64url");
}

function encrypt(plaintext, key) {
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, nonce);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([Buffer.from("JBE1"), nonce, tag, ciphertext]);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

const key = decodeKey(process.env.JARVIS_BRAIN_KEY);
if (key.length !== 32) throw new Error("JARVIS_BRAIN_KEY trebuie să aibă 32 bytes.");

const index = JSON.parse(await readFile(input, "utf8"));
const dimensions = Number(index.dimensions);
if (!Number.isInteger(dimensions) || dimensions <= 0) {
  throw new Error("Dimensiunea indexului este invalidă.");
}

const vectors = Buffer.allocUnsafe(index.chunks.length * dimensions * 4);
const chunks = index.chunks.map((chunk, row) => {
  const vector = Buffer.from(chunk.embedding || "", "base64");
  if (vector.length !== dimensions * 4) {
    throw new Error(`Embedding invalid la rândul ${row}.`);
  }
  vector.copy(vectors, row * dimensions * 4);
  const { embedding: _embedding, ...metadata } = chunk;
  return metadata;
});

const metadata = gzipSync(
  Buffer.from(
    JSON.stringify({
      version: 1,
      sourceVersion: index.version,
      sourceSignature: index.sourceSignature,
      chunks
    })
  ),
  { level: 9 }
);
const encryptedMeta = encrypt(metadata, key);
const encryptedVectors = encrypt(vectors, key);

const metaFile = "brain-meta.enc";
const vectorsFile = "brain-vectors.enc";
await Promise.all([
  writeFile(resolve(outputDirectory, metaFile), encryptedMeta),
  writeFile(resolve(outputDirectory, vectorsFile), encryptedVectors)
]);

const manifest = {
  format: 1,
  cipher: "AES-256-GCM",
  compression: "gzip",
  embeddingModel: index.embeddingModel,
  dimensions,
  documents: index.documents.length,
  chunks: index.chunks.length,
  sourceUpdatedAt: index.updatedAt,
  packedAt: new Date().toISOString(),
  metaFile,
  vectorsFile,
  integrity: {
    [metaFile]: sha256(encryptedMeta),
    [vectorsFile]: sha256(encryptedVectors)
  },
  source: basename(input)
};
await writeFile(
  resolve(outputDirectory, "brain-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`
);

process.stdout.write(
  JSON.stringify({
    key: encodeKey(key),
    documents: manifest.documents,
    chunks: manifest.chunks,
    dimensions,
    metaBytes: encryptedMeta.length,
    vectorBytes: encryptedVectors.length
  })
);

