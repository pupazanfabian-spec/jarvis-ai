
// Ecran de configurare model — apare la prima rulare pe native build
// Descarcă Phi-3 Mini (~2.2GB) și îl pregătește pentru utilizare offline

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLLM } from '@/context/LLMContext';
import { MODEL_CONFIG } from '@/engine/llm';
import Colors from '@/constants/colors';

const { colors } = Colors;

export default function ModelSetupScreen() {
  const { status, downloadProgress, downloadedMB, errorMessage, startDownload, skipModel } = useLLM();

  const percent = Math.round(downloadProgress * 100);
  const totalMB = MODEL_CONFIG.sizeMB;

  if (status === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.title}>Se încarcă Jarvis în memorie...</Text>
        <Text style={styles.sub}>Prima încărcare durează ~30 secunde</Text>
      </View>
    );
  }

  if (status === 'downloading') {
    return (
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Feather name="download-cloud" size={40} color={colors.primary} />
        </View>
        <Text style={styles.title}>Se descarcă creierul lui Jarvis</Text>
        <Text style={styles.modelName}>{MODEL_CONFIG.name}</Text>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${percent}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {downloadedMB} MB / {totalMB} MB  •  {percent}%
        </Text>
        <Text style={styles.sub}>
          Rămâi conectat la WiFi. Nu închide aplicația.
        </Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.container}>
        <View style={[styles.iconCircle, { borderColor: colors.error }]}>
          <Feather name="alert-triangle" size={40} color={colors.error} />
        </View>
        <Text style={styles.title}>Eroare</Text>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={startDownload}>
          <Feather name="refresh-cw" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Încearcă din nou</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn} onPress={skipModel}>
          <Text style={styles.skipText}>Continuă fără model (mod clasic)</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // status === 'not_downloaded'
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Feather name="cpu" size={40} color={colors.primary} />
      </View>

      <Text style={styles.title}>Jarvis — Instalare inițială</Text>
      <Text style={styles.sub}>
        Pentru a funcționa cu adevărat inteligent, Jarvis are nevoie de creierul său neural.
      </Text>

      <View style={styles.infoBox}>
        <InfoRow icon="box" label="Model" value={MODEL_CONFIG.name} />
        <InfoRow icon="hard-drive" label="Dimensiune" value={`~${MODEL_CONFIG.sizeMB / 1000} GB`} />
        <InfoRow icon="wifi" label="Necesită" value="WiFi pentru descărcare" />
        <InfoRow icon="lock" label="Ulterior" value="100% offline, fără internet" />
        <InfoRow icon="shield" label="Securitate" value="Datele rămân pe telefon" />
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={startDownload} activeOpacity={0.85}>
        <Feather name="download" size={18} color="#fff" />
        <Text style={styles.primaryBtnText}>Descarcă creierul neural</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipBtn} onPress={skipModel}>
        <Text style={styles.skipText}>Continuă fără model (mod clasic, oricând poți reveni)</Text>
      </TouchableOpacity>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Feather name={icon} size={14} color={colors.primary} />
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  modelName: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.primary,
    marginBottom: 24,
  },
  sub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  infoBox: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    width: 90,
  },
  infoValue: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
    flex: 1,
  },
  progressContainer: {
    width: '100%',
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    marginBottom: 16,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    gap: 10,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 14,
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  skipBtn: {
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Inter_400Regular',
  },
});
