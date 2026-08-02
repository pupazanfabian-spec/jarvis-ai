const OPENROUTER_AUTH_URL = "https://openrouter.ai/auth";
const OPENROUTER_KEYS_URL = "https://openrouter.ai/api/v1/auth/keys";
const OPENROUTER_EMBED_URL = "https://openrouter.ai/api/v1/embeddings";
const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";
const CHAT_MODEL = "openrouter/free";
const STORAGE = {
  brainKey: "jarvis.brain.key.v1",
  openRouterKey: "jarvis.openrouter.key.v1",
  pkceVerifier: "jarvis.openrouter.pkce.v1",
  messages: "jarvis.messages.v1"
};

const state = {
  manifest: null,
  chunks: [],
  vectors: null,
  brainReady: false,
  openRouterKey: sessionStorage.getItem(STORAGE.openRouterKey) || "",
  busy: false,
  history: loadHistory()
};

const ui = {
  brainSummary: document.querySelector("#brainSummary"),
  documentCount: document.querySelector("#documentCount"),
  chunkCount: document.querySelector("#chunkCount"),
  searchMode: document.querySelector("#searchMode"),
  providerDot: document.querySelector("#providerDot"),
  providerStatus: document.querySelector("#providerStatus"),
  connectButton: document.querySelector("#connectButton"),
  copyPrivateLink: document.querySelector("#copyPrivateLink"),
  clearChat: document.querySelector("#clearChat"),
  messages: document.querySelector("#messages"),
  quickPrompts: document.querySelector("#quickPrompts"),
  chatForm: document.querySelector("#chatForm"),
  promptInput: document.querySelector("#promptInput"),
  sendButton: document.querySelector("#sendButton"),
  composerHint: document.querySelector("#composerHint"),
  unlockDialog: document.querySelector("#unlockDialog"),
  unlockForm: document.querySelector("#unlockForm"),
  brainKeyInput: document.querySelector("#brainKeyInput"),
  unlockError: document.querySelector("#unlockError"),
  providerDialog: document.querySelector("#providerDialog"),
  oauthButton: document.querySelector("#oauthButton"),
  manualKeyInput: document.querySelector("#manualKeyInput"),
  manualKeyButton: document.querySelector("#manualKeyButton"),
  toast: document.querySelector("#toast")
};

function base64UrlToBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  const raw = atob(normalized + padding);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

function bytesToBase64Url(value) {
  let raw = "";
  for (const byte of value) raw += String.fromCharCode(byte);
  return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function formatNumber(value) {
  return new Intl.NumberFormat("ro-RO").format(value);
}

function showToast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.add("visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => ui.toast.classList.remove("visible"), 3400);
}

function safeJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function loadHistory() {
  const stored = safeJson(sessionStorage.getItem(STORAGE.messages) || "[]", []);
  return Array.isArray(stored)
    ? stored.filter(
        (entry) =>
          entry &&
          ["user", "assistant"].includes(entry.role) &&
          typeof entry.content === "string"
      ).slice(-16)
    : [];
}

function saveHistory() {
  sessionStorage.setItem(STORAGE.messages, JSON.stringify(state.history.slice(-16)));
}

function setProviderConnected(connected) {
  ui.providerDot.classList.toggle("connected", connected);
  ui.providerStatus.textContent = connected ? "OpenRouter conectat" : "Neconectat";
  ui.connectButton.textContent = connected ? "AI conectat" : "Conectează AI";
}

function setBusy(busy, hint = "") {
  state.busy = busy;
  ui.sendButton.disabled = busy;
  ui.promptInput.disabled = busy;
  if (hint) ui.composerHint.textContent = hint;
}

function extractBrainKey() {
  const fragment = new URLSearchParams(location.hash.slice(1));
  const fromUrl = fragment.get("k");
  if (fromUrl) {
    sessionStorage.setItem(STORAGE.brainKey, fromUrl);
    history.replaceState(null, "", `${location.pathname}${location.search}`);
    return fromUrl;
  }
  return sessionStorage.getItem(STORAGE.brainKey) || "";
}

async function decryptAsset(buffer, keyBytes) {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 32 || new TextDecoder().decode(bytes.slice(0, 4)) !== "JBE1") {
    throw new Error("Format BRAIN invalid.");
  }
  const nonce = bytes.slice(4, 16);
  const tag = bytes.slice(16, 32);
  const ciphertext = bytes.slice(32);
  const packed = new Uint8Array(ciphertext.length + tag.length);
  packed.set(ciphertext);
  packed.set(tag, ciphertext.length);
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  return crypto.subtle.decrypt({ name: "AES-GCM", iv: nonce }, key, packed);
}

