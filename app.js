const OPENROUTER_AUTH_URL = "https://openrouter.ai/auth";
const OPENROUTER_KEYS_URL = "https://openrouter.ai/api/v1/auth/keys";
const OPENROUTER_EMBED_URL = "https://openrouter.ai/api/v1/embeddings";
const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";
const CHAT_MODEL = "openrouter/free";
const STORAGE = {
  brainKey: "jarvis.brain.key.v1",
  rememberedBrainKey: "jarvis.brain.key.remember.v1",
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
  forgetDeviceKey: document.querySelector("#forgetDeviceKey"),
  forgetSavedKey: document.querySelector("#forgetSavedKey"),
  rememberDeviceKey: document.querySelector("#rememberDeviceKey"),
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
  rememberBrainKey: document.querySelector("#rememberBrainKey"),
  unlockError: document.querySelector("#unlockError"),
  providerDialog: document.querySelector("#providerDialog"),
  oauthButton: document.querySelector("#oauthButton"),
  manualKeyInput: document.querySelector("#manualKeyInput"),
  manualKeyButton: document.querySelector("#manualKeyButton"),
  toast: document.querySelector("#toast")
};

function syncRememberControls(remembered) {
  ui.rememberBrainKey.checked = remembered;
  ui.rememberDeviceKey.checked = remembered;
}

// „Uită cheia" trebuie să fie disponibil ori de câte ori există ceva de uitat — mai ales
// când cheia memorată nu mai descuie pachetul (rotație de cheie, pachet republicat).
// Altfel utilizatorul rămâne blocat la fiecare pornire, fără cale de ieșire din interfață.
function refreshForgetAvailability() {
  const cheieSalvata = Boolean(localStorage.getItem(STORAGE.rememberedBrainKey));
  const areCeva =
    cheieSalvata || Boolean(sessionStorage.getItem(STORAGE.brainKey)) || state.brainReady;
  ui.forgetDeviceKey.disabled = !areCeva;
  // Când deblocarea eșuează, dialogul modal acoperă panoul de stare, deci butonul de acolo
  // nu poate fi apăsat. Fără o cale de ieșire chiar din dialog, o cheie salvată care nu mai
  // descuie pachetul ar bloca aplicația la fiecare pornire.
  ui.forgetSavedKey.hidden = !cheieSalvata;
}

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
  // Tăiem și în memorie, nu doar la scriere: altfel, într-o filă ținută deschisă mult timp,
  // state.history creștea nelimitat, chiar dacă în sessionStorage ajungeau doar 16 intrări.
  if (state.history.length > 16) state.history = state.history.slice(-16);
  sessionStorage.setItem(STORAGE.messages, JSON.stringify(state.history));
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
    sessionStorage.setItem(STORAGE.brainKey, fromUrl.trim());
    history.replaceState(null, "", `${location.pathname}${location.search}`);
    return fromUrl.trim();
  }

  const fromSession = sessionStorage.getItem(STORAGE.brainKey);
  if (fromSession) return fromSession;

  const remembered = localStorage.getItem(STORAGE.rememberedBrainKey) || "";
  if (remembered) {
    sessionStorage.setItem(STORAGE.brainKey, remembered);
    syncRememberControls(true);
  }
  return remembered;
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
  if (ui.rememberBrainKey.checked) {
    localStorage.setItem(STORAGE.rememberedBrainKey, keyValue.trim());
  } else {
    localStorage.removeItem(STORAGE.rememberedBrainKey);
  }
  syncRememberControls(Boolean(localStorage.getItem(STORAGE.rememberedBrainKey)));
  ui.rememberDeviceKey.disabled = false;

  ui.documentCount.textContent = formatNumber(manifest.documents);
  ui.chunkCount.textContent = formatNumber(manifest.chunks);
  ui.searchMode.textContent = "HIBRID";
  ui.brainSummary.textContent =
    `${formatNumber(manifest.documents)} fișiere sunt disponibile pentru căutare semantică.`;
  ui.copyPrivateLink.disabled = false;
  refreshForgetAvailability();
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

