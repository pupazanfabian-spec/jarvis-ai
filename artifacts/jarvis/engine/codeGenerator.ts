
// Jarvis Code Generator — detectare tip app, system prompt expert, generare cod structurat

import { detectAppType, APP_TEMPLATES, findDevConcept, findStackComparison, DEV_CONCEPTS } from './devKnowledge';

export interface GeneratedCode {
  language: string;
  filename: string;
  code: string;
  explanation: string;
}

export interface CodeGenResult {
  files: GeneratedCode[];
  stack: string;
  dependencies: string[];
  nextSteps: string[];
  templateId?: string;
}

// ─── Detecție intenție de cod ──────────────────────────────────────────────────

const CODE_PATTERNS = [
  /\b(gen(?:erează|ereaza|era|erate)?|create?|fă|fa|scrie|write|build|construi(?:esc)?|cod(?:ul)?|code)\b/i,
  /\b(aplica(?:tie|ția|tion)?|app|aplicatie)\b/i,
  /\b(componen(?:tă|ta|t)|screen|pagina|view)\b/i,
  /\b(funcție|function|class[ă]?|hook|context)\b/i,
  /\b(template|exemplu|example|demo|starter)\b/i,
  /\b(program(?:ul)?|proiect|project|implement(?:ează|eaza)?|dezvolt(?:ă|a)?)\b/i,
  /\b(face(?:ti)?|realiz(?:ează|eaza)?|construi(?:ăsc|asc)?|generat(?:or|oare)?)\b/i,
];

const DEBUG_PATTERNS = [
  /\b(nu\s+(?:merge|funcționea|se\s+compil)|eroare|error|crash|bug|problem[ă]?|TypeError|undefined|null\s+is\s+not)\b/i,
  /\b(de\s+ce\s+(?:nu\s+merge|apare|se\s+întâmplă)|fix|rezolv|ajut[ă]?)\b/i,
];

const EXPLAIN_PATTERNS = [
  /\b(ce\s+(?:este|înseamnă|face)|cum\s+(?:funcționea|se\s+folosește|să)|explică|describe)\b/i,
  /\b(diferența|diferenta|vs|versus|comparat|comparație)\b/i,
];

export function detectDevIntent(text: string): 'generate' | 'debug' | 'explain' | 'compare' | 'none' {
  const t = text.toLowerCase();
  if (DEBUG_PATTERNS.some(p => p.test(t))) return 'debug';
  if (EXPLAIN_PATTERNS.some(p => p.test(t))) return 'explain';
  if (t.includes(' vs ') || t.includes(' versus ') || (t.includes('diferenta') && t.includes('intre'))) return 'compare';
  if (CODE_PATTERNS.some(p => p.test(t))) return 'generate';
  return 'none';
}

// ─── Construire system prompt expert ─────────────────────────────────────────

function buildExpertSystemPrompt(userRequest: string, projectContext?: string): string {
  const appType = detectAppType(userRequest);
  const template = appType ? APP_TEMPLATES[appType] : null;

  let systemPrompt = `Ești Jarvis, un expert senior în dezvoltare software cu 15+ ani experiență.
Răspunzi EXCLUSIV în română.
Generezi cod TypeScript/JavaScript de calitate producție.

REGULI ABSOLUTE:
1. Tot codul trebuie să fie funcțional, compilabil, fără placeholders
2. Folosești TypeScript strict cu tipuri explicite
3. Comentezi în română secțiunile importante
4. Respecti best practices: error handling, loading states, separation of concerns
5. Formatul răspunsului: explicație → cod → pași următori`;

  if (template) {
    systemPrompt += `\n\nStack detectat: ${template.stack ?? 'react-native'}
Template de bază: ${template.name}
Dependințe necesare: ${(template.dependencies ?? []).join(', ') || 'niciuna extra'}`;
  }

  if (projectContext) {
    systemPrompt += `\n\nCONTEXT PROIECT ACTIV:\n${projectContext}`;
  }

  return systemPrompt;
}

function buildDebugPrompt(userRequest: string, codeSnippet?: string): string {
  return `Ești Jarvis, expert senior în debugging. Analizezi erori și oferi soluții precise.
Răspunzi în română.

PROCES DEBUG:
1. Identifici cauza exactă a erorii
2. Explici de ce apare (în română, clar)
3. Dai fix-ul complet, nu parțial
4. Adaugi cum să previi pe viitor

${codeSnippet ? `\nCOD/EROARE PRIMIT:\n\`\`\`\n${codeSnippet}\n\`\`\`` : ''}

