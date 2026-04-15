import { Platform } from 'react-native';
import {
  readAsStringAsync,
  getInfoAsync,
  StorageAccessFramework,
} from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { writeMemoryEntry, type MemoryCategory } from './memoryFolder';

const FOLDERS_KEY = '@jarvis_external_folders';

export interface ExternalFolder {
  uri: string;
  name: string;
  addedAt: string;
  lastScanned?: string;
  fileCount?: number;
}

async function loadFolders(): Promise<ExternalFolder[]> {
  try {
    const raw = await AsyncStorage.getItem(FOLDERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ExternalFolder[];
  } catch {
    return [];
  }
}

async function saveFolders(folders: ExternalFolder[]): Promise<void> {
  await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

export async function getExternalFolders(): Promise<ExternalFolder[]> {
  return loadFolders();
}

export async function requestFolderAccess(): Promise<ExternalFolder | null> {
  if (Platform.OS === 'web') return null;

  try {
    if (Platform.OS === 'android') {
      const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) return null;

      const uri = permissions.directoryUri;
      const name = decodeURIComponent(uri.split('%2F').pop() || uri.split('/').pop() || 'Folder');

      const folder: ExternalFolder = {
        uri,
        name,
        addedAt: new Date().toISOString(),
      };

      const existing = await loadFolders();
      if (!existing.some(f => f.uri === uri)) {
        existing.push(folder);
        await saveFolders(existing);
      }

      return folder;
    }

    return null;
  } catch {
    return null;
  }
}

export async function removeExternalFolder(uri: string): Promise<void> {
  const folders = await loadFolders();
  await saveFolders(folders.filter(f => f.uri !== uri));
}

const TEXT_EXTENSIONS = ['.txt', '.md', '.json', '.csv', '.log', '.xml', '.html', '.js', '.ts', '.py', '.java', '.c', '.cpp', '.h', '.css', '.sql', '.yaml', '.yml', '.ini', '.cfg', '.sh', '.bat'];

const SENSITIVE_PATTERNS = /^\.env|\.pem$|\.key$|\.secret|password|credentials|\.p12$|\.pfx$|\.jks$/i;

function isSensitiveFile(name: string): boolean {
  return SENSITIVE_PATTERNS.test(name);
}

function isTextFile(name: string): boolean {
  const lower = name.toLowerCase();
  return TEXT_EXTENSIONS.some(ext => lower.endsWith(ext));
}

function categorizeContent(text: string): MemoryCategory {
  const lower = text.toLowerCase();
  if (/\b(prefer|imi place|favorit|ador)\b/.test(lower)) return 'preferinta';
  if (/\b(plan|trebuie sa|vreau sa|obiectiv|target)\b/.test(lower)) return 'plan';
  if (/\b(lucrez|munca|job|firma|companie|proiect)\b/.test(lower)) return 'munca';
  if (/\b(adresa|oras|strada|locuiesc|tara)\b/.test(lower)) return 'locatie';
  if (/\b(function|class|import|export|const|var|let|def |return)\b/.test(lower)) return 'tehnic';
  return 'general';
}

function extractUsefulSentences(content: string, maxSentences = 50): string[] {
  const sentences = content
    .replace(/\r\n/g, '\n')
    .split(/[.\n!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 15 && s.length < 300);

  const useful = sentences.filter(s => {
    const lower = s.toLowerCase();
    if (/^(copyright|license|version|todo|fixme|hack)/i.test(s)) return false;
    if (/^\s*[{}\[\]<>\/\\]/.test(s)) return false;
    if (/^[#*\-=]+$/.test(s)) return false;
    const hasInfo = /\b(este|sunt|are|poate|trebuie|contine|produce|functioneaza|inseamna|reprezinta|prefer|lucrez|locuiesc|stiu|cred|vreau|plan)\b/i.test(lower);
    const hasContent = s.split(/\s+/).length >= 4;
    return hasInfo || hasContent;
  });

  return useful.slice(0, maxSentences);
}

export async function scanAndProcessFolder(
  folderUri: string,
  onProgress?: (current: number, total: number, fileName: string) => void,
): Promise<{ filesProcessed: number; factsExtracted: number }> {
  let filesProcessed = 0;
  let factsExtracted = 0;

  try {
    const files = await StorageAccessFramework.readDirectoryAsync(folderUri);
    const textFiles = files.filter(f => {
      const name = decodeURIComponent(f.split('%2F').pop() || f);
      return isTextFile(name) && !isSensitiveFile(name);
    });

    for (let i = 0; i < textFiles.length; i++) {
      const fileUri = textFiles[i];
      const fileName = decodeURIComponent(fileUri.split('%2F').pop() || fileUri.split('/').pop() || 'unknown');

      if (onProgress) onProgress(i + 1, textFiles.length, fileName);

      try {
        const content = await StorageAccessFramework.readAsStringAsync(fileUri);
        if (!content || content.trim().length < 20) continue;

        const truncated = content.slice(0, 20000);
        const sentences = extractUsefulSentences(truncated);

        for (const sentence of sentences) {
          const category = categorizeContent(sentence);
          const written = await writeMemoryEntry(sentence, `fișier: ${fileName}`, category, fileName);
          if (written) factsExtracted++;
        }

        filesProcessed++;
      } catch { /* skip unreadable files */ }
    }

    const folders = await loadFolders();
    const folder = folders.find(f => f.uri === folderUri);
    if (folder) {
      folder.lastScanned = new Date().toISOString();
      folder.fileCount = textFiles.length;
      await saveFolders(folders);
    }
  } catch {
    if (__DEV__) console.warn('[ExternalFolders] Scan failed for:', folderUri);
  }

  return { filesProcessed, factsExtracted };
}

export async function scanAllFolders(
  onProgress?: (folderName: string, current: number, total: number) => void,
): Promise<{ totalFiles: number; totalFacts: number }> {
  const folders = await loadFolders();
  let totalFiles = 0;
  let totalFacts = 0;

  for (let i = 0; i < folders.length; i++) {
    if (onProgress) onProgress(folders[i].name, i + 1, folders.length);
    const result = await scanAndProcessFolder(folders[i].uri);
    totalFiles += result.filesProcessed;
    totalFacts += result.factsExtracted;
  }

  return { totalFiles, totalFacts };
}