function excerptFromChunk(text, limit = 200) {
  // Fiecare fragment începe cu un antet „Source:" / „Section:" care repetă calea și titlul
  // deja afișate deasupra. Fără el, extrasul arată conținutul real al notiței.
  // Ancorat la începutul textului, nu pe fiecare linie: altfel o linie legitimă din notiță
  // care începe cu „Source:" ar dispărea din extras.
  const body = String(text || "").replace(/^(?:[ \t]*(?:Source|Section):[^\n]*\n?)+/i, "");
  // Notele din vault încep cu frontmatter YAML („tip:", „actualizat:", „tags:"). Pentru cine
  // citește extrasul, acelea sunt zgomot: vrea primul rând de conținut, nu metadatele.
  const faraFrontmatter = body.replace(/^\s*---\r?\n[\s\S]*?\r?\n---[ \t]*\r?\n?/, "");
  const normalized = (faraFrontmatter.trim() ? faraFrontmatter : body)
    .replace(/\s+/g, " ")
    .trim();
  const characters = Array.from(normalized);
  if (characters.length <= limit) return normalized;

  const candidate = characters.slice(0, limit + 1).join("");
  const boundary = candidate.lastIndexOf(" ");
  const excerpt =
    boundary > 0
      ? candidate.slice(0, boundary)
      : characters.slice(0, limit).join("");
  return `${excerpt.trimEnd()}…`;
}

async function copyText(value, button, confirmation = "Copiat") {
  try {
    await navigator.clipboard.writeText(value);
    // Reținem eticheta o singură dată. Altfel, la a doua apăsare rapidă, „precedenta" era
    // deja „Copiat", iar butonul rămânea blocat pe confirmare fără să mai revină.
    if (button.dataset.label === undefined) button.dataset.label = button.textContent;
    const previous = button.dataset.label;
    button.textContent = confirmation;
    button.classList.add("copied");
    clearTimeout(button.copyTimer);
    button.copyTimer = setTimeout(() => {
      button.textContent = previous;
      button.classList.remove("copied");
    }, 1400);
  } catch {
    showToast("Textul nu a putut fi copiat.");
  }
}

function appendInlineMarkdown(parent, value) {
  const pattern =
    /(`[^`\n]+`|\[([^\]\n]+)\]\(([^)\s]+)\)|\*\*([^*\n]+)\*\*|__([^_\n]+)__|\*([^*\n]+)\*|_([^_\n]+)_)/g;
  let cursor = 0;

  for (const match of value.matchAll(pattern)) {
    if (match.index > cursor) {
      parent.append(document.createTextNode(value.slice(cursor, match.index)));
    }

    const token = match[0];
    if (token.startsWith("`")) {
      const code = document.createElement("code");
      code.textContent = token.slice(1, -1);
      parent.append(code);
    } else if (token.startsWith("[")) {
      let url = null;
      try {
        const candidate = new URL(match[3]);
        if (["http:", "https:"].includes(candidate.protocol)) url = candidate;
      } catch {
        url = null;
      }

      if (url) {
        const link = document.createElement("a");
        link.href = url.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        appendInlineMarkdown(link, match[2]);
        parent.append(link);
      } else {
        parent.append(document.createTextNode(token));
      }
    } else if (token.startsWith("**") || token.startsWith("__")) {
      const strong = document.createElement("strong");
      appendInlineMarkdown(strong, match[4] || match[5]);
      parent.append(strong);
    } else {
      const emphasis = document.createElement("em");
      appendInlineMarkdown(emphasis, match[6] || match[7]);
      parent.append(emphasis);
    }

    cursor = match.index + token.length;
  }

  if (cursor < value.length) {
    parent.append(document.createTextNode(value.slice(cursor)));
  }
}

