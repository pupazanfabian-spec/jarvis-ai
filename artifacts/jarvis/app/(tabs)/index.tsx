import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { getAllProjects, setActiveProject as switchActiveProject, Project } from '@/engine/projectMemory';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';

import ChatBubble from '@/components/ChatBubble';
import ThinkingIndicator from '@/components/ThinkingIndicator';
import QuickActions from '@/components/QuickActions';
import MemoryModal from '@/components/MemoryModal';
import MemoryManager from '@/components/MemoryManager';
import FileUploadModal from '@/components/FileUploadModal';
import PinScreen from '@/components/PinScreen';
import ModelSetupScreen from '@/components/ModelSetupScreen';
import FloatingBubble from '@/components/FloatingBubble';
import AIProviderModal from '@/components/AIProviderModal';
import KnowledgeScreen from '@/components/KnowledgeScreen';
import CodeSandboxScreen from '@/components/CodeSandboxScreen';
import { useBrain } from '@/context/BrainContext';
import { useLLM } from '@/context/LLMContext';
import { usePin } from '@/context/PinContext';
import { useAIProvider, providerIcon, providerLabel } from '@/context/AIProviderContext';
import { useDevMode } from '@/context/DevModeContext';
import { Message } from '@/engine/brain';
import Colors from '@/constants/colors';

const { colors } = Colors;

type PinMode = 'unlock' | 'set' | 'confirm' | 'verify_old' | null;

