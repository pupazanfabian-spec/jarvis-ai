
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
    desc: 'Ultra-rapid și GRATUIT. Llama 3.3 70B. Cheie de la console.groq.com',
  },
  {
    id: 'openrouter',
    label: 'OpenRouter (modele gratuite)',
    icon: 'globe',
    desc: 'Acces la modele gratuite: Llama, Mistral, Gemma. Cheie de la openrouter.ai',
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
    testKey, clearError,
  } = useAIProvider();

  const [geminiInput, setGeminiInput] = useState(settings.geminiKey);
  const [openaiInput, setOpenaiInput] = useState(settings.openaiKey);
  const [groqInput, setGroqInput] = useState(settings.groqKey);
  const [openrouterInput, setOpenrouterInput] = useState(settings.openrouterKey);
  const [savingProvider, setSavingProvider] = useState<AIProvider | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (visible) {
      setGeminiInput(settings.geminiKey);
      setOpenaiInput(settings.openaiKey);
      setGroqInput(settings.groqKey);
      setOpenrouterInput(settings.openrouterKey);
      setSuccessMsg('');
      setLocalError('');
    }
  }, [visible, settings.geminiKey, settings.openaiKey, settings.groqKey, settings.openrouterKey]);

  const handleSelectProvider = async (provider: AIProvider) => {
    const keyMap: Record<string, string> = {
      gemini: settings.geminiKey,
      openai: settings.openaiKey,
      groq: settings.groqKey,
      openrouter: settings.openrouterKey,
    };
    if (provider !== 'none' && !keyMap[provider]) {
      Alert.alert('Cheie lipsă', 'Adaugă și validează o cheie API mai întâi, apoi poți activa providerul.', [{ text: 'OK' }]);
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
    const ok = await testKey(provider, trimmed);
    if (ok) {
      await saveFn(trimmed);
      await setActiveProvider(provider);
      setSuccessMsg(`✅ ${providerLabel(provider)} activat și funcționează!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
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
          {PROVIDER_OPTIONS.map(opt => {
            const isActive = settings.activeProvider === opt.id;
            const isLoading = savingProvider === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
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

          <KeySection
            title="Cheie API Groq (GRATUIT)"
            hint="Obține gratuit de la console.groq.com/keys — ultra-rapid!"
            value={groqInput}
            onChange={setGroqInput}
            placeholder="gsk_... (lipește cheia)"
            showKey={!!showKeys.groq}
            toggleShow={() => toggleKey('groq')}
            onTest={() => handleTest('groq', groqInput, saveGroqKey)}
            isTesting={isTesting}
            clearError={() => { setLocalError(''); clearError(); }}
          />

          <KeySection
            title="Cheie API OpenRouter (GRATUIT)"
            hint="Obține gratuit de la openrouter.ai/keys — modele Llama, Mistral, Gemma"
            value={openrouterInput}
            onChange={setOpenrouterInput}
            placeholder="sk-or-... (lipește cheia)"
            showKey={!!showKeys.openrouter}
            toggleShow={() => toggleKey('openrouter')}
            onTest={() => handleTest('openrouter', openrouterInput, saveOpenRouterKey)}
            isTesting={isTesting}
            clearError={() => { setLocalError(''); clearError(); }}
          />

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
  testBtnDisabled: { backgroundColor: colors.surfaceHigh },
  testBtnText: { color: '#fff', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
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