function isMarkdownBlockStart(line) {
  return (
    /^```/.test(line) ||
    /^#{2,3}\s+/.test(line) ||
    /^\s*(?:[-*_]\s*){3,}$/.test(line) ||
    /^>\s?/.test(line) ||
    /^\s*[-+*]\s+/.test(line) ||
    /^\s*\d+[.)]\s+/.test(line)
  );
}

function createCodeBlock(codeText, language) {
  const wrapper = document.createElement("div");
  wrapper.className = "code-block";

  const toolbar = document.createElement("div");
  toolbar.className = "code-toolbar";
  const label = document.createElement("span");
  label.textContent = language || "cod";
  const button = document.createElement("button");
  button.className = "code-copy";
  button.type = "button";
  button.textContent = "Copiază";
  button.setAttribute("aria-label", "Copiază blocul de cod");
  button.addEventListener("click", () => copyText(codeText, button));
  toolbar.append(label, button);

  const pre = document.createElement("pre");
  const code = document.createElement("code");
  if (language) code.dataset.language = language;
  code.textContent = codeText;
  pre.append(code);
  wrapper.append(toolbar, pre);
  return wrapper;
}

function renderMarkdown(target, markdown) {
  const fragment = document.createDocumentFragment();
  const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(/^```([\w+-]*)\s*$/);
    if (fence) {
      const codeLines = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test(lines[index])) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      fragment.append(createCodeBlock(codeLines.join("\n"), fence[1]));
      continue;
    }

    const heading = line.match(/^(##|###)\s+(.+)$/);
    if (heading) {
      const element = document.createElement(heading[1] === "##" ? "h3" : "h4");
      appendInlineMarkdown(element, heading[2]);
      fragment.append(element);
      index += 1;
      continue;
    }

    if (/^\s*(?:[-*_]\s*){3,}$/.test(line)) {
      fragment.append(document.createElement("hr"));
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      const quote = document.createElement("blockquote");
      appendInlineMarkdown(quote, quoteLines.join(" "));
      fragment.append(quote);
      continue;
    }

    const unordered = line.match(/^\s*[-+*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      const list = document.createElement(unordered ? "ul" : "ol");
      const itemPattern = unordered ? /^\s*[-+*]\s+(.+)$/ : /^\s*\d+[.)]\s+(.+)$/;
      while (index < lines.length) {
        const itemMatch = lines[index].match(itemPattern);
        if (!itemMatch) break;
        const item = document.createElement("li");
        appendInlineMarkdown(item, itemMatch[1]);
        list.append(item);
        index += 1;
      }
      fragment.append(list);
      continue;
    }

    const paragraphLines = [line];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !isMarkdownBlockStart(lines[index])
    ) {
      paragraphLines.push(lines[index]);
      index += 1;
    }
    const paragraph = document.createElement("p");
    appendInlineMarkdown(paragraph, paragraphLines.join(" "));
    fragment.append(paragraph);
  }

  target.replaceChildren(fragment);
}

function setAssistantContent(target, content) {
  // Anulăm orice randare programată: altfel un tact rămas în așteptare de la stream ar putea
  // rescrie peste conținutul setat aici (de exemplu peste mesajul de eroare).
  clearTimeout(target.renderTimer);
  target.renderTimer = null;
  delete target.dataset.pendingMarkdown;
  target.dataset.markdown = content;
  renderMarkdown(target, content);
}

// În timpul streamului, fiecare fragment primit ar declanșa o reparsare completă a întregului
// răspuns: cost pătratic și DOM reconstruit de zeci de ori. Limităm la o randare la ~90 ms,
// păstrând mereu ultimul text primit. Randarea finală se face explicit, ca nimic să nu rămână
// nedesenat dacă streamul se termină între două tacte.
function scheduleAssistantContent(target, content) {
  target.dataset.markdown = content;
  target.dataset.pendingMarkdown = content;
  if (target.renderTimer) return;
  const deseneaza = () => {
    target.renderTimer = null;
    const text = target.dataset.pendingMarkdown;
    if (text === undefined) return;
    delete target.dataset.pendingMarkdown;
    renderMarkdown(target, text);
    ui.messages.scrollTop = ui.messages.scrollHeight;
  };
  deseneaza();
  target.renderTimer = setTimeout(deseneaza, 90);
}

function flushAssistantContent(target) {
  clearTimeout(target.renderTimer);
  target.renderTimer = null;
  const text = target.dataset.pendingMarkdown;
  if (text === undefined) return;
  delete target.dataset.pendingMarkdown;
  renderMarkdown(target, text);
}

function addAssistantActions(body, content) {
  const actions = document.createElement("div");
  actions.className = "assistant-actions";

  const time = document.createElement("time");
  time.className = "message-time";
  time.dateTime = new Date().toISOString();
  time.textContent = new Intl.DateTimeFormat("ro-RO", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());

  const button = document.createElement("button");
  button.className = "message-copy-button";
  button.type = "button";
  button.textContent = "Copiază răspunsul";
  button.addEventListener("click", () => {
    const messageCopy = body.querySelector(".message-copy");
    copyText(messageCopy?.dataset.markdown || content, button);
  });

  actions.append(time, button);
  body.append(actions);
}

function addConnectAction(messageCopy) {
  const body = messageCopy.closest(".message-body");
  if (!body || body.querySelector(".message-connect")) return;

  const actions = document.createElement("div");
  actions.className = "message-actions";
  const button = document.createElement("button");
  button.className = "text-button message-connect";
  button.type = "button";
  button.textContent = "Conectează OpenRouter pentru un răspuns compus";
  button.addEventListener("click", () => {
    if (!ui.providerDialog.open) ui.providerDialog.showModal();
  });
  actions.append(button);
  body.append(actions);
}

