
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useAIProvider, providerLabel } from '@/context/AIProviderContext';
import type { AIProvider } from '@/engine/aiProviders';
import { getKeysForProvider, saveKeysForProvider, testKey } from '@/engine/code-studio/keyManager';

const { colors } = Colors;

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface Props {
  visible: boolean;
  onClose: () => void;
}

const PROVIDER_OPTIONS: { id: AIProvider; label: string; icon: FeatherIconName; desc: string }[] = [
  {
    id: 'none',
    label: 'Fără AI cloud',
    icon: 'slash',
    desc: 'Jarvis folosește doar cunoașterea locală și căutarea web.',
  },
  {
    id: 'auto',
    label: 'Automat (Free Fallback)',
    icon: 'refresh-cw',
    desc: 'Incearcă Gemini → Groq → OpenRouter. Ideal pentru disponibilitate maximă.',
  },
  {
    id: 'gemini',
    label: 'Gemini Flash (Google)',
    icon: 'zap',
    desc: 'Gemini 2.0 Flash — gratuit cu cheie din Google AI Studio.',
  },
  {
    id: 'openai',
    label: 'ChatGPT (GPT-4.1 mini)',
    icon: 'message-circle',
    desc: 'Model OpenAI avansat. Necesită cheie API cu credit activ.',
  },
  {
    id: 'groq',
    label: 'Groq (Llama 3.3 / Mixtral)',
    icon: 'cpu',
    desc: 'Ultra-rapid și GRATUIT. Llama 3.3 70B. Suportă rotație chei (3 sloturi).',
  },
  {
    id: 'openrouter',
    label: 'OpenRouter (modele gratuite)',
    icon: 'globe',
    desc: 'Acces la modele gratuite: Llama, Mistral, Gemma. Suportă rotație chei (3 sloturi).',
  },
];

interface KeySectionProps {
  title: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  showKey: boolean;
  toggleShow: () => void;
  onTest: () => void;
  isTesting: boolean;
  clearError: () => void;
}

function KeySection({ title, hint, value, onChange, placeholder, showKey, toggleShow, onTest, isTesting, clearError }: KeySectionProps) {
  return (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>
        <Text style={styles.cardHint}>{hint}</Text>
        <View style={styles.keyRow}>
          <View style={styles.keyInputWrapper}>
            <TextInput
              style={styles.keyInput}
              value={value}
              onChangeText={v => { onChange(v); clearError(); }}
              placeholder={placeholder}
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={toggleShow}>
              <Feather name={showKey ? 'eye-off' : 'eye'} size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.testBtn, (!value.trim() || isTesting) && styles.testBtnDisabled]}
            onPress={onTest}
            disabled={!value.trim() || isTesting}
          >
            {isTesting
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.testBtnText}>Testează</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

