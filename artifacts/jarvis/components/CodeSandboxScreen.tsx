
// ─── Jarvis Code Sandbox ────────────────────────────────────────────────────────
// Editor complet cu execuție, output, tutoriale și integrare AI

import React, {
  useState, useCallback, useMemo,
} from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, ActivityIndicator, Modal,
  Platform, KeyboardAvoidingView, Share,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  LANGUAGES, Language, ExecutionResult,
  executeCode, formatOutput, detectDangerousCode, getTutorial,
} from '@/engine/codeExecution';
import { useBrain } from '@/context/BrainContext';

const { width: SCREEN_W } = Dimensions.get('window');

const C = {
  bg: '#0A0A0F',
  surface: '#12121A',
  card: '#1A1A28',
  border: '#252540',
  primary: '#6C63FF',
  accent: '#00D4FF',
  green: '#00FF88',
  yellow: '#FFD700',
  red: '#FF4466',
  text: '#E0E0F0',
  textSec: '#8888AA',
  editor: '#0D0D16',
  lineNum: '#3A3A5C',
};

// ── Simple syntax highlighter ────────────────────────────────────────────────

interface Token { text: string; color: string }

function tokenize(code: string, langId: string): Token[][] {
  const keywords: Record<string, string[]> = {
    python: ['def', 'class', 'import', 'from', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and', 'or', 'True', 'False', 'None', 'try', 'except', 'with', 'as', 'lambda', 'yield', 'pass', 'break', 'continue', 'print'],
    javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'default', 'from', 'new', 'this', 'async', 'await', 'try', 'catch', 'true', 'false', 'null', 'undefined', 'typeof', 'instanceof', 'console'],
    typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'default', 'from', 'new', 'this', 'async', 'await', 'interface', 'type', 'enum', 'extends', 'implements', 'public', 'private', 'protected', 'readonly', 'string', 'number', 'boolean', 'void', 'any'],
    java: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'return', 'if', 'else', 'for', 'while', 'new', 'this', 'static', 'final', 'void', 'int', 'String', 'boolean', 'double', 'float', 'long', 'import', 'package', 'try', 'catch'],
    cpp: ['int', 'float', 'double', 'char', 'bool', 'void', 'return', 'if', 'else', 'for', 'while', 'class', 'struct', 'namespace', 'using', 'new', 'delete', 'public', 'private', 'protected', 'template', 'typename', 'auto', 'const', 'include', 'cout', 'cin', 'std'],
    go: ['func', 'var', 'const', 'type', 'struct', 'interface', 'return', 'if', 'else', 'for', 'range', 'switch', 'case', 'break', 'continue', 'import', 'package', 'go', 'chan', 'defer', 'select', 'nil', 'true', 'false', 'make', 'new', 'len', 'cap', 'append', 'fmt'],
    rust: ['fn', 'let', 'mut', 'const', 'struct', 'enum', 'impl', 'trait', 'use', 'mod', 'pub', 'return', 'if', 'else', 'match', 'for', 'while', 'loop', 'break', 'continue', 'true', 'false', 'Some', 'None', 'Ok', 'Err', 'Vec', 'String', 'println'],
    php: ['function', 'class', 'return', 'if', 'else', 'elseif', 'foreach', 'while', 'for', 'echo', 'print', 'new', 'public', 'private', 'protected', 'static', 'extends', 'implements', 'interface', 'namespace', 'use', 'match', 'fn', 'true', 'false', 'null'],
    ruby: ['def', 'class', 'module', 'return', 'if', 'elsif', 'else', 'unless', 'while', 'until', 'for', 'do', 'end', 'begin', 'rescue', 'attr_reader', 'attr_writer', 'require', 'include', 'extend', 'true', 'false', 'nil', 'puts', 'print', 'super', 'self'],
    bash: ['if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done', 'function', 'return', 'echo', 'exit', 'local', 'export', 'readonly', 'case', 'esac', 'in', 'source'],
  };
  const kws = new Set(keywords[langId] ?? keywords.javascript);

  const lines = code.split('\n');
  return lines.map(line => {
    const tokens: Token[] = [];
    let i = 0;
    const n = line.length;

    while (i < n) {
      // Comment
      if ((langId === 'python' || langId === 'ruby' || langId === 'bash') && line[i] === '#') {
        tokens.push({ text: line.slice(i), color: C.textSec });
        break;
      }
      if ((langId !== 'python' && langId !== 'ruby' && langId !== 'bash') && line[i] === '/' && line[i + 1] === '/') {
        tokens.push({ text: line.slice(i), color: C.textSec });
        break;
      }
      // String
      if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
        const quote = line[i];
        let j = i + 1;
        while (j < n && line[j] !== quote) {
          if (line[j] === '\\') j++;
          j++;
        }
        tokens.push({ text: line.slice(i, j + 1), color: C.green });
        i = j + 1;
        continue;
      }
      // Number
      if (/\d/.test(line[i])) {
        let j = i;
        while (j < n && /[\d._]/.test(line[j])) j++;
        tokens.push({ text: line.slice(i, j), color: C.yellow });
        i = j;
        continue;
      }
      // Word (keyword or identifier)
      if (/[a-zA-Z_$@]/.test(line[i])) {
        let j = i;
        while (j < n && /[\w$]/.test(line[j])) j++;
        const word = line.slice(i, j);
        tokens.push({ text: word, color: kws.has(word) ? C.primary : C.text });
        i = j;
        continue;
      }
      // Operator / punctuation
      tokens.push({ text: line[i], color: C.accent });
      i++;
    }

    return tokens.length > 0 ? tokens : [{ text: '', color: C.text }];
  });
}