Problemă raportată: ${userRequest}`;
}

// ─── Template Code Generation (offline, fără AI) ─────────────────────────────

export function generateFromTemplate(userRequest: string): CodeGenResult | null {
  const appType = detectAppType(userRequest);
  if (!appType) return null;

  const template = APP_TEMPLATES[appType];
  if (!template) return null;

  const deps = template.dependencies ?? [];
  const files = template.files ?? [];
  return {
    templateId: appType,
    stack: template.stack ?? 'react-native',
    dependencies: deps,
    files: files.map(f => ({
      filename: f.path,
      language: detectLanguage(f.path),
      code: f.content,
      explanation: `Fișier generat din template "${template.name}"`,
    })),
    nextSteps: [
      deps.length > 0 ? `Instalează dependințele: npm install ${deps.join(' ')}` : 'Rulează aplicația cu expo start',
      'Adaptează culorile și textele la brandul tău',
      'Adaugă logica specifică aplicației tale',
      'Testează pe Android și iOS',
    ],
  };
}

function detectLanguage(filename: string): string {
  if (filename.endsWith('.tsx') || filename.endsWith('.ts')) return 'typescript';
  if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript';
  if (filename.endsWith('.py')) return 'python';
  if (filename.endsWith('.sql')) return 'sql';
  if (filename.endsWith('.json')) return 'json';
  if (filename.endsWith('.css')) return 'css';
  if (filename.endsWith('.html')) return 'html';
  return 'typescript';
}

// ─── Generare răspuns offline pentru concepte dev ─────────────────────────────

export function generateDevExplanation(userRequest: string): string | null {
  // Caută comparație stack
  const comparison = findStackComparison(userRequest);
  if (comparison) {
    return `## ${comparison.title}\n\n${comparison.content}`;
  }

  // Caută concept
  const concept = findDevConcept(userRequest);
  if (concept) {
    let response = `## ${concept.label}\n\n${concept.description}`;
    if (concept.example) {
      response += `\n\n**Exemplu:**\n\`\`\`${concept.id.includes('sql') ? 'sql' : 'typescript'}\n${concept.example}\n\`\`\``;
    }
    if (concept.related && concept.related.length > 0) {
      const relatedLabels = concept.related
        .map(r => DEV_CONCEPTS[r]?.label)
        .filter(Boolean)
        .slice(0, 3);
      if (relatedLabels.length > 0) {
        response += `\n\n**Concepte înrudite:** ${relatedLabels.join(', ')}`;
      }
    }
    return response;
  }

  return null;
}

// ─── Construire prompt pentru AI Cloud ───────────────────────────────────────

export function buildAICodePrompt(
  userRequest: string,
  intent: 'generate' | 'debug' | 'explain' | 'compare',
  projectContext?: string,
  codeSnippet?: string,
): string {
  switch (intent) {
    case 'debug':
      return buildDebugPrompt(userRequest, codeSnippet);
    case 'generate':
      return `${buildExpertSystemPrompt(userRequest, projectContext)}\n\nCerere utilizator: ${userRequest}`;
    case 'explain':
    case 'compare':
      return `Ești Jarvis, expert senior în dezvoltare software. Explici concepte tehnice clar, în română, cu exemple practice.\n\nÎntrebare: ${userRequest}`;
  }
}

// ─── Formatare răspuns cod pentru afișare ────────────────────────────────────

export function formatCodeResponse(result: CodeGenResult): string {
  const lines: string[] = [];

  if (result.templateId) {
    lines.push(`**Template generat:** ${APP_TEMPLATES[result.templateId]?.name || result.templateId}`);
    lines.push(`**Stack:** ${result.stack}\n`);
  }

  for (const file of result.files) {
    lines.push(`**${file.filename}:**`);
    lines.push(`\`\`\`${file.language}`);
    lines.push(file.code);
    lines.push('```\n');
  }

  if (result.dependencies.length > 0) {
    lines.push(`**Instalare:**`);
    lines.push(`\`\`\`bash\nnpm install ${result.dependencies.join(' ')}\n\`\`\`\n`);
  }

  if (result.nextSteps.length > 0) {
    lines.push(`**Pași următori:**`);
    result.nextSteps.forEach((step, i) => {
      lines.push(`${i + 1}. ${step}`);
    });
  }

  return lines.join('\n');
}

// ─── Extrage snippet de cod din text ─────────────────────────────────────────

export function extractCodeSnippet(text: string): string | undefined {
  const match = text.match(/```[\w]*\n([\s\S]+?)```/);
  if (match) return match[1];
  // Încearcă blocuri indentate
  const lines = text.split('\n').filter(l => l.startsWith('  ') || l.startsWith('\t'));
  if (lines.length > 2) return lines.join('\n');
  return undefined;
}