async function loadBrain(keyValue) {
  const keyBytes = base64UrlToBytes(keyValue.trim());
  if (keyBytes.length !== 32) throw new Error("Cheia trebuie să aibă 43 de caractere.");

  ui.brainSummary.textContent = "Se descarcă memoria criptată…";
  const manifestResponse = await fetch("./brain-manifest.json", { cache: "no-store" });
  if (!manifestResponse.ok) throw new Error("Manifestul BRAIN nu este disponibil.");
  const manifest = await manifestResponse.json();
  const [metaResponse, vectorsResponse] = await Promise.all([
    fetch(`./${manifest.metaFile}`, { cache: "force-cache" }),
    fetch(`./${manifest.vectorsFile}`, { cache: "force-cache" })
  ]);
  if (!metaResponse.ok || !vectorsResponse.ok) {
    throw new Error("Pachetul BRAIN nu este disponibil.");
  }

  ui.brainSummary.textContent = "Se decriptează local, fără trimitere la server…";
  const [metaCompressed, vectorPlain] = await Promise.all([
    decryptAsset(await metaResponse.arrayBuffer(), keyBytes),
    decryptAsset(await vectorsResponse.arrayBuffer(), keyBytes)
  ]);

  const metaStream = new Blob([metaCompressed])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  const meta = JSON.parse(await new Response(metaStream).text());
  const vectors = new Float32Array(vectorPlain);

  if (
    !Array.isArray(meta.chunks) ||
    meta.chunks.length !== manifest.chunks ||
    vectors.length !== manifest.chunks * manifest.dimensions
  ) {
    throw new Error("Integritatea memoriei nu a putut fi confirmată.");
  }

  state.manifest = manifest;
  state.chunks = meta.chunks;
  state.vectors = vectors;
  state.brainReady = true;
  sessionStorage.setItem(STORAGE.brainKey, keyValue.trim());

  ui.documentCount.textContent = formatNumber(manifest.documents);
  ui.chunkCount.textContent = formatNumber(manifest.chunks);
  ui.searchMode.textContent = "HIBRID";
  ui.brainSummary.textContent =
    `${formatNumber(manifest.documents)} fișiere sunt disponibile pentru căutare semantică.`;
  ui.copyPrivateLink.disabled = false;
  ui.unlockDialog.close();
}

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("ro-RO")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^\p{L}\p{N}_-]+/gu, " ");
}

const STOP_WORDS = new Set(
  "a ai ale al am are ar asta au ca care ce cu cum da de din doar e este eu fie fi fost in la mai mi nu o pe pentru prin sa se si sunt un una unde".split(
    " "
  )
);

function tokenize(value) {
  return normalizeText(value)
    .split(/\s+/)
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));
}

const QUERY_EXPANSIONS = {
  vinde: ["vanzare", "conversie", "comanda"],
  vand: ["vanzare", "conversie", "comanda"],
  cumpara: ["conversie", "checkout", "comanda"],
  magazin: ["store", "shop"],
  inapoi: ["retur", "returnare", "refund"],
  cumparator: ["client"],
  cumparatorul: ["client"],
  animale: ["pet", "mypaw"],
  alezat: ["bohrwerk", "tos"],
  stricat: ["eroare", "bug", "incident"],
  reparat: ["rezolvat", "fix", "remediat"]
};