export default function AIProviderModal({ visible, onClose }: Props) {
  const {
    settings, isTesting, testError, secureStoreFallback,
    setActiveProvider, saveGeminiKey, saveOpenAIKey, saveGroqKey, saveOpenRouterKey,
    testKey: contextTestKey, clearError,
  } = useAIProvider();

  const [geminiInput, setGeminiInput] = useState(settings.geminiKey);
  const [openaiInput, setOpenaiInput] = useState(settings.openaiKey);
  
  const [groqKeys, setGroqKeys] = useState<string[]>(['', '', '']);
  const [openrouterKeys, setOpenrouterKeys] = useState<string[]>(['', '', '']);
  
  const [testingSlots, setTestingSlots] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});

  const [savingProvider, setSavingProvider] = useState<AIProvider | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (visible) {
      setGeminiInput(settings.geminiKey);
      setOpenaiInput(settings.openaiKey);
      
      const loadMultiKeys = async () => {
          const g = await getKeysForProvider('groq');
          const o = await getKeysForProvider('openrouter');
          setGroqKeys([...g.map(k => k.key), '', '', ''].slice(0, 3));
          setOpenrouterKeys([...o.map(k => k.key), '', '', ''].slice(0, 3));
      };
      loadMultiKeys();

      setSuccessMsg('');
      setLocalError('');
    }
  }, [visible, settings.geminiKey, settings.openaiKey]);

  const handleSelectProvider = async (provider: AIProvider) => {
    if (provider === 'auto') {
      const hasAnyFreeKey = settings.geminiKey || groqKeys.some(k => k.trim()) || openrouterKeys.some(k => k.trim());
      if (!hasAnyFreeKey) {
        Alert.alert('Chei lipsă', 'Adaugă cel puțin o cheie pentru Gemini, Groq sau OpenRouter pentru a folosi modul Automat.', [{ text: 'OK' }]);
        return;
      }
    } else if (provider === 'gemini' && !settings.geminiKey) {
        Alert.alert('Cheie lipsă', 'Adaugă o cheie Gemini mai întâi.', [{ text: 'OK' }]);
        return;
    } else if (provider === 'openai' && !settings.openaiKey) {
        Alert.alert('Cheie lipsă', 'Adaugă o cheie OpenAI mai întâi.', [{ text: 'OK' }]);
        return;
    } else if (provider === 'groq' && !groqKeys.some(k => k.trim())) {
        Alert.alert('Cheie lipsă', 'Adaugă cel puțin o cheie Groq mai întâi.', [{ text: 'OK' }]);
        return;
    } else if (provider === 'openrouter' && !openrouterKeys.some(k => k.trim())) {
        Alert.alert('Cheie lipsă', 'Adaugă cel puțin o cheie OpenRouter mai întâi.', [{ text: 'OK' }]);
        return;
    }

    setSavingProvider(provider);
    clearError();
    setSuccessMsg('');
    await setActiveProvider(provider);
    setSavingProvider(null);
    if (provider !== 'none') {
      setSuccessMsg(`${providerLabel(provider)} activat!`);
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  const handleTestSlot = async (provider: 'groq' | 'openrouter', index: number) => {
      const slotId = `${provider}-${index}`;
      setTestingSlots(prev => ({ ...prev, [slotId]: true }));
      setTestResults(prev => ({ ...prev, [slotId]: null }));
      
      const ok = await testKey(provider, index);
      
      setTestingSlots(prev => ({ ...prev, [slotId]: false }));
      setTestResults(prev => ({ ...prev, [slotId]: ok }));
      if (ok) {
          setSuccessMsg(`✅ Cheia ${provider.toUpperCase()} #${index + 1} funcționează!`);
          setTimeout(() => setSuccessMsg(''), 3000);
      } else {
          setLocalError(`❌ Cheia ${provider.toUpperCase()} #${index + 1} nu a putut fi validată.`);
      }
  };

  const handleTest = async (
    provider: 'gemini' | 'openai' | 'groq' | 'openrouter',
    input: string,
    saveFn: (k: string) => Promise<void>,
  ) => {
    clearError();
    setLocalError('');
    setSuccessMsg('');
    const trimmed = input.trim();
    if (trimmed.length < 10) {
      setLocalError('Cheia este prea scurtă. Lipește cheia completă.');
      return;
    }
    const ok = await contextTestKey(provider, trimmed);
    if (ok) {
      await saveFn(trimmed);
      await setActiveProvider(provider);
      setSuccessMsg(`✅ ${providerLabel(provider)} activat și funcționează!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleUpdateMultiKey = async (provider: 'groq' | 'openrouter', index: number, val: string) => {
      if (provider === 'groq') {
          const next = [...groqKeys];
          next[index] = val;
          setGroqKeys(next);
          await saveKeysForProvider('groq', next);
          if (index === 0) await saveGroqKey(val);
      } else {
          const next = [...openrouterKeys];
          next[index] = val;
          setOpenrouterKeys(next);
          await saveKeysForProvider('openrouter', next);
          if (index === 0) await saveOpenRouterKey(val);
      }
      setTestResults(prev => ({ ...prev, [`${provider}-${index}`]: null }));
  };

  const toggleKey = (k: string) => setShowKeys(prev => ({ ...prev, [k]: !prev[k] }));

  const handleClose = () => {
    clearError();
    setSuccessMsg('');
    setLocalError('');
    onClose();
  };

  const displayError = localError || testError;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Cloud Provider</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Feather name="x" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.desc}>
            Jarvis funcționează complet offline. Dacă adaugi o cheie API, va folosi AI cloud
            pentru întrebări complexe. Cheile sunt stocate LOCAL, doar pe telefonul tău.
          </Text>

          <Text style={styles.sectionTitle}>Selectează providerul activ</Text>
          {PROVIDER_OPTIONS.map((opt, index) => {
            const isActive = settings.activeProvider === opt.id;
            const isLoading = savingProvider === opt.id;
            return (
              <TouchableOpacity
                key={`item-${index}`}
                style={[styles.providerCard, isActive && styles.providerCardActive]}
                onPress={() => handleSelectProvider(opt.id)}
                activeOpacity={0.75}
              >
                <View style={[styles.providerIcon, isActive && styles.providerIconActive]}>
                  {isLoading
                    ? <ActivityIndicator size="small" color={colors.primary} />
                    : <Feather name={opt.icon} size={20} color={isActive ? colors.primary : colors.textSecondary} />
                  }
                </View>
                <View style={styles.providerInfo}>
                  <Text style={[styles.providerLabel, isActive && styles.providerLabelActive]}>{opt.label}</Text>
                  <Text style={styles.providerDesc}>{opt.desc}</Text>
                </View>
                {isActive && <Feather name="check-circle" size={18} color={colors.primary} />}
              </TouchableOpacity>
            );
          })}

          <KeySection
            title="Cheie API Gemini"
            hint="Obține gratuit de la aistudio.google.com"
            value={geminiInput}
            onChange={setGeminiInput}
            placeholder="AIzaSy... (lipește cheia)"
            showKey={!!showKeys.gemini}
            toggleShow={() => toggleKey('gemini')}
            onTest={() => handleTest('gemini', geminiInput, saveGeminiKey)}
            isTesting={isTesting}
            clearError={() => { setLocalError(''); clearError(); }}
          />

          <KeySection
            title="Cheie API ChatGPT"
            hint="Obține de la platform.openai.com/api-keys"
            value={openaiInput}
            onChange={setOpenaiInput}
            placeholder="sk-... (lipește cheia)"
            showKey={!!showKeys.openai}
            toggleShow={() => toggleKey('openai')}
            onTest={() => handleTest('openai', openaiInput, saveOpenAIKey)}
            isTesting={isTesting}
            clearError={() => { setLocalError(''); clearError(); }}
          />

          <Text style={styles.sectionTitle}>Chei API Groq (GRATUIT)</Text>
          <View style={styles.card}>
              <Text style={styles.cardHint}>Obține de la console.groq.com. Suportă rotație automată.</Text>
              {groqKeys.map((key, i) => (
                  <View key={`groq-${i}`} style={[styles.keyRow, { marginBottom: i < 2 ? 8 : 0 }]}>
                      <View style={styles.keyInputWrapper}>
                          <TextInput
                              style={styles.keyInput}
                              value={key}
                              onChangeText={v => handleUpdateMultiKey('groq', i, v)}
                              placeholder={`Groq #${i + 1}`}
                              placeholderTextColor={colors.textMuted}
                              secureTextEntry={!showKeys.groq}
                              autoCapitalize="none"
                          />
                      </View>
                      <TouchableOpacity
                          style={[styles.smallTestBtn, (!key.trim() || testingSlots[`groq-${i}`]) && styles.testBtnDisabled]}
                          onPress={() => handleTestSlot('groq', i)}
                          disabled={!key.trim() || testingSlots[`groq-${i}`]}
                      >
                          {testingSlots[`groq-${i}`] 
                            ? <ActivityIndicator size="small" color="#fff" />
                            : testResults[`groq-${i}`] !== null
                              ? <Feather name={testResults[`groq-${i}`] ? 'check' : 'x'} size={16} color="#fff" />
                              : <Text style={styles.testBtnText}>Test</Text>
                          }
                      </TouchableOpacity>
                  </View>
              ))}
          </View>

          <Text style={styles.sectionTitle}>Chei API OpenRouter (GRATUIT)</Text>
          <View style={styles.card}>
              <Text style={styles.cardHint}>Obține de la openrouter.ai. Suportă rotație automată.</Text>
              {openrouterKeys.map((key, i) => (
                  <View key={`or-${i}`} style={[styles.keyRow, { marginBottom: i < 2 ? 8 : 0 }]}>
                      <View style={styles.keyInputWrapper}>
                          <TextInput
                              style={styles.keyInput}
                              value={key}
                              onChangeText={v => handleUpdateMultiKey('openrouter', i, v)}
                              placeholder={`OpenRouter #${i + 1}`}
                              placeholderTextColor={colors.textMuted}
                              secureTextEntry={!showKeys.openrouter}
                              autoCapitalize="none"
                          />
                      </View>
                      <TouchableOpacity
                          style={[styles.smallTestBtn, (!key.trim() || testingSlots[`openrouter-${i}`]) && styles.testBtnDisabled]}
                          onPress={() => handleTestSlot('openrouter', i)}
                          disabled={!key.trim() || testingSlots[`openrouter-${i}`]}
                      >
                          {testingSlots[`openrouter-${i}`] 
                            ? <ActivityIndicator size="small" color="#fff" />
                            : testResults[`openrouter-${i}`] !== null
                              ? <Feather name={testResults[`openrouter-${i}`] ? 'check' : 'x'} size={16} color="#fff" />
                              : <Text style={styles.testBtnText}>Test</Text>
                          }
                      </TouchableOpacity>
                  </View>
              ))}
          </View>

          {displayError ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={14} color={colors.error} />
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          ) : null}
          {successMsg ? (
            <View style={styles.successBox}>
              <Feather name="check-circle" size={14} color={colors.success} />
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          ) : null}

          {secureStoreFallback && (
            <View style={[styles.infoBox, { borderColor: colors.warning + '55', backgroundColor: colors.warning + '18' }]}>
              <Feather name="alert-triangle" size={14} color={colors.warning} />
              <Text style={[styles.infoText, { color: colors.warning }]}>
                Stocarea securizată (Keychain/Keystore) nu este disponibilă. Cheile sunt salvate în stocarea locală standard.
              </Text>
            </View>
          )}
          <View style={styles.infoBox}>
            <Feather name="shield" size={14} color={colors.textMuted} />
            <Text style={styles.infoText}>
              Pe Android/iOS cheile sunt stocate în Keystore/Keychain (zona securizată). Jarvis nu trimite cheile pe niciun server propriu — toate apelurile merg direct de pe telefonul tău.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { fontSize: 20, fontFamily: 'Inter_700Bold', color: colors.text },
  closeBtn: { padding: 4 },
  scroll: { flex: 1, padding: 16 },
  desc: {
    fontSize: 13, color: colors.textSecondary, fontFamily: 'Inter_400Regular',
    lineHeight: 20, marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 11, fontFamily: 'Inter_600SemiBold', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 1,
    marginTop: 20, marginBottom: 8, marginLeft: 4,
  },
  providerCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: colors.border, gap: 12,
  },
  providerCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(108,99,255,0.08)',
  },
  providerIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  providerIconActive: { backgroundColor: 'rgba(108,99,255,0.15)' },
  providerInfo: { flex: 1 },
  providerLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: colors.textSecondary },
  providerLabelActive: { color: colors.text },
  providerDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.textMuted, marginTop: 2 },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12, padding: 14, marginBottom: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  cardHint: { fontSize: 12, color: colors.textMuted, fontFamily: 'Inter_400Regular', marginBottom: 10 },
  keyRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  keyInputWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surfaceHigh,
    borderRadius: 10, borderWidth: 1, borderColor: colors.border,
  },
  keyInput: {
    flex: 1, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 13, color: colors.text, fontFamily: 'Inter_400Regular',
  },
  eyeBtn: { paddingHorizontal: 10, paddingVertical: 10 },
  testBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    alignItems: 'center', justifyContent: 'center', minWidth: 80,
  },
  smallTestBtn: {
      backgroundColor: colors.surfaceHigh,
      borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
      alignItems: 'center', justifyContent: 'center', minWidth: 60,
      borderWidth: 1, borderColor: colors.border,
  },
  testBtnDisabled: { backgroundColor: colors.surfaceHigh, opacity: 0.5 },
  testBtnText: { color: colors.textSecondary, fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,82,82,0.1)',
    borderRadius: 10, padding: 12, marginTop: 8,
    borderWidth: 1, borderColor: 'rgba(255,82,82,0.2)',
  },
  errorText: { color: colors.error, fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },
  successBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(0,230,118,0.1)',
    borderRadius: 10, padding: 12, marginTop: 8,
    borderWidth: 1, borderColor: 'rgba(0,230,118,0.2)',
  },
  successText: { color: colors.success, fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10, padding: 12, marginTop: 20, marginBottom: 32, gap: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  infoText: { fontSize: 12, color: colors.textMuted, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 18 },
});
