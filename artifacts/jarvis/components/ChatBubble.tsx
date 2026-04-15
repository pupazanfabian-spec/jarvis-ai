
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated, Clipboard, Modal, Platform, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { writeAsStringAsync, documentDirectory } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { Message } from '@/engine/brain';
import Colors from '@/constants/colors';

const { colors } = Colors;

interface Props {
  message: Message;
  index: number;
}

interface Token {
  text: string;
  type: 'keyword' | 'string' | 'comment' | 'number' | 'type' | 'function' | 'operator' | 'plain' | 'tag' | 'attr' | 'selector' | 'property' | 'value' | 'decorator' | 'builtin';
}

const TS_KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
  'class', 'extends', 'interface', 'type', 'enum', 'import', 'export', 'default',
  'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'super', 'static',
  'public', 'private', 'protected', 'readonly', 'typeof', 'instanceof', 'in', 'of',
  'true', 'false', 'null', 'undefined', 'void', 'never', 'any', 'from', 'as',
  'switch', 'case', 'break', 'continue', 'delete', 'yield', 'abstract', 'declare',
]);

const TS_TYPES = new Set([
  'string', 'number', 'boolean', 'object', 'Array', 'Promise', 'Record',
  'Map', 'Set', 'Date', 'Error', 'React', 'ReactNode', 'JSX', 'FC',
]);

const PY_KEYWORDS = new Set([
  'def', 'class', 'if', 'elif', 'else', 'for', 'while', 'return', 'import', 'from',
  'as', 'try', 'except', 'finally', 'raise', 'with', 'yield', 'lambda', 'pass',
  'break', 'continue', 'and', 'or', 'not', 'is', 'in', 'True', 'False', 'None',
  'async', 'await', 'del', 'global', 'nonlocal', 'assert',
]);

const PY_BUILTINS = new Set([
  'print', 'len', 'range', 'int', 'str', 'float', 'list', 'dict', 'set', 'tuple',
  'type', 'isinstance', 'enumerate', 'zip', 'map', 'filter', 'sorted', 'reversed',
  'input', 'open', 'super', 'property', 'staticmethod', 'classmethod', 'abs', 'max', 'min',
]);

const CSS_PROPERTIES = new Set([
  'color', 'background', 'background-color', 'margin', 'padding', 'border', 'width',
  'height', 'display', 'position', 'top', 'left', 'right', 'bottom', 'flex',
  'font-size', 'font-weight', 'font-family', 'text-align', 'line-height', 'opacity',
  'z-index', 'overflow', 'transition', 'transform', 'animation', 'box-shadow',
  'border-radius', 'justify-content', 'align-items', 'gap', 'grid',
]);

function tokenizeLine(line: string, lang: string): Token[] {
  if (lang === 'bash' || lang === 'sh' || lang === 'shell') return tokenizeBash(line);
  if (lang === 'python' || lang === 'py') return tokenizePython(line);
  if (lang === 'html' || lang === 'xml' || lang === 'jsx' || lang === 'tsx') return tokenizeHTML(line);
  if (lang === 'css' || lang === 'scss' || lang === 'less') return tokenizeCSS(line);
  return tokenizeCode(line);
}

function tokenizeBash(line: string): Token[] {
  const tokens: Token[] = [];
  if (line.startsWith('#')) {
    tokens.push({ text: line, type: 'comment' });
    return tokens;
  }
  const parts = line.split(/(\s+)/);
  parts.forEach((part, i) => {
    if (i === 0 && ['npm', 'pnpm', 'yarn', 'npx', 'git', 'cd', 'ls', 'mkdir', 'echo', 'export', 'node', 'expo', 'eas', 'pip', 'python', 'python3', 'curl', 'wget', 'sudo', 'apt', 'brew'].includes(part)) {
      tokens.push({ text: part, type: 'keyword' });
    } else if (part.startsWith('-')) {
      tokens.push({ text: part, type: 'operator' });
    } else if (part.startsWith('"') || part.startsWith("'")) {
      tokens.push({ text: part, type: 'string' });
    } else if (part.startsWith('$')) {
      tokens.push({ text: part, type: 'type' });
    } else {
      tokens.push({ text: part, type: 'plain' });
    }
  });
  return tokens;
}