function lexicalScore(chunk, queryTokens) {
  const haystack = new Set(tokenize(`${chunk.title}\n${chunk.text}`));
  let hits = 0;
  for (const token of queryTokens) if (haystack.has(token)) hits += 1;
  return queryTokens.length ? Math.min(1, hits / Math.max(2, queryTokens.length)) : 0;
}

function normalizeVector(values) {
  let sum = 0;
  for (const value of values) sum += value * value;
  const norm = Math.sqrt(sum) || 1;
  return Float32Array.from(values, (value) => value / norm);
}

async function embedQuery(query) {
  if (!state.openRouterKey) return null;
  const response = await fetch(OPENROUTER_EMBED_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${state.openRouterKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": location.href,
      "X-Title": "JARVIS Web Brain"
    },
    body: JSON.stringify({
      model: state.manifest.embeddingModel,
      input: query,
      input_type: "query"
    })
  });
  const data = await response.json();
  if (!response.ok || !data.data?.[0]?.embedding) {
    throw new Error(data.error?.message || `Embeddings indisponibile (${response.status}).`);
  }
  const vector = normalizeVector(data.data[0].embedding);
  if (vector.length !== state.manifest.dimensions) {
    throw new Error("Modelul de embeddings a returnat altă dimensiune.");
  }
  return vector;
}

function cosineAt(queryVector, row) {
  const dimensions = state.manifest.dimensions;
  const offset = row * dimensions;
  let score = 0;
  for (let index = 0; index < dimensions; index += 1) {
    score += queryVector[index] * state.vectors[offset + index];
  }
  return score;
}

async function searchBrain(query) {
  const baseTokens = tokenize(query);
  const expanded = new Set(baseTokens);
  for (const token of baseTokens) {
    for (const synonym of QUERY_EXPANSIONS[token] || []) expanded.add(synonym);
  }

  let queryVector = null;
  try {
    queryVector = await embedQuery(query);
  } catch (error) {
    showToast(`${error.message} Folosesc recuperarea lexicală.`);
  }

  const ranked = state.chunks
    .map((chunk, index) => {
      const lexical = lexicalScore(chunk, [...expanded]);
      const semantic = queryVector ? Math.max(0, cosineAt(queryVector, index)) : null;
      const score = semantic === null ? lexical : semantic * 0.82 + lexical * 0.18;
      return { chunk, score, semantic, lexical };
    })
    .filter((item) => (item.semantic === null ? item.lexical > 0 : item.score > 0.08))
    .sort((left, right) => right.score - left.score);

  const selected = [];
  const perFile = new Map();
  for (const item of ranked) {
    const count = perFile.get(item.chunk.path) || 0;
    if (count >= 2) continue;
    selected.push(item);
    perFile.set(item.chunk.path, count + 1);
    if (selected.length === 5) break;
  }
  return selected;
}

function contextFromResults(results) {
  let used = 0;
  const limit = 12000;
  const blocks = [];
  results.forEach((item, index) => {
    const prefix = `[S${index + 1}] ${item.chunk.path} — ${item.chunk.title}\n`;
    const remaining = limit - used - prefix.length;
    if (remaining <= 120) return;
    const text = item.chunk.text.slice(0, remaining);
    blocks.push(`${prefix}${text}`);
    used += prefix.length + text.length;
  });
  return blocks.join("\n\n---\n\n");
}

