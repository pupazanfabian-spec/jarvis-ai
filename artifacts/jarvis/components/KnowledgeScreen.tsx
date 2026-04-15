
// Jarvis — Ecran de gestionare a Cunoașterii (SQLite knowledge_entries)
// Permite vizualizarea, căutarea și ștergerea cunoașterii acumulate

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { getAllKnowledgeEntries, getDBStats, autoPruneKnowledge, deleteKnowledgeEntry } from '@/engine/database';
import type { KnowledgeEntry } from '@/engine/database';

const { colors } = Colors;

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface Props {
  visible: boolean;
  onClose: () => void;
}

type FilterMode = 'all' | 'web' | 'user' | 'dynamic_concept' | 'gemini' | 'openai';

const SOURCE_LABELS: Record<string, { label: string; color: string; icon: FeatherIconName }> = {
  web: { label: 'Web', color: colors.accent, icon: 'globe' },
  user: { label: 'Utilizator', color: colors.warning, icon: 'user' },
  dynamic_concept: { label: 'Concept', color: colors.primary, icon: 'cpu' },
  gemini: { label: 'Gemini', color: '#4285F4', icon: 'zap' },
  openai: { label: 'ChatGPT', color: '#10A37F', icon: 'message-circle' },
};

const DEFAULT_SOURCE_META: { label: string; color: string; icon: FeatherIconName } = {
  label: 'Altele', color: colors.textSecondary, icon: 'database',
};

function getSourceMeta(source: string | undefined) {
  const s = source ?? 'user';
  return SOURCE_LABELS[s] ?? DEFAULT_SOURCE_META;
}

function importanceBar(importance: number) {
  const pct = Math.round((importance ?? 0.5) * 100);
  const color = pct >= 70 ? colors.success : pct >= 40 ? colors.warning : colors.textMuted;
  return { pct, color };
}

interface DBStats {
  knowledgeCount: number;
  cacheCount: number;
  conceptsCount: number;
  factsCount: number;
  entitiesCount: number;
}