function EmptyState() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.15)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 600, useNativeDriver: true,
    }).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    );
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.35, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.15, duration: 2000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    glow.start();
    return () => { pulse.stop(); glow.stop(); };
  }, [pulseAnim, glowAnim, fadeAnim]);

  return (
    <Animated.View style={[emptyStyles.container, { opacity: fadeAnim }]}>
      <Animated.View style={[emptyStyles.logoRing, {
        transform: [{ scale: pulseAnim }],
        opacity: glowAnim,
      }]} />
      <Animated.View style={[emptyStyles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={emptyStyles.logoText}>J</Text>
      </Animated.View>
      <Text style={emptyStyles.title}>Jarvis AI</Text>
      <Text style={emptyStyles.subtitle}>Asistentul tău personal cu inteligență artificială</Text>
      <View style={emptyStyles.features}>
        <View style={emptyStyles.featureRow}>
          <Feather name="zap" size={14} color={colors.primary} />
          <Text style={emptyStyles.featureText}>270+ subiecte din memorie</Text>
        </View>
        <View style={emptyStyles.featureRow}>
          <Feather name="globe" size={14} color={colors.accent} />
          <Text style={emptyStyles.featureText}>Căutare online automată</Text>
        </View>
        <View style={emptyStyles.featureRow}>
          <Feather name="code" size={14} color="#00FF88" />
          <Text style={emptyStyles.featureText}>Generare cod și proiecte</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function ChatScreen() {
  const {
    messages, isThinking, webSearching, brainState,
    sendMessage, clearConversation, addDocument, removeDocument,
  } = useBrain();

  const { isLocked, hasPin, pinLoaded, unlock, setPin, removePin, lock } = usePin();
  const { status: llmStatus, skipped: llmSkipped } = useLLM();
  const { settings: aiProviderSettings } = useAIProvider();
  const { isDevMode, toggleDevMode, activeProject, refreshProject } = useDevMode();

  const [inputText, setInputText] = useState('');
  const [showMemory, setShowMemory] = useState(false);
  const [showMemoryManager, setShowMemoryManager] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const [showAIProvider, setShowAIProvider] = useState(false);
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [showProjectSwitcher, setShowProjectSwitcher] = useState(false);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [showSandbox, setShowSandbox] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const [pinMode, setPinMode] = useState<PinMode>(null);
  const [pendingNewPin, setPendingNewPin] = useState('');
  const [pinError, setPinError] = useState('');

  const flatListRef = useRef<FlatList<Message>>(null);
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const checkPermissions = async () => {
        const { status } = await FileSystem.getStorageStateAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Acces Stocare',
            'Jarvis are nevoie de acces la stocare pentru a salva conversațiile și cunoștințele local pe telefonul tău. Datele rămân private.',
            [
              { text: 'Mai târziu', style: 'cancel' },
              { 
                text: 'Permite', 
                onPress: async () => {
                  // System prompt request
                }
              }
            ]
          );
        }
      };
      checkPermissions();
    }
  }, []);

  const openProjectSwitcher = useCallback(async () => {
    try {
      const projects = await getAllProjects();
      setAllProjects(projects);
      setShowProjectSwitcher(true);
    } catch {
      /* ignore */
    }
  }, []);

  const handleSelectProject = useCallback(async (projectId: string) => {
    try {
      await switchActiveProject(projectId);
      await refreshProject();
      setShowProjectSwitcher(false);
    } catch {
      /* ignore */
    }
  }, [refreshProject]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isThinking || webSearching) return;
    setInputText('');
    setShowQuick(false);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await sendMessage(text);
    scrollToBottom();
  }, [inputText, isThinking, webSearching, sendMessage, scrollToBottom]);

  const handleQuickAction = useCallback((text: string) => {
    setShowQuick(false);
    sendMessage(text);
    scrollToBottom();
  }, [sendMessage, scrollToBottom]);

  const handleClear = useCallback(() => {
    setShowMemory(false);
    clearConversation();
    setShowQuick(true);
  }, [clearConversation]);

  const renderItem = useCallback(({ item, index }: { item: Message; index: number }) => (
    <ChatBubble message={item} index={index} />
  ), []);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;
  const docCount = brainState.learnedDocuments.length;

  const handlePinButton = useCallback(() => {
    if (hasPin) {
      lock();
    } else {
      setPinMode('set');
      setPendingNewPin('');
      setPinError('');
    }
  }, [hasPin, lock]);

  const handlePinSuccess = useCallback(async (pin: string) => {
    if (pinMode === 'unlock') {
      const ok = unlock(pin);
      if (!ok) {
        setPinError('PIN incorect. Încearcă din nou.');
        setPinMode('unlock');
      }
    } else if (pinMode === 'set') {
      setPendingNewPin(pin);
      setPinMode('confirm');
      setPinError('');
    } else if (pinMode === 'confirm') {
      if (pin === pendingNewPin) {
        await setPin(pin);
        setPinMode(null);
        setPendingNewPin('');
      } else {
        setPinError('PIN-urile nu coincid. Reîncearcă.');
        setPinMode('set');
        setPendingNewPin('');
      }
    } else if (pinMode === 'verify_old') {
      const ok = unlock(pin);
      if (ok) {
        setPinMode('set');
        setPendingNewPin('');
        setPinError('');
      } else {
        setPinError('PIN incorect.');
        setPinMode('verify_old');
      }
    }
  }, [pinMode, pendingNewPin, unlock, setPin]);

  const handlePinCancel = useCallback(() => {
    setPinMode(null);
    setPendingNewPin('');
    setPinError('');
  }, []);

  const handleChangPin = useCallback(() => {
    if (hasPin) {
      setPinMode('verify_old');
    } else {
      setPinMode('set');
    }
    setPinError('');
  }, [hasPin]);

  const handleRemovePin = useCallback(async () => {
    await removePin();
    setPinMode(null);
  }, [removePin]);

  if (!pinLoaded) return null;

  if (llmStatus === 'not_downloaded' && !llmSkipped) {
    return <ModelSetupScreen />;
  }

  if (isLocked) {
    return (
      <PinScreen
        mode="unlock"
        subtitle={pinError || undefined}
        onSuccess={(pin) => {
          const ok = unlock(pin);
          if (!ok) setPinError('PIN incorect. Încearcă din nou.');
        }}
      />
    );
  }

  if (pinMode === 'set') {
    return (
      <PinScreen
        mode="set"
        subtitle={pinError || 'Alege un cod din 4 cifre'}
        onSuccess={handlePinSuccess}
        onCancel={handlePinCancel}
      />
    );
  }
  if (pinMode === 'confirm') {
    return (
      <PinScreen
        mode="confirm"
        subtitle={pinError || 'Introduceți din nou PIN-ul pentru confirmare'}
        onSuccess={handlePinSuccess}
        onCancel={handlePinCancel}
      />
    );
  }
  if (pinMode === 'verify_old') {
    return (
      <PinScreen
        mode="unlock"
        subtitle="Introduceți PIN-ul curent pentru a-l schimba"
        onSuccess={handlePinSuccess}
        onCancel={handlePinCancel}
      />
    );
  }

  const isEmpty = messages.length === 0;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.statusDot} />
          <View>
            <Text style={styles.headerTitle}>Jarvis</Text>
            <Text style={styles.headerSub}>
              {llmStatus === 'ready'
                ? '🧠 Neural • Fără net'
                : aiProviderSettings.activeProvider !== 'none'
                  ? `✨ ${providerLabel(aiProviderSettings.activeProvider)} • Hibrid`
                  : docCount > 0
                    ? `${docCount} doc. • Fără net`
                    : `v3.1 • Fără net`}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setShowFiles(true)}>
            <View>
              <Feather name="paperclip" size={20} color={docCount > 0 ? colors.primary : colors.textSecondary} />
              {docCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{docCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setShowMemory(true)}>
            <Feather name="cpu" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerBtn, isDevMode && styles.devModeBtn]}
            onPress={toggleDevMode}
          >
            <Feather
              name="code"
              size={20}
              color={isDevMode ? '#00D4FF' : colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setShowMoreMenu(true)}
          >
            <Feather name="more-vertical" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {isDevMode && (
        <TouchableOpacity style={styles.devBanner} onPress={openProjectSwitcher} activeOpacity={0.75}>
          <Feather name="code" size={13} color="#00D4FF" />
          <Text style={styles.devBannerText} numberOfLines={1}>
            {activeProject ? `Mod dezvoltator • ${activeProject.name}` : 'Mod dezvoltator • atinge pentru proiecte'}
          </Text>
          <Feather name="chevron-down" size={13} color="#00D4FF" />
        </TouchableOpacity>
      )}

      <Modal
        visible={showMoreMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMoreMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMoreMenu(false)}
        >
          <View style={[styles.moreMenu, { top: topInset + 50, right: 12 }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setShowMoreMenu(false); setShowKnowledge(true); }}
            >
              <Feather name="database" size={18} color={colors.textSecondary} />
              <Text style={styles.menuItemText}>Bază de cunoștințe</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setShowMoreMenu(false); setShowMemoryManager(true); }}
            >
              <Feather name="settings" size={18} color={colors.primary} />
              <Text style={styles.menuItemText}>Memory Manager</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setShowMoreMenu(false); setShowAIProvider(true); }}
            >
              <Feather
                name={providerIcon(aiProviderSettings.activeProvider)}
                size={18}
                color={aiProviderSettings.activeProvider !== 'none' ? colors.accent : colors.textSecondary}
              />
              <Text style={[styles.menuItemText, aiProviderSettings.activeProvider !== 'none' && { color: colors.accent }]}>
                Furnizor AI {aiProviderSettings.activeProvider !== 'none' ? `(${providerLabel(aiProviderSettings.activeProvider)})` : ''}
              </Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setShowMoreMenu(false); setShowSandbox(true); }}
            >
              <Feather name="terminal" size={18} color="#00FF88" />
              <Text style={styles.menuItemText}>Consolă cod</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            {Platform.OS === 'android' && (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMoreMenu(false);
                    sendMessage('acordă acces la folder').catch(() => {});
                  }}
                >
                  <Feather name="folder-plus" size={18} color="#FFA500" />
                  <Text style={styles.menuItemText}>Acordă acces la folder</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
              </>
            )}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setShowMoreMenu(false); handlePinButton(); }}
            >
              <Feather
                name={hasPin ? 'lock' : 'unlock'}
                size={18}
                color={hasPin ? colors.primary : colors.textMuted}
              />
              <Text style={styles.menuItemText}>{hasPin ? 'Blochează cu PIN' : 'Setează PIN'}</Text>
            </TouchableOpacity>
            {hasPin && (
              <>
                <View style={styles.menuDivider} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => { setShowMoreMenu(false); handleChangPin(); }}
                >
                  <Feather name="edit-3" size={18} color={colors.textSecondary} />
                  <Text style={styles.menuItemText}>Modifică PIN</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showProjectSwitcher}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProjectSwitcher(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowProjectSwitcher(false)}
        >
          <View style={styles.projectSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Proiecte Dev</Text>
            {allProjects.length === 0 ? (
              <Text style={styles.sheetEmpty}>Niciun proiect salvat încă.{'\n'}Generează cod în Dev Mode pentru a crea unul.</Text>
            ) : (
              allProjects.map(proj => (
                <TouchableOpacity
                  key={proj.id}
                  style={[styles.projectRow, activeProject?.id === proj.id && styles.projectRowActive]}
                  onPress={() => handleSelectProject(proj.id)}
                >
                  <Feather name="folder" size={16} color={activeProject?.id === proj.id ? '#00D4FF' : colors.textSecondary} />
                  <View style={styles.projectInfo}>
                    <Text style={[styles.projectName, activeProject?.id === proj.id && { color: '#00D4FF' }]} numberOfLines={1}>{proj.name}</Text>
                    <Text style={styles.projectStack} numberOfLines={1}>{proj.stack}</Text>
                  </View>
                  {activeProject?.id === proj.id && <Feather name="check" size={16} color="#00D4FF" />}
                </TouchableOpacity>
              ))
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {isEmpty && !isThinking && !webSearching ? (
          <View style={styles.flex}>
            <EmptyState />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            scrollEnabled={!!messages.length}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            initialNumToRender={15}
            maxToRenderPerBatch={8}
            windowSize={8}
            removeClippedSubviews={true}
            updateCellsBatchingPeriod={50}
            ListFooterComponent={
              webSearching
                ? <ThinkingIndicator webSearch={true} />
                : isThinking
                  ? <ThinkingIndicator />
                  : null
            }
          />
        )}

        <QuickActions onPress={handleQuickAction} devMode={isDevMode} visible={showQuick && !isThinking && !webSearching} />

        <View style={[styles.inputContainer, { paddingBottom: bottomInset + 8 }]}>
          <TouchableOpacity style={styles.attachBtn} onPress={() => setShowFiles(true)}>
            <Feather name="paperclip" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Scrie un mesaj..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={1000}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            blurOnSubmit={false}
          />

          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || isThinking || webSearching) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isThinking || webSearching}
            activeOpacity={0.8}
          >
            <Feather
              name="send"
              size={18}
              color={inputText.trim() && !isThinking && !webSearching ? '#fff' : colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {!hasPin && (
        <TouchableOpacity style={styles.pinTip} onPress={() => setPinMode('set')}>
          <Feather name="lock" size={13} color={colors.textMuted} />
          <Text style={styles.pinTipText}>Setează PIN de protecție</Text>
        </TouchableOpacity>
      )}
      {hasPin && (
        <TouchableOpacity style={styles.pinTip} onLongPress={handleRemovePin}>
          <Feather name="shield" size={13} color={colors.success} />
          <Text style={[styles.pinTipText, { color: colors.success }]}>Protejat cu PIN</Text>
        </TouchableOpacity>
      )}

      <MemoryModal
        visible={showMemory}
        brainState={brainState}
        onClose={() => setShowMemory(false)}
        onClear={handleClear}
      />
      <MemoryManager 
        visible={showMemoryManager} 
        onClose={() => setShowMemoryManager(false)} 
      />
      <FileUploadModal
        visible={showFiles}
        documents={brainState.learnedDocuments}
        onClose={() => setShowFiles(false)}
        onAddDocument={addDocument}
        onRemoveDocument={removeDocument}
      />
      <AIProviderModal
        visible={showAIProvider}
        onClose={() => setShowAIProvider(false)}
      />
      <KnowledgeScreen
        visible={showKnowledge}
        onClose={() => setShowKnowledge(false)}
      />

      <CodeSandboxScreen
        visible={showSandbox}
        onClose={() => setShowSandbox(false)}
      />

      <FloatingBubble
        onSendToChat={(text) => {
          sendMessage(text);
          scrollToBottom();
        }}
        onMemorize={(text) => {
          sendMessage(`Memorează asta: "${text.slice(0, 300)}"`);
          scrollToBottom();
        }}
      />
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    color: '#fff',
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
  },
  features: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
  },
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.success,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 4,
  },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: colors.text },
  headerSub: { fontSize: 11, fontFamily: 'Inter_400Regular', color: colors.success },
  headerRight: { flexDirection: 'row', gap: 4 },
  headerBtn: { padding: 8, borderRadius: 8 },
  headerBtnActive: { backgroundColor: 'rgba(0,212,255,0.1)' },
  badge: {
    position: 'absolute', top: -5, right: -6,
    backgroundColor: colors.primary,
    borderRadius: 8, minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontFamily: 'Inter_700Bold' },
  messageList: { paddingTop: 12, paddingBottom: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 10, paddingTop: 10, gap: 6,
    backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  attachBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 2, borderWidth: 1, borderColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, color: colors.text,
    fontFamily: 'Inter_400Regular',
    borderWidth: 1, borderColor: colors.border,
    maxHeight: 120,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 2,
  },
  sendBtnDisabled: { backgroundColor: colors.surfaceHigh },
  pinTip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 6, backgroundColor: colors.background,
  },
  pinTipText: {
    fontSize: 11, color: colors.textMuted, fontFamily: 'Inter_400Regular',
  },
  devModeBtn: {
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
    borderRadius: 8,
  },
  devBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 6,
    backgroundColor: 'rgba(0, 212, 255, 0.07)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(0, 212, 255, 0.2)',
  },
  devBannerText: {
    fontSize: 11, color: '#00D4FF', fontFamily: 'Inter_500Medium', flex: 1,
  },
  menuOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
  },
  moreMenu: {
    position: 'absolute',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemText: {
    color: colors.text,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 12,
  },
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)',
  },
  projectSheet: {
    backgroundColor: '#12121A', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#333',
    alignSelf: 'center', marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 16, color: '#fff', fontFamily: 'Inter_600SemiBold', marginBottom: 12,
  },
  sheetEmpty: {
    fontSize: 13, color: colors.textSecondary, textAlign: 'center',
    paddingVertical: 24, lineHeight: 20,
  },
  projectRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderRadius: 10,
    paddingHorizontal: 10,
  },
  projectRowActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
  },
  projectInfo: { flex: 1 },
  projectName: {
    fontSize: 14, color: '#fff', fontFamily: 'Inter_500Medium',
  },
  projectStack: {
    fontSize: 11, color: colors.textSecondary, marginTop: 2,
  },
});
