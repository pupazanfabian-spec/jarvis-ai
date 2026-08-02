import {
  createDecipheriv,
  createHash
} from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { gunzipSync } from "node:zlib";

function decodeKey(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64");
}

function decrypt(packed, key) {
  if (packed.subarray(0, 4).toString() !== "JBE1") {
    throw new Error("Magic invalid.");
  }
  const nonce = packed.subarray(4, 16);
  const tag = packed.subarray(16, 32);
  const ciphertext = packed.subarray(32);
  const decipher = createDecipheriv("aes-256-gcm", key, nonce);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

const directory = resolve(process.argv[2] || ".");
const key = decodeKey(process.env.JARVIS_BRAIN_KEY || "");
if (key.length !== 32) throw new Error("JARVIS_BRAIN_KEY lipsește.");

const manifest = JSON.parse(
  await readFile(resolve(directory, "brain-manifest.json"), "utf8")
);
const [metaPacked, vectorPacked] = await Promise.all([
  readFile(resolve(directory, manifest.metaFile)),
  readFile(resolve(directory, manifest.vectorsFile))
]);
if (
  sha256(metaPacked) !== manifest.integrity[manifest.metaFile] ||
  sha256(vectorPacked) !== manifest.integrity[manifest.vectorsFile]
) {
  throw new Error("Hash ciphertext invalid.");
}

const metadata = JSON.parse(gunzipSync(decrypt(metaPacked, key)).toString("utf8"));
const vectors = decrypt(vectorPacked, key);
const expectedVectorBytes = manifest.chunks * manifest.dimensions * 4;
if (
  metadata.chunks.length !== manifest.chunks ||
  vectors.length !== expectedVectorBytes
) {
  throw new Error("Dimensiuni interne invalide.");
}

process.stdout.write(
  JSON.stringify({
    ok: true,
    documents: manifest.documents,
    chunks: metadata.chunks.length,
    dimensions: manifest.dimensions,
    vectorBytes: vectors.length
  })
);