function tokenizePython(line: string): Token[] {
  const tokens: Token[] = [];
  const trimmed = line.trimStart();

  if (trimmed.startsWith('#')) {
    const indent = line.length - trimmed.length;
    if (indent > 0) tokens.push({ text: line.slice(0, indent), type: 'plain' });
    tokens.push({ text: trimmed, type: 'comment' });
    return tokens;
  }

  if (trimmed.startsWith('@')) {
    const indent = line.length - trimmed.length;
    if (indent > 0) tokens.push({ text: line.slice(0, indent), type: 'plain' });
    tokens.push({ text: trimmed, type: 'decorator' });
    return tokens;
  }

  const regex = /("""[^]*?"""|'''[^]*?'''|f"[^"]*"|f'[^']*'|"[^"]*"|'[^']*'|\d+\.?\d*|[a-zA-Z_][a-zA-Z0-9_]*|[=><!&|+\-*\/%.:,;{}()[\]@#~^]|\s+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    const text = match[0];
    let type: Token['type'] = 'plain';

    if (text.startsWith('"""') || text.startsWith("'''") || text.startsWith('"') || text.startsWith("'") || text.startsWith('f"') || text.startsWith("f'")) {
      type = 'string';
    } else if (/^\d/.test(text)) {
      type = 'number';
    } else if (/^[a-zA-Z_]/.test(text)) {
      if (PY_KEYWORDS.has(text)) type = 'keyword';
      else if (PY_BUILTINS.has(text)) type = 'builtin';
      else if (line[match.index + text.length] === '(') type = 'function';
      else type = 'plain';
    } else if (/[=><!&|+\-*\/]/.test(text)) {
      type = 'operator';
    }

    tokens.push({ text, type });
  }

  return tokens;
}

function tokenizeHTML(line: string): Token[] {
  const tokens: Token[] = [];
  const regex = /(<\/?[a-zA-Z][a-zA-Z0-9-]*|\/?>|[a-zA-Z-]+=|"[^"]*"|'[^']*'|<!--.*?-->|\{[^}]*\}|[^<>"'=\s{}]+|\s+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    const text = match[0];
    if (text.startsWith('<!--')) {
      tokens.push({ text, type: 'comment' });
    } else if (text.startsWith('<') && !text.startsWith('</')) {
      tokens.push({ text, type: 'tag' });
    } else if (text.startsWith('</')) {
      tokens.push({ text, type: 'tag' });
    } else if (text === '/>' || text === '>') {
      tokens.push({ text, type: 'tag' });
    } else if (text.endsWith('=')) {
      tokens.push({ text, type: 'attr' });
    } else if (text.startsWith('"') || text.startsWith("'")) {
      tokens.push({ text, type: 'string' });
    } else if (text.startsWith('{')) {
      tokens.push({ text, type: 'type' });
    } else {
      tokens.push({ text, type: 'plain' });
    }
  }
  return tokens;
}