// ── Component principal ──────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function CodeSandboxScreen({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { sendMessage } = useBrain();

  const [selectedLang, setSelectedLang] = useState<Language>(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].example);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [showOutput, setShowOutput] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [dangerWarning, setDangerWarning] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [stdinText, setStdinText] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const [syntaxHighlight, setSyntaxHighlight] = useState(true);
  const [aiAsking, setAiAsking] = useState(false);
  const [tab, setTab] = useState<'editor' | 'tutorial' | 'output'>('editor');

  const tutorial = useMemo(() => getTutorial(selectedLang.id), [selectedLang.id]);

  const selectLanguage = useCallback((lang: Language) => {
    setSelectedLang(lang);
    setCode(lang.example);
    setResult(null);
    setShowOutput(false);
    setDangerWarning(null);
  }, []);

  const handleRun = useCallback(async () => {
    if (running) return;
    const warning = detectDangerousCode(code, selectedLang.id);
    setDangerWarning(warning);
    setRunning(true);
    setShowOutput(true);
    setTab('output');
    setResult(null);

    try {
      const res = await executeCode(selectedLang.id, code, stdinText || undefined);
      setResult(res);
    } catch (e: any) {
      setResult({ stdout: '', stderr: e?.message ?? 'Eroare necunoscută', exitCode: -1, duration: 0 });
    } finally {
      setRunning(false);
    }
  }, [running, code, selectedLang.id, stdinText]);

  const handleCopy = useCallback(async () => {
    try {
      await Share.share({ message: code, title: `Cod ${selectedLang.name}` });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code, selectedLang.name]);

  const handleAskAI = useCallback(async () => {
    if (aiAsking) return;
    setAiAsking(true);
    const prompt = `Explică și optimizează acest cod ${selectedLang.name}:\n\n\`\`\`${selectedLang.id}\n${code}\n\`\`\``;
    try {
      onClose(); // Închidem sandbox-ul și trimitem în chat
      setTimeout(() => sendMessage(prompt), 300);
    } finally {
      setAiAsking(false);
    }
  }, [aiAsking, code, selectedLang, sendMessage, onClose]);

  const handleAskFix = useCallback(async () => {
    if (!result?.stderr || aiAsking) return;
    setAiAsking(true);
    const prompt = `Corectează eroarea din acest cod ${selectedLang.name}:\n\n\`\`\`${selectedLang.id}\n${code}\n\`\`\`\n\nEroare:\n${result.stderr}`;
    try {
      onClose();
      setTimeout(() => sendMessage(prompt), 300);
    } finally {
      setAiAsking(false);
    }
  }, [aiAsking, code, result, selectedLang, sendMessage, onClose]);

  const handleGenerate = useCallback(() => {
    const prompt = `Scrie-mi un program complet în ${selectedLang.name} care să demonstreze funcționalități avansate. Include comentarii.`;
    onClose();
    setTimeout(() => sendMessage(prompt), 300);
  }, [selectedLang, sendMessage, onClose]);

  const lineCount = useMemo(() => code.split('\n').length, [code]);
  const tokens = useMemo(
    () => syntaxHighlight ? tokenize(code, selectedLang.id) : null,
    [code, selectedLang.id, syntaxHighlight],
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top }]}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerIcon}>💻</Text>
            <View>
              <Text style={styles.headerTitle}>Code Sandbox</Text>
              <Text style={styles.headerSub}>{selectedLang.icon} {selectedLang.name}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.runBtn, running && styles.runBtnDisabled]}
              onPress={handleRun}
              disabled={running}
            >
              {running
                ? <ActivityIndicator size="small" color="#fff" />
                : <><Text style={styles.runIcon}>▶</Text><Text style={styles.runText}>Run</Text></>
              }
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Feather name="x" size={22} color={C.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Language Picker */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.langBar} contentContainerStyle={styles.langBarContent}>
          {LANGUAGES.map(lang => (
            <TouchableOpacity
              key={lang.id}
              style={[styles.langChip, selectedLang.id === lang.id && styles.langChipActive]}
              onPress={() => selectLanguage(lang)}
            >
              <Text style={styles.langChipIcon}>{lang.icon}</Text>
              <Text style={[styles.langChipText, selectedLang.id === lang.id && styles.langChipTextActive]}>
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {(['editor', 'output', 'tutorial'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>
                {t === 'editor' ? '📝 Editor' : t === 'output' ? '📤 Output' : '📖 Tutorial'}
              </Text>
              {t === 'output' && result && (
                <View style={[styles.tabDot, { backgroundColor: result.exitCode === 0 ? C.green : C.red }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Editor Tab ─────────────────────────────────────────────────── */}
        {tab === 'editor' && (
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            {/* Danger warning */}
            {dangerWarning && (
              <View style={styles.warningBanner}>
                <Text style={styles.warningText}>{dangerWarning}</Text>
              </View>
            )}

            {/* Editor */}
            <ScrollView style={styles.editorScroll} horizontal={false}>
              <View style={styles.editorContainer}>
                {/* Line numbers */}
                <View style={styles.lineNumbers}>
                  {Array.from({ length: lineCount }).map((_, i) => (
                    <Text key={i} style={styles.lineNum}>{i + 1}</Text>
                  ))}
                </View>

                {/* Code area */}
                <View style={styles.codeArea}>
                  {syntaxHighlight && tokens ? (
                    <View style={StyleSheet.absoluteFill} pointerEvents="none">
                      {tokens.map((lineTokens, li) => (
                        <View key={li} style={styles.tokenLine}>
                          {lineTokens.map((tok, ti) => (
                            <Text key={ti} style={[styles.tokenText, { color: tok.color }]}>
                              {tok.text}
                            </Text>
                          ))}
                        </View>
                      ))}
                    </View>
                  ) : null}
                  <TextInput
                    style={[styles.codeInput, syntaxHighlight && styles.codeInputTransparent]}
                    value={code}
                    onChangeText={setCode}
                    multiline
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    scrollEnabled={false}
                    textAlignVertical="top"
                    placeholder="// Scrie codul tău aici..."
                    placeholderTextColor={C.textSec}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Toolbar */}
            <View style={styles.toolbar}>
              <TouchableOpacity style={styles.toolBtn} onPress={handleCopy}>
                <Feather name="copy" size={16} color={copied ? C.green : C.textSec} />
                <Text style={[styles.toolBtnText, copied && { color: C.green }]}>
                  {copied ? 'Copiat!' : 'Copiază'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.toolBtn} onPress={() => { setCode(''); setResult(null); }}>
                <Feather name="trash-2" size={16} color={C.textSec} />
                <Text style={styles.toolBtnText}>Șterge</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.toolBtn} onPress={() => selectLanguage(selectedLang)}>
                <Feather name="refresh-cw" size={16} color={C.textSec} />
                <Text style={styles.toolBtnText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toolBtn, styles.toolBtnHighlight]}
                onPress={handleAskAI}
                disabled={aiAsking}
              >
                <Text style={styles.toolBtnHighlightText}>🤖 Explică AI</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toolBtn, styles.toolBtnHighlight]}
                onPress={handleGenerate}
              >
                <Text style={styles.toolBtnHighlightText}>✦ Generează</Text>
              </TouchableOpacity>
            </View>

            {/* STDIN toggle */}
            <TouchableOpacity
              style={styles.stdinToggle}
              onPress={() => setShowStdin(s => !s)}
            >
              <Text style={styles.stdinToggleText}>
                {showStdin ? '▲ Ascunde input' : '▼ Input (stdin)'}
              </Text>
            </TouchableOpacity>
            {showStdin && (
              <TextInput
                style={styles.stdinInput}
                value={stdinText}
                onChangeText={setStdinText}
                placeholder="Introdu datele pentru stdin..."
                placeholderTextColor={C.textSec}
                multiline
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          </KeyboardAvoidingView>
        )}

        {/* ── Output Tab ─────────────────────────────────────────────────── */}
        {tab === 'output' && (
          <ScrollView style={styles.outputScroll} contentContainerStyle={styles.outputContent}>
            {running && (
              <View style={styles.outputRunning}>
                <ActivityIndicator color={C.primary} size="large" />
                <Text style={styles.outputRunningText}>Se execută {selectedLang.name}...</Text>
              </View>
            )}

            {!running && !result && (
              <View style={styles.outputEmpty}>
                <Text style={styles.outputEmptyIcon}>▶</Text>
                <Text style={styles.outputEmptyText}>Apasă Run pentru a executa codul</Text>
              </View>
            )}

            {!running && result && (
              <>
                {/* Status bar */}
                <View style={[styles.statusBar, result.exitCode === 0 ? styles.statusOk : styles.statusErr]}>
                  <Text style={styles.statusIcon}>{result.exitCode === 0 ? '✓' : '✗'}</Text>
                  <Text style={styles.statusText}>
                    {result.exitCode === 0 ? 'Succes' : `Eroare (exit ${result.exitCode})`}
                  </Text>
                  <Text style={styles.statusTime}>{result.duration}ms</Text>
                </View>

                {/* Stdout */}
                {result.stdout ? (
                  <View style={styles.outputSection}>
                    <Text style={styles.outputSectionLabel}>OUTPUT</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator>
                      <Text style={styles.outputText}>{result.stdout}</Text>
                    </ScrollView>
                  </View>
                ) : null}

                {/* Stderr */}
                {result.stderr ? (
                  <View style={styles.outputSection}>
                    <Text style={[styles.outputSectionLabel, { color: C.red }]}>EROARE</Text>
                    <Text style={[styles.outputText, { color: '#FF7A7A' }]}>{result.stderr}</Text>
                    {result.stderr.length > 20 && (
                      <TouchableOpacity style={styles.fixBtn} onPress={handleAskFix}>
                        <Text style={styles.fixBtnText}>🤖 Cere Jarvis să corecteze eroarea</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : null}

                {!result.stdout && !result.stderr && (
                  <Text style={styles.outputEmpty2}>(fără output)</Text>
                )}
              </>
            )}
          </ScrollView>
        )}

        {/* ── Tutorial Tab ───────────────────────────────────────────────── */}
        {tab === 'tutorial' && (
          <ScrollView style={styles.tutorialScroll} contentContainerStyle={styles.tutorialContent}>
            {tutorial ? (
              <>
                <Text style={styles.tutorialTitle}>{tutorial.titlu}</Text>
                {tutorial.sectiuni.map((s, i) => (
                  <View key={i} style={styles.tutorialSection}>
                    <Text style={styles.tutorialSubtitle}>{s.subtitlu}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator>
                      <Text style={styles.tutorialCode}>{s.continut}</Text>
                    </ScrollView>
                    <TouchableOpacity
                      style={styles.useExampleBtn}
                      onPress={() => { setCode(s.continut); setTab('editor'); }}
                    >
                      <Text style={styles.useExampleText}>📋 Folosește exemplul</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            ) : (
              <View style={styles.noTutorial}>
                <Text style={styles.noTutorialText}>
                  Nu există tutorial pentru {selectedLang.name} deocamdată.{'\n\n'}
                  Poți cere Jarvis să îți explice orice concept!
                </Text>
                <TouchableOpacity
                  style={styles.askTutorialBtn}
                  onPress={() => {
                    const prompt = `Fă-mi un tutorial complet pentru ${selectedLang.name} cu exemple de cod, de la bază până la avansat.`;
                    onClose();
                    setTimeout(() => sendMessage(prompt), 300);
                  }}
                >
                  <Text style={styles.askTutorialBtnText}>🤖 Cere tutorial de la Jarvis</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Quick examples section */}
            <View style={styles.quickSection}>
              <Text style={styles.quickTitle}>Exemple rapide {selectedLang.icon} {selectedLang.name}</Text>
              <TouchableOpacity
                style={styles.quickBtn}
                onPress={() => { setCode(selectedLang.example); setTab('editor'); }}
              >
                <Text style={styles.quickBtnText}>▶ Exemplu implicit</Text>
              </TouchableOpacity>

              {[
                `Scrie un program ${selectedLang.name} care sortează o listă de numere`,
                `Scrie o funcție ${selectedLang.name} pentru căutare binară`,
                `Scrie o clasă ${selectedLang.name} pentru o stivă (stack)`,
                `Scrie cod ${selectedLang.name} pentru calcularea numerelor prime`,
              ].map((prompt, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.quickPromptBtn}
                  onPress={() => { onClose(); setTimeout(() => sendMessage(prompt), 300); }}
                >
                  <Text style={styles.quickPromptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.surface,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: { fontSize: 24 },
  headerTitle: { color: C.text, fontSize: 17, fontWeight: '700' },
  headerSub: { color: C.textSec, fontSize: 12, marginTop: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  runBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  runBtnDisabled: { opacity: 0.6 },
  runIcon: { color: '#fff', fontSize: 14, fontWeight: '700' },
  runText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  closeBtn: { padding: 6 },

  langBar: { maxHeight: 52, borderBottomWidth: 1, borderBottomColor: C.border },
  langBarContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  langChipActive: { borderColor: C.primary, backgroundColor: 'rgba(108,99,255,0.15)' },
  langChipIcon: { fontSize: 14 },
  langChipText: { color: C.textSec, fontSize: 12, fontWeight: '500' },
  langChipTextActive: { color: C.primary },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
    position: 'relative',
  },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: C.primary },
  tabBtnText: { color: C.textSec, fontSize: 13 },
  tabBtnTextActive: { color: C.primary, fontWeight: '600' },
  tabDot: { width: 7, height: 7, borderRadius: 4 },

  warningBanner: {
    backgroundColor: 'rgba(255,68,102,0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,68,102,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  warningText: { color: C.red, fontSize: 12 },

  editorScroll: { flex: 1, backgroundColor: C.editor },
  editorContainer: { flexDirection: 'row', minHeight: '100%' },
  lineNumbers: {
    width: 40,
    paddingTop: 12,
    paddingRight: 8,
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  lineNum: { color: C.lineNum, fontSize: 12, lineHeight: 20, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  codeArea: { flex: 1, position: 'relative' },
  codeInput: {
    flex: 1,
    color: C.text,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    padding: 12,
    textAlignVertical: 'top',
    minHeight: 300,
  },
  codeInputTransparent: { color: 'transparent' },
  tokenLine: { flexDirection: 'row', flexWrap: 'nowrap', paddingHorizontal: 12 },
  tokenText: { fontSize: 13, lineHeight: 20, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.surface,
    gap: 8,
    flexWrap: 'wrap',
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: C.card,
  },
  toolBtnText: { color: C.textSec, fontSize: 12 },
  toolBtnHighlight: { backgroundColor: 'rgba(108,99,255,0.15)', borderWidth: 1, borderColor: C.primary },
  toolBtnHighlightText: { color: C.primary, fontSize: 12, fontWeight: '600' },

  stdinToggle: { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: C.surface },
  stdinToggleText: { color: C.textSec, fontSize: 12 },
  stdinInput: {
    backgroundColor: C.card,
    color: C.text,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    padding: 10,
    maxHeight: 80,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },

  outputScroll: { flex: 1 },
  outputContent: { padding: 16, gap: 12 },
  outputRunning: { alignItems: 'center', paddingTop: 60, gap: 16 },
  outputRunningText: { color: C.textSec, fontSize: 15 },
  outputEmpty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  outputEmptyIcon: { fontSize: 40, color: C.primary },
  outputEmptyText: { color: C.textSec, fontSize: 15 },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  statusOk: { backgroundColor: 'rgba(0,255,136,0.1)', borderWidth: 1, borderColor: 'rgba(0,255,136,0.3)' },
  statusErr: { backgroundColor: 'rgba(255,68,102,0.1)', borderWidth: 1, borderColor: 'rgba(255,68,102,0.3)' },
  statusIcon: { fontSize: 18 },
  statusText: { flex: 1, color: C.text, fontSize: 14, fontWeight: '600' },
  statusTime: { color: C.textSec, fontSize: 12 },
  outputSection: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  outputSectionLabel: { color: C.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  outputText: {
    color: C.green,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 20,
  },
  outputEmpty2: { color: C.textSec, fontSize: 14, textAlign: 'center', paddingTop: 20 },
  fixBtn: {
    backgroundColor: 'rgba(108,99,255,0.15)',
    borderWidth: 1,
    borderColor: C.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  fixBtnText: { color: C.primary, fontSize: 13, fontWeight: '600' },

  tutorialScroll: { flex: 1 },
  tutorialContent: { padding: 16, gap: 16 },
  tutorialTitle: { color: C.text, fontSize: 18, fontWeight: '700' },
  tutorialSection: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  tutorialSubtitle: { color: C.accent, fontSize: 14, fontWeight: '600' },
  tutorialCode: {
    color: C.text,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 18,
  },
  useExampleBtn: {
    backgroundColor: 'rgba(0,212,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  useExampleText: { color: C.accent, fontSize: 12 },

  noTutorial: { alignItems: 'center', paddingTop: 40, gap: 16 },
  noTutorialText: { color: C.textSec, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  askTutorialBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  askTutorialBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  quickSection: { gap: 10 },
  quickTitle: { color: C.text, fontSize: 16, fontWeight: '700' },
  quickBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  quickBtnText: { color: '#fff', fontWeight: '600' },
  quickPromptBtn: {
    backgroundColor: C.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  quickPromptText: { color: C.text, fontSize: 13 },
});
