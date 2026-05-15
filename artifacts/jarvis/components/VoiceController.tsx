import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

// IMPORTURI DIN EXPO-AV ȘI EXPO-SPEECH (trebuie instalate manual de user: pnpm install expo-av expo-speech)
// @ts-ignore
import { Audio } from 'expo-av';
// @ts-ignore
import * as Speech from 'expo-speech';

const { colors } = Colors;

interface VoiceControllerProps {
  onAudioReady: (uri: string) => void;
  isProcessing?: boolean;
}

/**
 * Componentă pentru controlul vocii (STT + TTS toggle)
 */
export default function VoiceController({ onAudioReady, isProcessing }: VoiceControllerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [recording, setRecording] = useState<any>(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Încarcă preferința voice mode la montare
    const loadMode = async () => {
      try {
        const val = await AsyncStorage.getItem('@jarvis_voice_mode');
        if (val !== null) setVoiceMode(val === 'true');
      } catch (e) {}
    };
    loadMode();
  }, []);

  const toggleVoiceMode = async () => {
    const newMode = !voiceMode;
    setVoiceMode(newMode);
    await AsyncStorage.setItem('@jarvis_voice_mode', String(newMode));
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  };

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.25, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  const startRecording = async () => {
    try {
      // Verifică permisiunile
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Eroare', 'Accesul la microfon este necesar pentru comenzi vocale.');
        return;
      }

      // Configurează modul audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Începe înregistrarea
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      }
    } catch (err) {
      console.error('[VoiceController] startRecording error:', err);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      
      if (uri) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }
        onAudioReady(uri);
      }
    } catch (err) {
      console.error('[VoiceController] stopRecording error:', err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Voice Mode Toggle (TTS Auto) */}
      <TouchableOpacity 
        style={[styles.modeBtn, voiceMode && styles.modeBtnActive]} 
        onPress={toggleVoiceMode}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={voiceMode ? "volume-high" : "volume-mute"} 
          size={16} 
          color={voiceMode ? colors.primary : colors.textMuted} 
        />
      </TouchableOpacity>

      {/* Record Button (STT) */}
      <TouchableOpacity
        onLongPress={startRecording}
        onPressOut={stopRecording}
        delayLongPress={200}
        activeOpacity={0.8}
        disabled={isProcessing}
      >
        <Animated.View style={[
          styles.micBtn,
          isRecording && styles.micBtnRecording,
          isProcessing && styles.micBtnDisabled,
          { transform: [{ scale: pulseAnim }] }
        ]}>
          <Ionicons name="mic" size={22} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Utilitar pentru Redare Text-to-Speech
 */
export const playTTS = (text: string, lang = 'ro') => {
  try {
    // @ts-ignore
    Speech.speak(text, {
      language: lang,
      rate: 1.0,
      pitch: 1.0,
    });
  } catch (e) {
    console.error('[VoiceController] playTTS error:', e);
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 4,
  },
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  micBtnRecording: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  micBtnDisabled: {
    backgroundColor: colors.surfaceHigh,
    shadowOpacity: 0,
    elevation: 0,
  },
  modeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeBtnActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
});