function appendMessage(role, content = "", sources = [], options = {}) {
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
  if (role === "user") {
    copy.textContent = content;
  } else {
    setAssistantContent(copy, content);
  }
  body.append(meta, copy);

  if (sources.length) {
    const details = document.createElement("details");
    details.className = "sources";
    details.open = Boolean(options.openSources);
    const summary = document.createElement("summary");
    summary.textContent = `${sources.length} surse din BRAIN`;
    const list = document.createElement("ol");
    for (const item of sources) {
      const row = document.createElement("li");
      const sourceMeta = document.createElement("div");
      sourceMeta.className = "source-meta";
      const sourcePath = document.createElement("span");
      sourcePath.className = "source-path";
      sourcePath.textContent = item.chunk.path;
      const sourceTitle = document.createElement("strong");
      sourceTitle.className = "source-title";
      sourceTitle.textContent = item.chunk.title;
      const sourceScore = document.createElement("span");
      sourceScore.className = "source-score";
      sourceScore.textContent = `${Math.round(item.score * 100)}%`;
      sourceScore.setAttribute(
        "aria-label",
        `Scor de relevanță ${Math.round(item.score * 100)}%`
      );
      sourceMeta.append(sourcePath, sourceTitle, sourceScore);
      const excerpt = document.createElement("div");
      excerpt.className = "source-excerpt";
      excerpt.textContent = excerptFromChunk(item.chunk.text);
      row.append(sourceMeta, excerpt);
      list.append(row);
    }
    details.append(summary, list);
    body.append(details);
  }

  if (role !== "user") addAssistantActions(body, content);
  if (options.showConnect) addConnectAction(copy);

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
  target.closest(".message-body")?.classList.add("streaming-message");
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
        scheduleAssistantContent(target, answer);
      }
    }
  }
  flushAssistantContent(target);
  target.classList.remove("streaming");
  target.closest(".message-body")?.classList.remove("streaming-message");
  return answer.trim();
}

async function sendMessage(question) {
  if (!state.brainReady) {
    ui.unlockDialog.showModal();
    return;
  }
  if (state.busy) return;

  const hasAiConnection = Boolean(state.openRouterKey);
  appendMessage("user", question);
  state.history.push({ role: "user", content: question });
  saveHistory();
  ui.promptInput.value = "";
  resizePrompt();
  setBusy(
    true,
    hasAiConnection
      ? "JARVIS caută semantic în BRAIN…"
      : "JARVIS caută local în BRAIN…"
  );

  let results = [];
  let answerTarget;
  try {
    results = await searchBrain(question);

    if (!hasAiConnection) {
      const localMessage = results.length
        ? "Am căutat local în notițele tale, fără AI conectat. Fragmentele relevante sunt afișate mai jos. Conectează OpenRouter dacă vrei și un răspuns compus."
        : "Am căutat local în notițele tale, fără AI conectat, dar nu am găsit fragmente relevante. Conectează OpenRouter dacă vrei și un răspuns compus.";
      appendMessage("assistant", localMessage, results, {
        openSources: true,
        showConnect: true
      });
      state.history.push({ role: "assistant", content: localMessage });
      saveHistory();
      return;
    }

    answerTarget = appendMessage("assistant", "", results);
    ui.composerHint.textContent = `${results.length} fragmente selectate. JARVIS compune răspunsul…`;
    const answer = await streamAnswer(question, results, answerTarget);
    if (!answer) throw new Error("Modelul nu a returnat text.");
    state.history.push({ role: "assistant", content: answer });
    saveHistory();
  } catch (error) {
    if (!answerTarget) answerTarget = appendMessage("assistant");
    answerTarget.classList.remove("streaming");
    answerTarget.closest(".message-body")?.classList.remove("streaming-message");
    const failureMessage = results.length
      ? `Conectarea AI a eșuat: ${error.message} Fragmentele găsite local rămân disponibile mai jos.`
      : `Conectarea AI a eșuat: ${error.message} Nu am găsit nici fragmente locale relevante.`;
    setAssistantContent(answerTarget, failureMessage);
    // Salvăm și eșecul în istoric: altfel, după reîncărcare, întrebarea apărea fără niciun
    // răspuns, iar cererea următoare pornea cu o conversație aparent incompletă.
    state.history.push({ role: "assistant", content: failureMessage });
    saveHistory();
    const sources = answerTarget
      .closest(".message-body")
      ?.querySelector(".sources");
    if (sources) sources.open = true;
    addConnectAction(answerTarget);
  } finally {
    setBusy(
      false,
      "Memoria și cheia AI sunt păstrate numai în sesiunea acestui browser."
    );
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

ui.rememberBrainKey.addEventListener("change", () => {
  ui.rememberDeviceKey.checked = ui.rememberBrainKey.checked;
  // Debifarea trebuie să aibă efect imediat asupra a ceea ce e deja salvat, altfel
  // controalele ar arăta „nu ține minte" în timp ce cheia e încă pe dispozitiv.
  if (!ui.rememberBrainKey.checked) {
    localStorage.removeItem(STORAGE.rememberedBrainKey);
    refreshForgetAvailability();
  }
});

ui.rememberDeviceKey.addEventListener("change", () => {
  if (!state.brainReady) return;

  const key = sessionStorage.getItem(STORAGE.brainKey);
  if (ui.rememberDeviceKey.checked && key) {
    localStorage.setItem(STORAGE.rememberedBrainKey, key);
    syncRememberControls(true);
    showToast("Cheia va fi păstrată pe acest dispozitiv.");
  } else {
    localStorage.removeItem(STORAGE.rememberedBrainKey);
    syncRememberControls(false);
    showToast("Cheia nu mai este păstrată pe acest dispozitiv.");
  }
  refreshForgetAvailability();
});

ui.forgetSavedKey.addEventListener("click", () => {
  localStorage.removeItem(STORAGE.rememberedBrainKey);
  sessionStorage.removeItem(STORAGE.brainKey);
  syncRememberControls(false);
  ui.brainKeyInput.value = "";
  ui.unlockError.textContent = "";
  refreshForgetAvailability();
  showToast("Cheia salvată a fost ștearsă de pe acest dispozitiv.");
});

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
  const key =
    sessionStorage.getItem(STORAGE.brainKey) ||
    localStorage.getItem(STORAGE.rememberedBrainKey);
  if (!key) return;
  const privateUrl = `${location.origin}${location.pathname}#k=${key}`;
  await navigator.clipboard.writeText(privateUrl);
  showToast("Linkul privat a fost copiat. Nu îl publica.");
});

