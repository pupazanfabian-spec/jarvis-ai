
// Motor de inferență logică — Jarvis poate deduce din ce știe, detecta contradicții
// și face raționamente în lanț: dacă A este B și B implică C → A are legătură cu C

export interface InferenceRule {
  subject: string;      // Subiectul ("fotosinteza")
  predicate: string;    // Predicatul ("este un proces biologic")
  confidence: number;   // 0-1
  source: 'user' | 'deduced' | 'document';
  addedAt: number;
}

export interface InferenceEngine {
  rules: InferenceRule[];
  contradictions: { original: string; correction: string; at: number }[];
}

export function createInferenceEngine(): InferenceEngine {
  return { rules: [], contradictions: [] };
}

function normInfer(t: string): string {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

// ─── Extrage reguli din propoziție ────────────────────────────────────────────

export function extractRulesFromFact(fact: string, source: InferenceRule['source'] = 'user'): InferenceRule[] {
  const n = normInfer(fact);
  const rules: InferenceRule[] = [];
  const now = Date.now();

  // "X este Y" / "X sunt Y"
  const isMatch = n.match(/^(.{3,40}?)\s+(?:este|sunt|e)\s+(.{3,100})$/);
  if (isMatch) {
    rules.push({
      subject: isMatch[1].trim(),
      predicate: `este ${isMatch[2].trim()}`,
      confidence: 0.9,
      source,
      addedAt: now,
    });
  }

  // "X are Y" / "X conține Y"
  const hasMatch = n.match(/^(.{3,40}?)\s+(?:are|contine|include|implica|presupune)\s+(.{3,100})$/);
  if (hasMatch) {
    rules.push({
      subject: hasMatch[1].trim(),
      predicate: `are ${hasMatch[2].trim()}`,
      confidence: 0.85,
      source,
      addedAt: now,
    });
  }

  // "X funcționează prin Y"
  const funcMatch = n.match(/^(.{3,40}?)\s+(?:functioneaza|lucreaza|opereaza)\s+(?:prin|cu|ca)\s+(.{3,100})$/);
  if (funcMatch) {
    rules.push({
      subject: funcMatch[1].trim(),
      predicate: `funcționează prin ${funcMatch[2].trim()}`,
      confidence: 0.8,
      source,
      addedAt: now,
    });
  }

  // "X poate Y"
  const canMatch = n.match(/^(.{3,40}?)\s+poate\s+(.{3,100})$/);
  if (canMatch) {
    rules.push({
      subject: canMatch[1].trim(),
      predicate: `poate ${canMatch[2].trim()}`,
      confidence: 0.75,
      source,
      addedAt: now,
    });
  }

  return rules;
}

// ─── Adaugă reguli în motor ───────────────────────────────────────────────────

export function addFact(engine: InferenceEngine, fact: string, source: InferenceRule['source'] = 'user'): void {
  const newRules = extractRulesFromFact(fact, source);
  for (const rule of newRules) {
    const exists = engine.rules.some(r =>
      r.subject === rule.subject && r.predicate === rule.predicate
    );
    if (!exists) {
      engine.rules.push(rule);
    }
  }
  // Maxim 500 reguli
  if (engine.rules.length > 500) {
    engine.rules = engine.rules.slice(-500);
  }
}

// ─── Detectează contradicție ──────────────────────────────────────────────────

export function detectContradiction(engine: InferenceEngine, newFact: string): string | null {
  const n = normInfer(newFact);

  // "X nu este Y" contradice o regulă "X este Y"
  const negMatch = n.match(/^(.{3,40}?)\s+nu\s+(?:este|sunt|are|poate)\s+(.{3,100})$/);
  if (negMatch) {
    const subj = negMatch[1].trim();
    const negated = negMatch[2].trim();
    const existing = engine.rules.find(r =>
      r.subject === subj && r.predicate.includes(negated)
    );
    if (existing) {
      engine.contradictions.push({
        original: `${existing.subject} ${existing.predicate}`,
        correction: newFact,
        at: Date.now(),
      });
      // Actualizează regula veche cu mai puțină certitudine
      existing.confidence = Math.max(0.1, existing.confidence - 0.4);
      return `Notez că aceasta contrazice ce înregistrasem: **"${existing.subject} ${existing.predicate}"**. Voi ține cont de corecție.`;
    }
  }
  return null;
}

// ─── Raționament în lanț ──────────────────────────────────────────────────────

export function chainReason(engine: InferenceEngine, subject: string): string[] {
  const n = normInfer(subject);
  const chain: string[] = [];

  // Reguli directe
  const direct = engine.rules
    .filter(r => r.subject === n || r.subject.includes(n) || n.includes(r.subject))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  for (const rule of direct) {
    chain.push(`${rule.subject} → ${rule.predicate}`);

    // Raționament de ord. 2: predicatul regulii = subiect al altei reguli?
    const predicateKeyword = rule.predicate.replace(/^(?:este|are|poate)\s+/, '').split(/\s+/)[0];
    if (predicateKeyword.length > 4) {
      const secondOrder = engine.rules.find(r =>
        r.subject.includes(predicateKeyword) && r !== rule
      );
      if (secondOrder) {
        chain.push(`${secondOrder.subject} → ${secondOrder.predicate} (deducție)`);
      }
    }
  }

  return chain;
}

// ─── Răspuns bazat pe inferență ───────────────────────────────────────────────

export function inferAnswer(engine: InferenceEngine, question: string): string | null {
  if (engine.rules.length === 0) return null;
  const n = normInfer(question);

  // Extrage subiectul întrebării
  const subjectMatch = n.match(/(?:ce este|ce e|ce face|cum e|cum este|ce reprezinta|ce inseamna|spune-mi despre)\s+(.+?)[\?]?$/);
  if (!subjectMatch) return null;

  const subject = subjectMatch[1].trim();
  const chain = chainReason(engine, subject);
  if (chain.length === 0) return null;

  const topRule = engine.rules.find(r =>
    r.subject === subject || r.subject.includes(subject)
  );
  const confidence = topRule?.confidence ?? 0.7;
  const certainty = confidence > 0.85 ? 'Conform celor reținute' : 'Pe baza a ce am dedus';

  const lines = [`${certainty}:`];
  chain.slice(0, 2).forEach(c => lines.push(`• ${c}`));

  if (confidence < 0.8) {
    lines.push(`\n*(Certitudine: ${Math.round(confidence * 100)}% — poți corecta dacă e greșit)*`);
  }

  return lines.join('\n');
}

// ─── Raport motor de inferență ────────────────────────────────────────────────

export function getInferenceReport(engine: InferenceEngine): string {
  if (engine.rules.length === 0) return 'Motorul de inferență nu are reguli înregistrate încă.';

  const bySource = { user: 0, deduced: 0, document: 0 };
  for (const r of engine.rules) bySource[r.source]++;

  const topRules = engine.rules.slice(-5).map(r => `• ${r.subject} → ${r.predicate}`).join('\n');

  return [
    `**Motor inferență logică — ${engine.rules.length} reguli**`,
    '',
    `📥 De la utilizator: ${bySource.user}`,
    `🔗 Deduse: ${bySource.deduced}`,
    `📄 Din documente: ${bySource.document}`,
    `⚠️ Contradicții detectate: ${engine.contradictions.length}`,
    '',
    `**Ultimele reguli:**\n${topRules}`,
  ].join('\n');
}
