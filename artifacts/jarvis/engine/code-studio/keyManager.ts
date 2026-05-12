
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

export async function getKeyForProvider(provider: string): Promise<string | null> {
  const keys = await getKeys();
  const found = keys.find(k => k.provider.toLowerCase() === provider.toLowerCase());
  return found ? found.key : null;
}

/**
 * Validates an API key by making a minimal test call.
 */
export async function validateKey(provider: string, key: string): Promise<boolean> {
  const p = provider.toLowerCase();
  try {
    if (p === 'groq') {
      const resp = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${key}` }
      });
      return resp.ok;
    }
    if (p === 'openrouter') {
      const resp = await fetch('https://openrouter.ai/api/v1/models', {
        headers: { 'Authorization': `Bearer ${key}` }
      });
      return resp.ok;
    }
    // For Gemini/OpenAI, we can add similar checks if needed
    return key.length > 10;
  } catch {
    return false;
  }
}

/**
 * Syncs keys from legacy storage keys or context settings.
 */
export async function syncKeysFromContext(settings: any) {
  try {
    const currentKeys = await getKeys();
    let changed = false;

    // Check individual AsyncStorage keys first (legacy)
    const groqLegacy = await AsyncStorage.getItem('@groq_api_key');
    const orLegacy = await AsyncStorage.getItem('@openrouter_api_key');

    if (groqLegacy && !currentKeys.find(k => k.provider.toLowerCase() === 'groq')) {
      currentKeys.push({ provider: 'Groq', key: groqLegacy });
      changed = true;
    }
    if (orLegacy && !currentKeys.find(k => k.provider.toLowerCase() === 'openrouter')) {
      currentKeys.push({ provider: 'OpenRouter', key: orLegacy });
      changed = true;
    }

    // Then check settings from AIProviderContext
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
