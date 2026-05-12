
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS_STORAGE_KEY = '@jarvis_api_keys';

export interface APIKey {
  provider: string;
  key: string;
}

export async function getKeys(): Promise<APIKey[]> {
  try {
    const saved = await AsyncStorage.getItem(KEYS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export async function addKey(provider: string, key: string) {
  try {
    const keys = await getKeys();
    const updated = keys.filter(k => k.provider !== provider);
    updated.push({ provider, key: key.trim() });
    await AsyncStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to add API key', e);
  }
}

export async function deleteKey(provider: string) {
  try {
    const keys = await getKeys();
    const updated = keys.filter(k => k.provider !== provider);
    await AsyncStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete API key', e);
  }
}

export async function getKeyForProvider(provider: string): Promise<string | null> {
  const keys = await getKeys();
  const found = keys.find(k => k.provider.toLowerCase() === provider.toLowerCase());
  return found ? found.key : null;
}

/**
 * Syncs keys from AIProviderContext if local studio keys are missing.
 * This is called internally when needed.
 */
export async function syncKeysFromContext(settings: any) {
  const currentKeys = await getKeys();
  let changed = false;
  
  if (settings.groqKey && !currentKeys.find(k => k.provider === 'Groq')) {
    currentKeys.push({ provider: 'Groq', key: settings.groqKey });
    changed = true;
  }
  
  if (settings.openrouterKey && !currentKeys.find(k => k.provider === 'OpenRouter')) {
    currentKeys.push({ provider: 'OpenRouter', key: settings.openrouterKey });
    changed = true;
  }

  if (changed) {
    await AsyncStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(currentKeys));
  }
}