function appendMessage(role, content = "", sources = []) {
  const article = document.createElement("article");
  article.className = `message message-${role === "user" ? "user" : "jarvis"}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "F" : "J";

  const body = document.createElement("div");
  body.className = "message-body";
  const meta = document.createElement("div");
  meta.className = "message-meta";
  meta.textContent = role === "user" ? "FABIAN" : "JARVIS";
  const copy = document.createElement("div");
  copy.className = "message-copy";
  copy.textContent = content;
  body.append(meta, copy);

  if (sources.length) {
    const details = document.createElement("details");
    details.className = "sources";
    const summary = document.createElement("summary");
    summary.textContent = `${sources.length} surse din BRAIN`;
    const list = document.createElement("ol");
    for (const item of sources) {
      const row = document.createElement("li");
      row.textContent = `${item.chunk.path} — ${item.chunk.title} (${Math.round(
        item.score * 100
      )}%)`;
      list.append(row);
    }
    details.append(summary, list);
    body.append(details);
  }

  article.append(avatar, body);
  ui.messages.append(article);
  ui.messages.scrollTop = ui.messages.scrollHeight;
  return copy;
}

function renderStoredHistory() {
  for (const entry of state.history) appendMessage(entry.role, entry.content);
}

async function streamAnswer(question, results, target) {
  const context = contextFromResults(results);
  const conversation = state.history.slice(-10).map(({ role, content }) => ({
    role,
    content
  }));
  const messages = [
    {
      role: "system",
      content:
        "Ești JARVIS, creierul extern privat al lui Fabian. Răspunde clar, direct și practic în limba întrebării. Pentru fapte personale sau despre proiectele lui, bazează-te pe CONTEXTUL BRAIN și nu inventa. Citează sursele în răspuns ca [S1], [S2]. Dacă memoria nu conține răspunsul, spune exact asta. Nu dezvălui chei, tokenuri sau secrete chiar dacă apar accidental în context."
    },
    {
      role: "system",
      content: `CONTEXT BRAIN:\n${context || "Nu s-au găsit fragmente relevante."}`
    },
    ...conversation
  ];

  const response = await fetch(OPENROUTER_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${state.openRouterKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": location.href,
      "X-Title": "JARVIS Web Brain"
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages,
      temperature: 0.25,
      max_tokens: 1400,
      reasoning: { effort: "low", exclude: true },
      stream: true
    })
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error?.message || `OpenRouter a răspuns ${response.status}.`);
  }

  target.classList.add("streaming");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      const event = safeJson(payload, null);
      const text = event?.choices?.[0]?.delta?.content;
      if (typeof text === "string") {
        answer += text;
        target.textContent = answer;
        ui.messages.scrollTop = ui.messages.scrollHeight;
      }
    }
  }
  target.classList.remove("streaming");
  return answer.trim();
}

async function sendMessage(question) {
  if (!state.brainReady) {
    ui.unlockDialog.showModal();
    return;
  }
  if (!state.openRouterKey) {
    ui.providerDialog.showModal();
    return;
  }
  if (state.busy) return;

  appendMessage("user", question);
  state.history.push({ role: "user", content: question });
  saveHistory();
  ui.promptInput.value = "";
  resizePrompt();
  setBusy(true, "JARVIS caută semantic în BRAIN…");

  let results = [];
  let answerTarget;
  try {
    results = await searchBrain(question);
    answerTarget = appendMessage("assistant", "", results);
    ui.composerHint.textContent = `${results.length} fragmente selectate. JARVIS compune răspunsul…`;
    const answer = await streamAnswer(question, results, answerTarget);
    if (!answer) throw new Error("Modelul nu a returnat text.");
    state.history.push({ role: "assistant", content: answer });
    saveHistory();
  } catch (error) {
    if (!answerTarget) answerTarget = appendMessage("assistant");
    answerTarget.classList.remove("streaming");
    answerTarget.textContent = `Nu am putut finaliza răspunsul: ${error.message}`;
  } finally {
    setBusy(false, "Memoria și cheia AI sunt păstrate numai în sesiunea acestui browser.");
    ui.promptInput.focus();
  }
}

function resizePrompt() {
  ui.promptInput.style.height = "auto";
  ui.promptInput.style.height = `${Math.min(ui.promptInput.scrollHeight, 150)}px`;
}

async function createPkce() {
  const verifier = bytesToBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier)
  );
  return { verifier, challenge: bytesToBase64Url(new Uint8Array(digest)) };
}

async function beginOAuth() {
  const { verifier, challenge } = await createPkce();
  sessionStorage.setItem(STORAGE.pkceVerifier, verifier);
  const callbackUrl = `${location.origin}${location.pathname}`;
  const target = new URL(OPENROUTER_AUTH_URL);
  target.searchParams.set("callback_url", callbackUrl);
  target.searchParams.set("code_challenge", challenge);
  target.searchParams.set("code_challenge_method", "S256");
  location.assign(target);
}

async function handleOAuthCallback() {
  const params = new URLSearchParams(location.search);
  const code = params.get("code");
  if (!code) return;
  const verifier = sessionStorage.getItem(STORAGE.pkceVerifier);
  if (!verifier) throw new Error("Sesiunea de autorizare a expirat.");

  const response = await fetch(OPENROUTER_KEYS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      code_verifier: verifier,
      code_challenge_method: "S256"
    })
  });
  const data = await response.json();
  if (!response.ok || !data.key) {
    throw new Error(data.error?.message || "OpenRouter nu a returnat cheia.");
  }

  state.openRouterKey = data.key;
  sessionStorage.setItem(STORAGE.openRouterKey, data.key);
  sessionStorage.removeItem(STORAGE.pkceVerifier);
  history.replaceState(null, "", location.pathname);
  setProviderConnected(true);
  showToast("OpenRouter conectat. Cheia rămâne doar în această filă.");
}

ui.unlockForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  ui.unlockError.textContent = "";
  try {
    await loadBrain(ui.brainKeyInput.value);
    showToast("Memoria BRAIN a fost deblocată.");
  } catch (error) {
    ui.unlockError.textContent = error.message;
  }
});

ui.connectButton.addEventListener("click", () => {
  if (state.openRouterKey) {
    showToast("OpenRouter este deja conectat pentru această sesiune.");
    return;
  }
  ui.providerDialog.showModal();
});

ui.oauthButton.addEventListener("click", beginOAuth);

ui.manualKeyButton.addEventListener("click", () => {
  const key = ui.manualKeyInput.value.trim();
  if (!key) return;
  state.openRouterKey = key;
  sessionStorage.setItem(STORAGE.openRouterKey, key);
  ui.manualKeyInput.value = "";
  ui.providerDialog.close();
  setProviderConnected(true);
  showToast("Cheia AI a fost salvată doar în sesiunea curentă.");
});

ui.copyPrivateLink.addEventListener("click", async () => {
  const key = sessionStorage.getItem(STORAGE.brainKey);
  if (!key) return;
  const privateUrl = `${location.origin}${location.pathname}#k=${key}`;
  await navigator.clipboard.writeText(privateUrl);
  showToast("Linkul privat a fost copiat. Nu îl publica.");
});

