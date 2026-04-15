
// Bulina flotantă Jarvis — se poate muta pe ecran, expandează meniu cu opțiuni
// Include: captură ecran, citire text (OCR), memorare, trimitere la Jarvis
// v1.2 — fix crash: înlocuit __getValue() cu ref tracking, haptics în try-catch

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, PanResponder, StyleSheet,
  Text, TouchableOpacity, View, Modal, ActivityIndicator,
  Alert, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

const { colors } = Colors;
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Import condiționat ML Kit (necesită native build)
let TextRecognition: { recognize: (uri: string) => Promise<{ text: string }> } | null = null;
try {
  TextRecognition = require('@react-native-ml-kit/text-recognition').default;
} catch {
  TextRecognition = null;
}

// Haptics sigur — nu crăpă dacă dispozitivul nu suportă
function safeHapticLight() {
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
}
function safeHapticSuccess() {
  try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
}

interface FloatingBubbleProps {
  onSendToChat: (text: string) => void;
  onMemorize: (text: string) => void;
}

type BubbleState = 'collapsed' | 'expanded';

const BUBBLE_SIZE = 56;
const MENU_SIZE = 200;
const INIT_X = SCREEN_W - BUBBLE_SIZE - 20;
const INIT_Y = SCREEN_H - BUBBLE_SIZE - 120;

