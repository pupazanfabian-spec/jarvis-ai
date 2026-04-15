
import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getAllProjects, setActiveProject as switchActiveProject, Project } from '@/engine/projectMemory';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ChatBubble from '@/components/ChatBubble';
import ThinkingIndicator from '@/components/ThinkingIndicator';
import QuickActions from '@/components/QuickActions';
import MemoryModal from '@/components/MemoryModal';
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
import { useAIProvider, providerIcon } from '@/context/AIProviderContext';
import { useDevMode } from '@/context/DevModeContext';
import { Message } from '@/engine/brain';
import Colors from '@/constants/colors';

const { colors } = Colors;

type PinMode = 'unlock' | 'set' | 'confirm' | 'verify_old' | null;

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
  const [showFiles, setShowFiles] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const [showAIProvider, setShowAIProvider] = useState(false);
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [showProjectSwitcher, setShowProjectSwitcher] = useState(false);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [showSandbox, setShowSandbox] = useState(false);

  // PIN flow state
  const [pinMode, setPinMode] = useState<PinMode>(null);
  const [pendingNewPin, setPendingNewPin] = useState('');
  const [pinError, setPinError] = useState('');

  const flatListRef = useRef<FlatList<Message>>(null);
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
  }, []);

  const openProjectSwitcher = useCallback(async () => {
    try {
      const projects = await getAllProjects();
      setAllProjects(projects);
      setShowProjectSwitcher(true);
    } catch {}
  }, []);

  const handleSelectProject = useCallback(async (projectId: string) => {
    try {
      await switchActiveProject(projectId);
      await refreshProject();
      setShowProjectSwitcher(false);
    } catch {}
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
  const bottomInset = isWeb ? 34 : 0;
  const docCount = brainState.learnedDocuments.length;

  // ── PIN handlers ────────────────────────────────────────────────────────────

  const handlePinButton = useCallback(() => {
    if (hasPin) {
      // Are PIN — arata meniu: lock / change / remove
      // Simplu: prima data lock, tine apasat pentru optiuni
      lock();
    } else {
      // Nu are PIN — seteaza
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

  // ── Asteapta incarcarea PIN ─────────────────────────────────────────────────
  if (!pinLoaded) return null;

  // ── Configurare model LLM (doar în native build, când modelul nu e descărcat) ──
  if (llmStatus === 'not_downloaded' && !llmSkipped) {
    return <ModelSetupScreen />;
  }

  // ── Ecran deblocare PIN ─────────────────────────────────────────────────────
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

  // ── Flux setare PIN ─────────────────────────────────────────────────────────
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

  // ── UI principal ─────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.statusDot} />
          <View>
            <Text style={styles.headerTitle}>Jarvis</Text>
            <Text style={styles.headerSub}>
              {llmStatus === 'ready'
                ? '🧠 Neural • Offline'
                : aiProviderSettings.activeProvider !== 'none'
                  ? `✨ ${aiProviderSettings.activeProvider === 'gemini' ? 'Gemini' : 'ChatGPT'} • Hibrid`
                  : docCount > 0
                    ? `${docCount} doc. • Offline`
                    : `v3.1 • Offline`}
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
          <TouchableOpacity style={styles.headerBtn} onPress={() => setShowKnowledge(true)}>
            <Feather name="database" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setShowMemory(true)}>
            <Feather name="cpu" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerBtn, aiProviderSettings.activeProvider !== 'none' && styles.headerBtnActive]}
            onPress={() => setShowAIProvider(true)}
          >
            <Feather
              name={providerIcon(aiProviderSettings.activeProvider)}
              size={20}
              color={aiProviderSettings.activeProvider !== 'none' ? colors.accent : colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerBtn, styles.sandboxBtn]}
            onPress={() => setShowSandbox(true)}
          >
            <Feather name="terminal" size={20} color="#00FF88" />
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
            onPress={handlePinButton}
            onLongPress={hasPin ? handleChangPin : undefined}
          >
            <Feather
              name={hasPin ? 'lock' : 'unlock'}
              size={20}
              color={hasPin ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dev Mode Banner */}
      {isDevMode && (
        <TouchableOpacity style={styles.devBanner} onPress={openProjectSwitcher} activeOpacity={0.75}>
          <Feather name="code" size={13} color="#00D4FF" />
          <Text style={styles.devBannerText} numberOfLines={1}>
            {activeProject ? `Dev Mode • ${activeProject.name}` : 'Dev Mode activ • atinge pentru proiecte'}
          </Text>
          <Feather name="chevron-down" size={13} color="#00D4FF" />
        </TouchableOpacity>
      )}

      {/* Project Switcher Modal */}
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

      {/* Messages + Input */}
      <KeyboardAvoidingView style={styles.flex} behavior="padding" keyboardVerticalOffset={0}>
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
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
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

        {showQuick && !isThinking && !webSearching && <QuickActions onPress={handleQuickAction} devMode={isDevMode} />}

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

      {/* PIN tip */}
      {!hasPin && (
        <TouchableOpacity style={styles.pinTip} onPress={() => setPinMode('set')}>
          <Feather name="lock" size={13} color={colors.textMuted} />
          <Text style={styles.pinTipText}>Setează PIN de protecție</Text>
        </TouchableOpacity>
      )}
      {hasPin && (
        <TouchableOpacity style={styles.pinTip} onLongPress={handleRemovePin}>
          <Feather name="shield" size={13} color={colors.success} />
          <Text style={[styles.pinTipText, { color: colors.success }]}>Protejat cu PIN • ține apăsat pentru schimbare</Text>
        </TouchableOpacity>
      )}

      {/* Modals */}
      <MemoryModal
        visible={showMemory}
        brainState={brainState}
        onClose={() => setShowMemory(false)}
        onClear={handleClear}
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

      {/* Bulina flotantă Jarvis */}
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
  sandboxBtn: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderRadius: 8,
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