ui.forgetDeviceKey.addEventListener("click", () => {
  sessionStorage.removeItem(STORAGE.brainKey);
  sessionStorage.removeItem(STORAGE.openRouterKey);
  sessionStorage.removeItem(STORAGE.pkceVerifier);
  sessionStorage.removeItem(STORAGE.messages);
  localStorage.removeItem(STORAGE.rememberedBrainKey);

  state.manifest = null;
  state.chunks = [];
  state.vectors = null;
  state.brainReady = false;
  state.openRouterKey = "";
  state.history = [];

  ui.brainKeyInput.value = "";
  syncRememberControls(false);
  ui.rememberDeviceKey.disabled = true;
  ui.unlockError.textContent = "";
  ui.documentCount.textContent = "—";
  ui.chunkCount.textContent = "—";
  ui.searchMode.textContent = "BLOCAT";
  ui.brainSummary.textContent = "Memoria este blocată. Este necesar linkul privat.";
  ui.copyPrivateLink.disabled = true;
  refreshForgetAvailability();
  setProviderConnected(false);

  ui.messages.querySelectorAll(".message").forEach((message, index) => {
    if (index > 0) message.remove();
  });

  if (!ui.unlockDialog.open) ui.unlockDialog.showModal();
  showToast("Cheia și istoricul au fost uitate de pe acest dispozitiv.");
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

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("./sw.js");
  } catch (error) {
    console.warn("Service worker-ul nu a putut fi înregistrat.", error);
  }
}

async function boot() {
  syncRememberControls(
    Boolean(localStorage.getItem(STORAGE.rememberedBrainKey))
  );
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
    refreshForgetAvailability();
    ui.unlockDialog.showModal();
    return;
  }
  try {
    await loadBrain(key);
  } catch (error) {
    sessionStorage.removeItem(STORAGE.brainKey);
    // Butonul rămâne disponibil chiar și aici: dacă cheia memorată nu mai descuie
    // pachetul, ea trebuie să poată fi ștearsă, altfel fiecare pornire o reîncearcă.
    refreshForgetAvailability();
    ui.brainSummary.textContent = "Memoria nu a putut fi deblocată.";
    ui.unlockError.textContent = error.message;
    ui.unlockDialog.showModal();
  }
}

// Linkul privat lipit într-o filă deja deschisă schimbă doar fragmentul, iar browserul
// nu reîncarcă documentul — fără asta, nu s-ar întâmpla nimic vizibil.
window.addEventListener("hashchange", async () => {
  const fragment = new URLSearchParams(location.hash.slice(1));
  if (!fragment.get("k")) return;

  const key = extractBrainKey();
  if (!key) return;
  try {
    await loadBrain(key);
    showToast("Memoria BRAIN a fost deblocată.");
  } catch (error) {
    sessionStorage.removeItem(STORAGE.brainKey);
    ui.unlockError.textContent = error.message;
    if (!ui.unlockDialog.open) ui.unlockDialog.showModal();
  }
});

registerServiceWorker();
boot();