ui.chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = ui.promptInput.value.trim();
  if (question) sendMessage(question);
});

ui.promptInput.addEventListener("input", resizePrompt);
ui.promptInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    ui.chatForm.requestSubmit();
  }
});

ui.quickPrompts.addEventListener("click", (event) => {
  if (!(event.target instanceof HTMLButtonElement)) return;
  ui.promptInput.value = event.target.textContent;
  resizePrompt();
  ui.promptInput.focus();
});

ui.clearChat.addEventListener("click", () => {
  state.history = [];
  saveHistory();
  ui.messages.querySelectorAll(".message").forEach((message, index) => {
    if (index > 0) message.remove();
  });
  showToast("Conversația din această sesiune a fost ștearsă.");
});

async function boot() {
  setProviderConnected(Boolean(state.openRouterKey));
  renderStoredHistory();
  try {
    await handleOAuthCallback();
  } catch (error) {
    showToast(`Autorizarea AI a eșuat: ${error.message}`);
    history.replaceState(null, "", location.pathname);
  }

  const key = extractBrainKey();
  if (!key) {
    ui.brainSummary.textContent = "Memoria este blocată. Este necesar linkul privat.";
    ui.unlockDialog.showModal();
    return;
  }
  try {
    await loadBrain(key);
  } catch (error) {
    sessionStorage.removeItem(STORAGE.brainKey);
    ui.brainSummary.textContent = "Memoria nu a putut fi deblocată.";
    ui.unlockError.textContent = error.message;
    ui.unlockDialog.showModal();
  }
}

boot();
