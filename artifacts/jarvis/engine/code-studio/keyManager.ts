
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS_STORAGE_KEY = '@jarvis_api_keys';
const INDEX_STORAGE_PREFIX = '@jarvis_key_index_';

export interface APIKey {
  provider: string;
  key: string;
  index: number;
  label?: string;
  failed?: boolean;
  failedAt?: number;
}

export async function getKeys(): Promise<APIKey[]> {
  try {
    const saved = await AsyncStorage.getItem(KEYS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export async function getKeysForProvider(provider: string): Promise<APIKey[]> {
  const keys = await getKeys();
  return keys.filter(k => k.provider.toLowerCase() === provider.toLowerCase());
}

export async function getWorkingKey(provider: 'groq' | 'openrouter'): Promise<string | null> {
    const keys = await getKeysForProvider(provider);
    const now = Date.now();
    // 15 minute = 900000 ms
    const workingKeys = keys.filter(k => !k.failed || (k.failedAt && (now - k.failedAt > 900000)));

    if (workingKeys.length === 0) return null;

    return await getNextKey(provider, workingKeys);
}

export async function getNextKey(provider: string, workingKeys?: APIKey[]): Promise<string | null> {
    const keys = workingKeys || await getKeysForProvider(provider);
    if (keys.length === 0) return null;

    const indexKey = `${INDEX_STORAGE_PREFIX}${provider.toLowerCase()}`;
    const currentIndexStr = await AsyncStorage.getItem(indexKey);
    const currentIndex = currentIndexStr ? parseInt(currentIndexStr, 10) : 0;

    const nextIndex = (currentIndex + 1) % keys.length;
    await AsyncStorage.setItem(indexKey, nextIndex.toString());

    return keys[nextIndex].key;
}

export async function markKeyFailed(provider: string, key: string) {
    const allKeys = await getKeys();
    const updated = allKeys.map(k => {
        if (k.provider.toLowerCase() === provider.toLowerCase() && k.key === key) {
            return { ...k, failed: true, failedAt: Date.now() };
        }
        return k;
    });
    await AsyncStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(updated));
}

export async function addKey(provider: string, key: string) {
  try {
    const keys = await getKeys();
    const providerKeys = keys.filter(k => k.provider.toLowerCase() === provider.toLowerCase());
    const newKey: APIKey = { 
        provider, 
        key: key.trim(), 
        index: providerKeys.length,
        label: `${provider} #${providerKeys.length + 1}`
    };
    const updated = [...keys.filter(k => !(k.provider.toLowerCase() === provider.toLowerCase() && k.key === key.trim())), newKey];
    await AsyncStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to add API key', e);
  }
}

export async function saveKeysForProvider(provider: string, keyStrings: string[]) {
    try {
        const allKeys = await getKeys();
        const otherKeys = allKeys.filter(k => k.provider.toLowerCase() !== provider.toLowerCase());
        
        const newProviderKeys: APIKey[] = keyStrings
            .filter(k => k.trim().length > 0)
            .map((k, i) => ({
                provider,
                key: k.trim(),
                index: i,
                label: `${provider} #${i + 1}`
            }));
            
        const updated = [...otherKeys, ...newProviderKeys];
        await AsyncStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
        console.error(`Failed to save keys for ${provider}`, e);
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