export default function KnowledgeScreen({ visible, onClose }: Props) {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [filtered, setFiltered] = useState<KnowledgeEntry[]>([]);
  const [stats, setStats] = useState<DBStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [pruning, setPruning] = useState(false);
  const [pruneMsg, setPruneMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [all, s] = await Promise.all([
        getAllKnowledgeEntries(),
        getDBStats(),
      ]);
      setEntries(all);
      setStats(s);
    } catch (e) {
      if (__DEV__) console.warn('[KnowledgeScreen] load failed:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      setSearch('');
      setFilter('all');
      setPruneMsg('');
      load();
    }
  }, [visible, load]);

  useEffect(() => {
    let result = entries;
    if (filter !== 'all') {
      result = result.filter(e => e.source === filter);
    }
    if (search.trim().length > 1) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.content.toLowerCase().includes(q) ||
        (e.label ?? '').toLowerCase().includes(q) ||
        (e.domain ?? '').toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [entries, filter, search]);

  const handleDeleteEntry = useCallback((item: KnowledgeEntry) => {
    Alert.alert(
      'Șterge intrarea',
      `Ești sigur că vrei să ștergi "${item.label ?? item.content.slice(0, 40)}…"?`,
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: async () => {
            if (item.id == null) return;
            await deleteKnowledgeEntry(item.id);
            await load();
          },
        },
      ]
    );
  }, [load]);

  const handlePrune = async () => {
    setPruning(true);
    setPruneMsg('');
    try {
      const deleted = await autoPruneKnowledge();
      setPruneMsg(`Au fost eliminate ${deleted} intrări irelevante.`);
      await load();
    } catch {
      setPruneMsg('Eroare la curățare.');
    } finally {
      setPruning(false);
    }
  };

  const renderEntry = useCallback(({ item }: { item: KnowledgeEntry }) => {
    const meta = getSourceMeta(item.source);
    const { pct, color: barColor } = importanceBar(item.importance ?? 0.5);
    return (
      <View style={styles.entry}>
        <View style={styles.entryHeader}>
          <View style={[styles.badge, { borderColor: meta.color + '55', backgroundColor: meta.color + '18' }]}>
            <Feather name={meta.icon} size={10} color={meta.color} />
            <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>
          {item.domain && item.domain !== 'general' && (
            <Text style={styles.domain}>{item.domain}</Text>
          )}
          <View style={styles.spacer} />
          <View style={styles.importanceRow}>
            <View style={[styles.importanceBar, { width: Math.max(8, pct * 0.5), backgroundColor: barColor }]} />
            <Text style={[styles.importancePct, { color: barColor }]}>{pct}%</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteEntry(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="trash-2" size={13} color={colors.error} />
          </TouchableOpacity>
        </View>
        {item.label ? <Text style={styles.entryLabel} numberOfLines={1}>{item.label}</Text> : null}
        <Text style={styles.entryContent} numberOfLines={3}>{item.content}</Text>
        <View style={styles.entryFooter}>
          <Feather name="eye" size={10} color={colors.textMuted} />
          <Text style={styles.entryMeta}>{item.access_count ?? 0} accesări</Text>
        </View>
      </View>
    );
  }, [handleDeleteEntry]);

  const keyExtractor = useCallback((item: KnowledgeEntry, index: number) =>
    item.id != null ? String(item.id) : `entry-${index}`, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Cunoaștere</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Stats Bar */}
        {stats && (
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{stats.knowledgeCount}</Text>
              <Text style={styles.statLbl}>Cunoaștere</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.stat}>
              <Text style={styles.statVal}>{stats.cacheCount}</Text>
              <Text style={styles.statLbl}>Web cache</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.stat}>
              <Text style={styles.statVal}>{stats.entitiesCount}</Text>
              <Text style={styles.statLbl}>Entități</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.stat}>
              <Text style={styles.statVal}>{stats.conceptsCount}</Text>
              <Text style={styles.statLbl}>Concepte</Text>
            </View>
          </View>
        )}

        {/* Search */}
        <View style={styles.searchRow}>
          <Feather name="search" size={16} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Caută în cunoaștere..."
            placeholderTextColor={colors.textMuted}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips */}
        <View style={styles.filterRow}>
          {(
            ['all', 'web', 'user', 'dynamic_concept', 'gemini', 'openai'] as FilterMode[]
          ).map(f => {
            const label =
              f === 'all' ? 'Toate'
              : f === 'web' ? 'Web'
              : f === 'user' ? 'Personal'
              : f === 'dynamic_concept' ? 'Concepte'
              : f === 'gemini' ? 'Gemini'
              : 'ChatGPT';
            const activeColor =
              f === 'gemini' ? '#4285F4'
              : f === 'openai' ? '#10A37F'
              : colors.primary;
            return (
              <TouchableOpacity
                key={f}
                style={[
                  styles.chip,
                  filter === f && [styles.chipActive, { borderColor: activeColor, backgroundColor: activeColor + '22' }],
                ]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.chipText, filter === f && [styles.chipTextActive, { color: activeColor }]]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <Feather name="database" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>
              {search || filter !== 'all'
                ? 'Niciun rezultat pentru filtrele selectate'
                : 'Nicio cunoaștere acumulată încă\nÎncepe să interacționezi cu Jarvis!'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            renderItem={renderEntry}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text style={styles.listCount}>{filtered.length} intrări</Text>
            }
          />
        )}

        {/* Footer */}
        <View style={styles.footer}>
          {pruneMsg ? (
            <Text style={styles.pruneMsg}>{pruneMsg}</Text>
          ) : null}
          <TouchableOpacity
            style={[styles.pruneBtn, pruning && styles.pruneBtnDisabled]}
            onPress={handlePrune}
            disabled={pruning}
          >
            {pruning
              ? <ActivityIndicator size="small" color={colors.warning} />
              : <Feather name="trash-2" size={15} color={colors.warning} />
            }
            <Text style={styles.pruneBtnText}>Elimină cunoaștere irelevantă</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { fontSize: 20, fontFamily: 'Inter_700Bold', color: colors.text },
  closeBtn: { padding: 4 },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 18, fontFamily: 'Inter_700Bold', color: colors.primary },
  statLbl: { fontSize: 10, fontFamily: 'Inter_400Regular', color: colors.textMuted, marginTop: 1 },
  statDiv: { width: 1, height: 28, backgroundColor: colors.border },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 12, marginBottom: 8,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.border, gap: 8,
  },
  searchIcon: {},
  searchInput: { flex: 1, fontSize: 14, color: colors.text, fontFamily: 'Inter_400Regular', padding: 0 },
  filterRow: {
    flexDirection: 'row', gap: 6, paddingHorizontal: 16, marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: 'rgba(108,99,255,0.12)' },
  chipText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: colors.textSecondary },
  chipTextActive: { color: colors.primary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  emptyText: { fontSize: 14, color: colors.textMuted, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22 },
  list: { paddingHorizontal: 16, paddingBottom: 8 },
  listCount: { fontSize: 11, color: colors.textMuted, fontFamily: 'Inter_400Regular', marginBottom: 8, textAlign: 'right' },
  entry: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  entryHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1,
  },
  badgeText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  domain: { fontSize: 10, color: colors.textMuted, fontFamily: 'Inter_400Regular' },
  spacer: { flex: 1 },
  deleteBtn: { marginLeft: 6, padding: 2 },
  importanceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  importanceBar: { height: 4, borderRadius: 2 },
  importancePct: { fontSize: 10, fontFamily: 'Inter_500Medium' },
  entryLabel: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
  entryContent: { fontSize: 13, color: colors.text, fontFamily: 'Inter_400Regular', lineHeight: 19 },
  entryFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  entryMeta: { fontSize: 10, color: colors.textMuted, fontFamily: 'Inter_400Regular' },
  footer: {
    padding: 14, borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  pruneMsg: {
    fontSize: 12, color: colors.warning, fontFamily: 'Inter_400Regular',
    textAlign: 'center', marginBottom: 8,
  },
  pruneBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(255,215,64,0.1)',
    borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,215,64,0.25)',
  },
  pruneBtnDisabled: { opacity: 0.6 },
  pruneBtnText: { color: colors.warning, fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
