
import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { BrainState } from '@/engine/brain';

const { colors } = Colors;

interface Props {
  visible: boolean;
  brainState: BrainState;
  onClose: () => void;
  onClear: () => void;
}

export default function MemoryModal({ visible, brainState, onClose, onClear }: Props) {
  const memories = Object.entries(brainState.memory)
    .filter(([k]) => k.startsWith('mem_'))
    .map(([, v]) => v);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Starea Jarvis</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Statistica */}
          <Text style={styles.sectionTitle}>Statistici</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{brainState.conversationCount}</Text>
              <Text style={styles.statLabel}>Mesaje</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{brainState.learnedDocuments.length}</Text>
              <Text style={styles.statLabel}>Documente</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{memories.length}</Text>
              <Text style={styles.statLabel}>Notițe</Text>
            </View>
          </View>

          {/* Identitate */}
          {brainState.userName && (
            <>
              <Text style={styles.sectionTitle}>Identitate</Text>
              <View style={styles.card}>
                <Feather name="user" size={16} color={colors.primary} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardLabel}>Numele tău</Text>
                  <Text style={styles.cardValue}>{brainState.userName}</Text>
                </View>
              </View>
            </>
          )}

          {/* Notite */}
          {memories.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Notițe salvate</Text>
              {memories.map((m, i) => (
                <View key={i} style={styles.card}>
                  <Feather name="bookmark" size={16} color={colors.warning} />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardValue}>{m}</Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {/* Documente */}
          {brainState.learnedDocuments.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Documente în memorie</Text>
              {brainState.learnedDocuments.map(doc => (
                <View key={doc.id} style={styles.card}>
                  <Feather name="file-text" size={16} color={colors.accent} />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardValue}>{doc.name}</Text>
                    <Text style={styles.cardLabel}>{doc.wordCount.toLocaleString()} cuvinte</Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {memories.length === 0 && !brainState.userName && brainState.learnedDocuments.length === 0 && (
            <View style={styles.empty}>
              <Feather name="cpu" size={40} color={colors.textMuted} />
              <Text style={styles.emptyText}>Nicio informație reținută</Text>
              <Text style={styles.emptyHint}>Spune-mi "Reține că..." sau trimite un fișier!</Text>
            </View>
          )}

          <View style={styles.infoBox}>
            <Feather name="shield" size={14} color={colors.textMuted} />
            <Text style={styles.infoText}>
              Totul este stocat local pe dispozitivul tău. Nimic nu se trimite în cloud.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
            <Feather name="refresh-cw" size={16} color={colors.error} />
            <Text style={styles.clearText}>Resetează conversația</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 20, fontFamily: 'Inter_700Bold', color: colors.text },
  closeBtn: { padding: 4 },
  content: { flex: 1, padding: 16 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    marginTop: 2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  cardContent: { flex: 1 },
  cardLabel: { fontSize: 11, color: colors.textMuted, fontFamily: 'Inter_400Regular', marginTop: 2 },
  cardValue: { fontSize: 14, color: colors.text, fontFamily: 'Inter_500Medium' },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyText: { fontSize: 16, color: colors.textSecondary, fontFamily: 'Inter_500Medium' },
  emptyHint: { fontSize: 13, color: colors.textMuted, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    padding: 12,
    marginTop: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: { fontSize: 12, color: colors.textMuted, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 18 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,82,82,0.1)',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,82,82,0.2)',
  },
  clearText: { color: colors.error, fontSize: 15, fontFamily: 'Inter_600SemiBold' },
});
