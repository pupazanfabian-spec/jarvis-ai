
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
    const updated = keys.filter(k => k.provider.toLowerCase() !== provider.toLowerCase());
    updated.push({ provider, key: key.trim() });
    await AsyncStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to add API key', e);
  }
}

export async function deleteKey(provider: string) {
  try {
    const keys = await getKeys();
    const updated = keys.filter(k => k.provider.toLowerCase() !== provider.toLowerCase());
    await AsyncStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete API key', e);
  }
}

export async function getKeyForProvider(provider: 'groq' | 'openrouter'): Promise<string | null> {
  try {
    const keys = await getKeys();
    const found = keys.find(k => k.provider.toLowerCase() === provider.toLowerCase());
    if (found) return found.key;
    
    // Fallback to any available key if specific one missing
    if (keys.length > 0) return keys[0].key;
    
    return null;
  } catch {
    return null;
  }
}

export async function hasValidKey(provider: 'groq' | 'openrouter'): Promise<boolean> {
    const key = await getKeyForProvider(provider);
    return !!(key && key.length > 10);
}

export async function validateKey(provider: string, key: string): Promise<boolean> {
    try {
        const { testGroqKeyDetailed, testOpenRouterKeyDetailed } = await import('@/engine/aiProviders');
        let result: { ok: boolean };
        if (provider.toLowerCase() === 'groq') {
            result = await testGroqKeyDetailed(key);
        } else {
            result = await testOpenRouterKeyDetailed(key);
        }
        return result.ok;
    } catch {
        return false;
    }
}

export async function syncKeysFromContext(settings: any) {
  try {
    const currentKeys = await getKeys();
    let changed = false;

    if (settings.groqKey && !currentKeys.find(k => k.provider.toLowerCase() === 'groq')) {
      currentKeys.push({ provider: 'Groq', key: settings.groqKey });
      changed = true;
    }
    if (settings.openrouterKey && !currentKeys.find(k => k.provider.toLowerCase() === 'openrouter')) {
      currentKeys.push({ provider: 'OpenRouter', key: settings.openrouterKey });
      changed = true;
    }

    if (changed) {
      await AsyncStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(currentKeys));
    }
  } catch (e) {
    console.error('Sync keys failed', e);
  }
}