export default function FloatingBubble({ onSendToChat, onMemorize }: FloatingBubbleProps) {
  const [bubbleState, setBubbleState] = useState<BubbleState>('collapsed');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastExtractedText, setLastExtractedText] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  // Folosim state pentru poziția meniului față de bulină (evită __getValue în render)
  const [menuOnLeft, setMenuOnLeft] = useState(true);

  // Ref care ține poziția curentă a bulinei — înlocuiește __getValue()
  const positionRef = useRef({ x: INIT_X, y: INIT_Y });

  const pan = useRef(new Animated.ValueXY({ x: INIT_X, y: INIT_Y })).current;
  const scale = useRef(new Animated.Value(1)).current;
  const menuOpacity = useRef(new Animated.Value(0)).current;

  const isDragging = useRef(false);
  const dragStartTime = useRef(0);

  // Sincronizăm positionRef cu Animated.ValueXY prin listener
  useEffect(() => {
    const id = pan.addListener((val) => {
      positionRef.current = val;
    });
    return () => pan.removeListener(id);
  }, [pan]);

  // ─── Toggle meniu ──────────────────────────────────────────────────────────
  const handleTap = useCallback(() => {
    safeHapticLight();
    // Actualizăm latura meniului bazat pe poziția ref (nu __getValue)
    setMenuOnLeft(positionRef.current.x > SCREEN_W / 2);
    const nextState = bubbleState === 'collapsed' ? 'expanded' : 'collapsed';
    setBubbleState(nextState);

    Animated.timing(menuOpacity, {
      toValue: nextState === 'expanded' ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [bubbleState, menuOpacity]);

  const closeMenu = useCallback(() => {
    setBubbleState('collapsed');
    Animated.timing(menuOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [menuOpacity]);

  // ─── Drag ──────────────────────────────────────────────────────────────────
  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: () => {
      isDragging.current = false;
      dragStartTime.current = Date.now();
      // Folosim positionRef în loc de __getValue()
      pan.setOffset({ x: positionRef.current.x, y: positionRef.current.y });
      pan.setValue({ x: 0, y: 0 });
      Animated.spring(scale, { toValue: 0.9, useNativeDriver: true }).start();
    },

    onPanResponderMove: (_, gestureState) => {
      if (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5) {
        isDragging.current = true;
      }
      pan.setValue({ x: gestureState.dx, y: gestureState.dy });
    },

    onPanResponderRelease: (_, gestureState) => {
      // Calculăm noua poziție din ref + gestureState (nu din __getValue)
      const rawX = positionRef.current.x + gestureState.dx;
      const rawY = positionRef.current.y + gestureState.dy;

      pan.flattenOffset();
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

      const snapX = rawX < SCREEN_W / 2
        ? 12
        : SCREEN_W - BUBBLE_SIZE - 12;
      const snapY = Math.max(60, Math.min(SCREEN_H - 160, rawY));

      Animated.spring(pan, {
        toValue: { x: snapX, y: snapY },
        useNativeDriver: false,
        tension: 120,
        friction: 8,
      }).start(() => {
        // După animație, positionRef e actualizat de listener
      });

      const wasTap = !isDragging.current && Date.now() - dragStartTime.current < 300;
      if (wasTap) {
        // handleTap e definit mai sus cu useCallback — îl apelăm direct
        // (nu putem folosi ref la handleTap în panResponder.create; folosim flag)
        isDragging.current = false;
      }

      if (wasTap) {
        safeHapticLight();
        setMenuOnLeft(snapX > SCREEN_W / 2);
        setBubbleState(prev => {
          const next = prev === 'collapsed' ? 'expanded' : 'collapsed';
          Animated.timing(menuOpacity, {
            toValue: next === 'expanded' ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
          return next;
        });
      }
    },
  })).current;

  // ─── Citire text din imagine (OCR) ────────────────────────────────────────
  const extractTextFromImage = useCallback(async (imageUri: string): Promise<string> => {
    if (!TextRecognition) {
      return '[OCR indisponibil — necesită rebuild APK cu ML Kit]';
    }
    try {
      const result = await TextRecognition.recognize(imageUri);
      const text = result?.text?.trim() || '';
      return text.length > 0 ? text : '[Nu am găsit text în imagine]';
    } catch {
      return '[Eroare la citirea textului]';
    }
  }, []);

  // ─── Fotografiază cu camera ───────────────────────────────────────────────
  const handleCamera = useCallback(async () => {
    closeMenu();
    setIsProcessing(true);

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisiune refuzată', 'Jarvis nu poate accesa camera fără permisiune.');
        setIsProcessing(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const text = await extractTextFromImage(imageUri);
        setLastExtractedText(text);
        setShowPreview(true);
      }
    } catch {
      Alert.alert('Eroare', 'Nu am putut accesa camera.');
    } finally {
      setIsProcessing(false);
    }
  }, [closeMenu, extractTextFromImage]);

  // ─── Importă screenshot din galerie ───────────────────────────────────────
  const handleGallery = useCallback(async () => {
    closeMenu();
    setIsProcessing(true);

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisiune refuzată', 'Jarvis nu poate accesa galeria fără permisiune.');
        setIsProcessing(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const text = await extractTextFromImage(imageUri);
        setLastExtractedText(text);
        setShowPreview(true);
      }
    } catch {
      Alert.alert('Eroare', 'Nu am putut deschide galeria.');
    } finally {
      setIsProcessing(false);
    }
  }, [closeMenu, extractTextFromImage]);

  // ─── Acțiuni după OCR ─────────────────────────────────────────────────────
  const handleSendExtracted = useCallback(() => {
    if (!lastExtractedText) return;
    setShowPreview(false);
    safeHapticSuccess();
    onSendToChat(`Am fotografiat ceva. Textul de pe ecran:\n\n"${lastExtractedText}"\n\nAnalizează și comentează.`);
    setLastExtractedText(null);
  }, [lastExtractedText, onSendToChat]);

  const handleMemorizeExtracted = useCallback(() => {
    if (!lastExtractedText) return;
    setShowPreview(false);
    safeHapticSuccess();
    onMemorize(lastExtractedText);
    onSendToChat(`Memorează asta: "${lastExtractedText.slice(0, 200)}"`);
    setLastExtractedText(null);
  }, [lastExtractedText, onMemorize, onSendToChat]);

  return (
    <>
      {/* Bulina flotantă */}
      <Animated.View
        style={[
          styles.bubbleContainer,
          { transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale }] },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Meniu expandat */}
        {bubbleState === 'expanded' && (
          <Animated.View style={[
            styles.menu,
            menuOnLeft ? styles.menuLeft : styles.menuRight,
            { opacity: menuOpacity },
          ]}>
            <MenuButton
              icon="camera"
              label="Fotografiază"
              color={colors.primary}
              onPress={handleCamera}
            />
            <MenuButton
              icon="image"
              label="Importă imagine"
              color={colors.accent}
              onPress={handleGallery}
            />
            <MenuButton
              icon="x"
              label="Închide"
              color={colors.textMuted}
              onPress={closeMenu}
            />
          </Animated.View>
        )}

        {/* Bulina principală */}
        <View style={[
          styles.bubble,
          bubbleState === 'expanded' && styles.bubbleActive,
        ]}>
          {isProcessing
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.bubbleIcon}>
                {bubbleState === 'expanded' ? '✕' : '🧠'}
              </Text>
          }
        </View>
      </Animated.View>

      {/* Preview text extras din imagine */}
      <Modal
        visible={showPreview}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPreview(false)}
      >
        <View style={styles.previewOverlay}>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Feather name="file-text" size={20} color={colors.primary} />
              <Text style={styles.previewTitle}>Text detectat în imagine</Text>
            </View>

            <View style={styles.previewTextBox}>
              <Text style={styles.previewText} numberOfLines={10}>
                {lastExtractedText || '(Niciun text detectat)'}
              </Text>
            </View>

            <View style={styles.previewActions}>
              <TouchableOpacity style={styles.previewBtn} onPress={handleSendExtracted}>
                <Feather name="send" size={16} color="#fff" />
                <Text style={styles.previewBtnText}>Trimite la Jarvis</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.previewBtn, styles.previewBtnSecondary]} onPress={handleMemorizeExtracted}>
                <Feather name="save" size={16} color={colors.primary} />
                <Text style={[styles.previewBtnText, { color: colors.primary }]}>Memorează</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.previewClose} onPress={() => setShowPreview(false)}>
              <Text style={styles.previewCloseText}>Anulează</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

function MenuButton({
  icon, label, color, onPress,
}: {
  icon: React.ComponentProps<typeof Feather>['name']; label: string; color: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuBtn} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.menuBtnIcon, { backgroundColor: color + '22' }]}>
        <Feather name={icon} size={16} color={color} />
      </View>
      <Text style={styles.menuBtnLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bubbleContainer: {
    position: 'absolute',
    zIndex: 9999,
    alignItems: 'center',
  },
  bubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 12,
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  bubbleActive: {
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.border,
  },
  bubbleIcon: {
    fontSize: 22,
  },
  menu: {
    position: 'absolute',
    bottom: BUBBLE_SIZE + 8,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 20,
    minWidth: MENU_SIZE,
    gap: 4,
  },
  menuLeft: {
    right: 0,
  },
  menuRight: {
    left: 0,
  },
  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  menuBtnIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBtnLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.text,
  },

  // Preview modal
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  previewCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
  },
  previewTextBox: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 200,
  },
  previewText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 10,
  },
  previewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  previewBtnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  previewBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  previewClose: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  previewCloseText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
  },
});