function tokenizeCSS(line: string): Token[] {
  const tokens: Token[] = [];
  const trimmed = line.trim();

  if (trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('//')) {
    tokens.push({ text: line, type: 'comment' });
    return tokens;
  }

  if (trimmed.startsWith('.') || trimmed.startsWith('#') || trimmed.startsWith('@') || trimmed.match(/^[a-z]+\s*[{,]/)) {
    tokens.push({ text: line, type: 'selector' });
    return tokens;
  }

  const colonIdx = line.indexOf(':');
  if (colonIdx > 0 && !line.trim().startsWith('{') && !line.trim().startsWith('}')) {
    const prop = line.slice(0, colonIdx);
    const rest = line.slice(colonIdx);
    const propName = prop.trim().toLowerCase();
    tokens.push({ text: prop, type: CSS_PROPERTIES.has(propName) ? 'property' : 'plain' });

    const valueParts = rest.split(/(;|!important|#[0-9a-fA-F]{3,8}|\d+\.?\d*(px|em|rem|%|vh|vw|s|ms)?|"[^"]*"|'[^']*')/g);
    valueParts.forEach(part => {
      if (!part) return;
      if (part === ';') tokens.push({ text: part, type: 'operator' });
      else if (part === '!important') tokens.push({ text: part, type: 'keyword' });
      else if (part.startsWith('#')) tokens.push({ text: part, type: 'number' });
      else if (/^\d/.test(part)) tokens.push({ text: part, type: 'number' });
      else if (part.startsWith('"') || part.startsWith("'")) tokens.push({ text: part, type: 'string' });
      else tokens.push({ text: part, type: 'value' });
    });
    return tokens;
  }

  tokens.push({ text: line, type: 'plain' });
  return tokens;
}

function tokenizeCode(line: string): Token[] {
  const tokens: Token[] = [];
  const commentIdx = line.indexOf('//');
  if (commentIdx !== -1 && !isInString(line, commentIdx)) {
    if (commentIdx > 0) {
      tokens.push(...tokenizeSegment(line.slice(0, commentIdx)));
    }
    tokens.push({ text: line.slice(commentIdx), type: 'comment' });
    return tokens;
  }
  tokens.push(...tokenizeSegment(line));
  return tokens;
}

function isInString(line: string, pos: number): boolean {
  let inStr = false;
  let strChar = '';
  for (let i = 0; i < pos; i++) {
    const c = line[i];
    if (!inStr && (c === '"' || c === "'" || c === '`')) {
      inStr = true; strChar = c;
    } else if (inStr && c === strChar && line[i - 1] !== '\\') {
      inStr = false;
    }
  }
  return inStr;
}

function tokenizeSegment(segment: string): Token[] {
  const tokens: Token[] = [];
  const regex = /(`[^`]*`|"[^"]*"|'[^']*'|\d+\.?\d*|[a-zA-Z_$][a-zA-Z0-9_$]*|[=><!&|+\-*\/%.,:;{}()[\]?@#~^]|\s+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(segment)) !== null) {
    const text = match[0];
    let type: Token['type'] = 'plain';

    if (text.startsWith('"') || text.startsWith("'") || text.startsWith('`')) {
      type = 'string';
    } else if (/^\d/.test(text)) {
      type = 'number';
    } else if (/^[a-zA-Z_$]/.test(text)) {
      if (TS_KEYWORDS.has(text)) type = 'keyword';
      else if (TS_TYPES.has(text)) type = 'type';
      else if (regex.source && segment[match.index + text.length] === '(') type = 'function';
      else type = 'plain';
    } else if (/[=><!&|+\-*\/]/.test(text)) {
      type = 'operator';
    }

    tokens.push({ text, type });
  }

  return tokens;
}

const SYNTAX_COLORS: Record<Token['type'], string> = {
  keyword: '#C586C0',
  string: '#CE9178',
  comment: '#6A9955',
  number: '#B5CEA8',
  type: '#4EC9B0',
  function: '#DCDCAA',
  operator: '#D4D4D4',
  plain: '#D4D4D4',
  tag: '#569CD6',
  attr: '#9CDCFE',
  selector: '#D7BA7D',
  property: '#9CDCFE',
  value: '#CE9178',
  decorator: '#DCDCAA',
  builtin: '#4EC9B0',
};

const CodeBlock = memo(function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const copyAnim = useRef(new Animated.Value(0)).current;
  const lines = useMemo(() => code.split('\n'), [code]);
  const tokenizedLines = useMemo(
    () => lines.map(line => tokenizeLine(line, language)),
    [lines, language],
  );

  const handleCopy = async () => {
    Clipboard.setString(code);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopied(true);
    copyAnim.setValue(0);
    Animated.sequence([
      Animated.timing(copyAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1500),
      Animated.timing(copyAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setCopied(false));
  };

  const extractSemanticFilename = (src: string, lang: string): string => {
    const ext = lang === 'typescript' ? 'ts' : lang === 'javascript' ? 'js' : lang === 'python' ? 'py' : lang === 'html' ? 'html' : lang === 'css' ? 'css' : lang === 'bash' ? 'sh' : lang || 'txt';
    const firstLines = src.split('\n').slice(0, 3).join('\n');
    const match = firstLines.match(/(?:\/\/|\/\*|#)\s*([\w\-./]+\.\w{1,5})/);
    if (match) {
      const name = match[1].replace(/[^a-zA-Z0-9._\-]/g, '_');
      return name;
    }
    return `jarvis_code_${Date.now()}.${ext}`;
  };

  const handleSave = async () => {
    try {
      const filename = extractSemanticFilename(code, language);
      const path = `${documentDirectory ?? ''}${filename}`;
      await writeAsStringAsync(path, code);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(path, {
          mimeType: 'text/plain',
          dialogTitle: `Salvează ${filename}`,
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      if (__DEV__) console.warn('[ChatBubble] Save failed:', e);
    }
  };

  return (
    <View style={codeStyles.wrapper}>
      <Animated.View style={[codeStyles.copyFlash, {
        opacity: copyAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.15, 0] }),
      }]} pointerEvents="none" />
      <View style={codeStyles.header}>
        <View style={codeStyles.dots}>
          <View style={[codeStyles.dot, { backgroundColor: '#FF5F57' }]} />
          <View style={[codeStyles.dot, { backgroundColor: '#FEBC2E' }]} />
          <View style={[codeStyles.dot, { backgroundColor: '#28C840' }]} />
        </View>
        <Text style={codeStyles.langLabel}>{language || 'code'}</Text>
        <View style={codeStyles.actions}>
          <TouchableOpacity style={codeStyles.actionBtn} onPress={handleCopy} activeOpacity={0.7}>
            <Feather name={copied ? 'check' : 'copy'} size={13} color={copied ? colors.success : colors.textSecondary} />
            <Text style={[codeStyles.actionText, copied && { color: colors.success }]}>
              {copied ? 'Copiat!' : 'Copiază'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={codeStyles.actionBtn} onPress={handleSave} activeOpacity={0.7}>
            <Feather name={saved ? 'check' : 'download'} size={13} color={saved ? colors.success : colors.textSecondary} />
            <Text style={[codeStyles.actionText, saved && { color: colors.success }]}>
              {saved ? 'Salvat!' : 'Salvează'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={codeStyles.body}>
          <View style={codeStyles.lineNumbers}>
            {lines.map((_, i) => (
              <Text key={i} style={codeStyles.lineNum}>{i + 1}</Text>
            ))}
          </View>
          <View style={codeStyles.codeLines}>
            {tokenizedLines.map((tokens, i) => (
              <View key={i} style={codeStyles.codeLine}>
                {tokens.map((tok, j) => (
                  <Text key={j} style={[codeStyles.token, { color: SYNTAX_COLORS[tok.type] }]}>
                    {tok.text}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

interface Segment {
  type: 'text' | 'code_block' | 'inline_code' | 'heading' | 'bold' | 'bullet';
  content: string;
  language?: string;
  level?: number;
}

function parseMarkdown(text: string): Segment[] {
  const segments: Segment[] = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim() || 'typescript';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      segments.push({ type: 'code_block', content: codeLines.join('\n'), language: lang });
      continue;
    }

    if (line.startsWith('### ')) {
      segments.push({ type: 'heading', content: line.slice(4), level: 3 });
      i++; continue;
    }
    if (line.startsWith('## ')) {
      segments.push({ type: 'heading', content: line.slice(3), level: 2 });
      i++; continue;
    }
    if (line.startsWith('# ')) {
      segments.push({ type: 'heading', content: line.slice(2), level: 1 });
      i++; continue;
    }

    if (line.match(/^[*•\-]\s/) || line.match(/^\d+\.\s/)) {
      const content = line.replace(/^[*•\-]\s/, '').replace(/^\d+\.\s/, '');
      segments.push({ type: 'bullet', content });
      i++; continue;
    }

    if (line.trim()) {
      segments.push({ type: 'text', content: line });
    }
    i++;
  }

  return segments;
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <Text key={i} style={styles.bold}>{part.slice(2, -2)}</Text>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <Text key={i} style={styles.inlineCode}>{part.slice(1, -1)}</Text>;
    }
    return <Text key={i}>{part}</Text>;
  });
}

const MarkdownContent = memo(function MarkdownContent({ text, isUser }: { text: string; isUser: boolean }) {
  const segments = useMemo(() => parseMarkdown(text), [text]);

  return (
    <View>
      {segments.map((seg, i) => {
        switch (seg.type) {
          case 'code_block':
            return <CodeBlock key={i} code={seg.content} language={seg.language || 'typescript'} />;

          case 'heading':
            return (
              <Text key={i} style={[
                styles.heading,
                seg.level === 1 && styles.h1,
                seg.level === 2 && styles.h2,
                seg.level === 3 && styles.h3,
                isUser && styles.userHeading,
              ]}>
                {renderInline(seg.content)}
              </Text>
            );

          case 'bullet':
            return (
              <View key={i} style={styles.bulletRow}>
                <Text style={[styles.bulletDot, isUser && styles.userText]}>•</Text>
                <Text style={[styles.bulletText, isUser && styles.userText]}>
                  {renderInline(seg.content)}
                </Text>
              </View>
            );

          case 'text':
          default:
            return (
              <Text key={i} style={[styles.text, isUser ? styles.userText : styles.aiText]}>
                {renderInline(seg.content)}
              </Text>
            );
        }
      })}
    </View>
  );
});

function MessageContextMenu({
  visible, onClose, onCopy, onShare,
}: {
  visible: boolean; onClose: () => void;
  onCopy: () => void; onShare: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={menuStyles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={menuStyles.menu}>
          <TouchableOpacity style={menuStyles.item} onPress={onCopy} activeOpacity={0.7}>
            <Feather name="copy" size={16} color={colors.text} />
            <Text style={menuStyles.itemText}>Copiază mesaj</Text>
          </TouchableOpacity>
          <View style={menuStyles.divider} />
          <TouchableOpacity style={menuStyles.item} onPress={onShare} activeOpacity={0.7}>
            <Feather name="share-2" size={16} color={colors.text} />
            <Text style={menuStyles.itemText}>Trimite / Salvează</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function FeedbackToast({ visible, icon, label, color }: { visible: boolean; icon: 'check-circle' | 'share-2' | 'upload'; label: string; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      anim.setValue(0);
      Animated.sequence([
        Animated.spring(anim, { toValue: 1, tension: 120, friction: 8, useNativeDriver: true }),
        Animated.delay(1200),
        Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, anim]);

  if (!visible) return null;

  return (
    <Animated.View style={[toastStyles.container, {
      opacity: anim,
      transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
      borderColor: color + '44',
    }]}>
      <Feather name={icon} size={14} color={color} />
      <Text style={[toastStyles.text, { color }]}>{label}</Text>
    </Animated.View>
  );
}

const ChatBubble = memo(function ChatBubble({ message, index }: Props) {
  const isUser = message.role === 'user';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(isUser ? 20 : -20)).current;
  const [menuVisible, setMenuVisible] = useState(false);
  const [copied, setCopiedMsg] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 300, useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0, tension: 80, friction: 12, useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const timeStr = message.timestamp.toLocaleTimeString('ro-RO', {
    hour: '2-digit', minute: '2-digit',
  });

  const hasCode = message.content.includes('```');

  const handleLongPress = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMenuVisible(true);
  };

  const handleCopyMsg = () => {
    Clipboard.setString(message.content);
    setMenuVisible(false);
    setCopiedMsg(true);
    setShowCopyToast(true);
    setTimeout(() => {
      setCopiedMsg(false);
      setShowCopyToast(false);
    }, 2000);
  };

  const handleShareMsg = async () => {
    setMenuVisible(false);
    try {
      const path = `${documentDirectory ?? ''}jarvis_msg_${Date.now()}.txt`;
      await writeAsStringAsync(path, message.content);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) await Sharing.shareAsync(path, { mimeType: 'text/plain', dialogTitle: 'Trimite mesajul' });
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    } catch {
      /* ignore share failures */
    }
  };

  return (
    <>
      <MessageContextMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onCopy={handleCopyMsg}
        onShare={handleShareMsg}
      />
      <Animated.View
        style={[
          styles.container,
          isUser ? styles.userContainer : styles.aiContainer,
          { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
        ]}
      >
        {!isUser && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>J</Text>
          </View>
        )}
        <TouchableOpacity
          activeOpacity={0.95}
          onLongPress={handleLongPress}
          delayLongPress={400}
        >
          <View style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.aiBubble,
            hasCode && !isUser && styles.codeBubble,
          ]}>
            <MarkdownContent text={message.content} isUser={isUser} />
            <View style={styles.footer}>
              <Text style={[styles.time, isUser ? styles.userTime : styles.aiTime]}>
                {timeStr}
              </Text>
              {copied && (
                <Text style={styles.copiedLabel}>✓ Copiat</Text>
              )}
            </View>
          </View>
          {isUser && <View style={styles.userTail} />}
          {!isUser && <View style={styles.aiTail} />}
        </TouchableOpacity>
      </Animated.View>
      <FeedbackToast visible={showCopyToast} icon="check-circle" label="Copiat!" color={colors.success} />
      <FeedbackToast visible={showShareToast} icon="share-2" label="Trimis!" color={colors.accent} />
    </>
  );
});

export default ChatBubble;

const toastStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.success + '44',
  },
  text: {
    color: colors.success,
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
});

const menuStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  menu: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16, minWidth: 200, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border,
  },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 16,
  },
  itemText: {
    color: colors.text, fontSize: 15, fontFamily: 'Inter_500Medium',
  },
  divider: { height: 1, backgroundColor: colors.border },
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', marginVertical: 4, paddingHorizontal: 12, alignItems: 'flex-end',
  },
  userContainer: { justifyContent: 'flex-end' },
  aiContainer: { justifyContent: 'flex-start' },
  avatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8, marginBottom: 4,
  },
  avatarText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_700Bold' },
  bubble: {
    maxWidth: '85%', borderRadius: 18, paddingHorizontal: 14,
    paddingVertical: 10, paddingBottom: 6,
  },
  codeBubble: { maxWidth: '95%', paddingHorizontal: 8 },
  userBubble: {
    backgroundColor: colors.userBubble,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: colors.aiBubble,
    borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  userTail: {
    position: 'absolute',
    bottom: 0,
    right: -5,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderLeftColor: colors.userBubble,
    borderTopWidth: 8,
    borderTopColor: 'transparent',
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
    borderRightWidth: 0,
  },
  aiTail: {
    position: 'absolute',
    bottom: 0,
    left: -5,
    width: 0,
    height: 0,
    borderRightWidth: 8,
    borderRightColor: colors.aiBubble,
    borderTopWidth: 8,
    borderTopColor: 'transparent',
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
    borderLeftWidth: 0,
  },
  text: { fontSize: 15, lineHeight: 22 },
  userText: { color: colors.userBubbleText, fontFamily: 'Inter_400Regular' },
  aiText: { color: colors.aiBubbleText, fontFamily: 'Inter_400Regular' },
  bold: { fontFamily: 'Inter_700Bold' },
  inlineCode: {
    fontFamily: 'monospace', fontSize: 13,
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: '#CE9178', borderRadius: 4, paddingHorizontal: 4,
  },
  heading: { fontFamily: 'Inter_700Bold', color: colors.text, marginTop: 8, marginBottom: 4 },
  h1: { fontSize: 20 },
  h2: { fontSize: 17 },
  h3: { fontSize: 15, color: colors.primary },
  userHeading: { color: '#fff' },
  bulletRow: { flexDirection: 'row', marginVertical: 2, alignItems: 'flex-start' },
  bulletDot: { color: colors.primary, fontSize: 15, marginRight: 6, fontFamily: 'Inter_700Bold' },
  bulletText: { flex: 1, color: colors.aiBubbleText, fontSize: 15, lineHeight: 22, fontFamily: 'Inter_400Regular' },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 6, marginTop: 4 },
  time: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  userTime: { color: 'rgba(255,255,255,0.6)' },
  aiTime: { color: colors.textMuted },
  copiedLabel: { fontSize: 10, color: colors.success, fontFamily: 'Inter_500Medium' },
});

const codeStyles = StyleSheet.create({
  wrapper: {
    marginVertical: 8, borderRadius: 10, overflow: 'hidden',
    backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#3C3C3C',
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#2D2D2D', paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#3C3C3C',
  },
  dots: { flexDirection: 'row', gap: 5, marginRight: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  langLabel: { color: '#888', fontSize: 11, fontFamily: 'monospace', flex: 1, marginLeft: 4 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  actionText: { color: colors.textSecondary, fontSize: 11, fontFamily: 'Inter_400Regular' },
  body: { flexDirection: 'row', padding: 12 },
  lineNumbers: { marginRight: 12, alignItems: 'flex-end' },
  lineNum: { color: '#858585', fontSize: 12, fontFamily: 'monospace', lineHeight: 20 },
  codeLines: { flex: 1 },
  codeLine: { flexDirection: 'row', flexWrap: 'wrap', minHeight: 20 },
  token: { fontSize: 12, fontFamily: 'monospace', lineHeight: 20 },
  copyFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.success,
    borderRadius: 10,
    zIndex: 10,
  },
});
