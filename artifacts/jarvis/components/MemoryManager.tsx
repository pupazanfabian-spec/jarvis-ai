import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as MemoryManagerEngine from '@/engine/memoryManager';
import { 
  compactKnowledgeBase, 
} from '@/engine/database';
import Colors from '@/constants/colors';
import BrainSphere from './BrainSphere';

const { colors } = Colors;

interface MemoryManagerProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'reguli' | 'sistem' | 'importanta' | 'mai_putin' | 'irelevanta';

const LOBE_CONFIG = [
  { id: 'reguli', name: 'Reguli', color: '#00f0ff', max: 500 },
  { id: 'sistem', name: 'Sistem', color: '#00ff88', max: 1000 },
  { id: 'importanta', name: 'Importanță', color: '#ffaa00', max: 1000 },
  { id: 'mai_putin', name: 'Mai puțin', color: '#ff5500', max: 2000 },
  { id: 'irelevanta', name: 'Irelevantă', color: '#ff0066', max: 3000 },
];

export default function MemoryManager({ visible, onClose }: MemoryManagerProps) {
  const [activeLobe, setActiveLobe] = useState<TabType | null>(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<MemoryManagerEngine.MemoryEntry[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [cleaning, setCleaning] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MemoryManagerEngine.MemoryEntry | null>(null);
  const [showStats, setShowStats] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const mStats = await MemoryManagerEngine.getStats();
      setStats(mStats);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadEntries = useCallback(async (category: TabType) => {
    setLoading(true);
    try {
      const data = await MemoryManagerEngine.getAllEntries(category as any);
      setEntries(data.sort((a: any, b: any) => b.createdAt - a.createdAt));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadStats();
      setActiveLobe(null);
    }
  }, [visible, loadStats]);

  useEffect(() => {
    if (activeLobe) {
      loadEntries(activeLobe);
    }
  }, [activeLobe, loadEntries]);

  const handleDeleteEntry = (id: string) => {
    Alert.alert('Ștergere', 'Ești sigur că vrei să ștergi această intrare?', [
      { text: 'Nu', style: 'cancel' },
      { text: 'Da', style: 'destructive', onPress: async () => {
        await MemoryManagerEngine.deleteEntry(id);
        if (activeLobe) loadEntries(activeLobe);
        loadStats();
        setSelectedEntry(null);
      }}
    ]);
  };

  const handleCompact = async () => {
    setCleaning(true);
    try {
      await compactKnowledgeBase();
      Alert.alert('Succes', 'Baza de date a fost optimizată.');
      loadStats();
    } catch {
      Alert.alert('Eroare', 'Eșec la optimizare.');
    } finally {
      setCleaning(false);
    }
  };

  const lobesData = useMemo(() => LOBE_CONFIG.map(l => ({
    ...l,
    count: stats?.[l.id] || 0
  })), [stats]);

  const topEntries = useMemo(() => {
    return entries.slice(0, 10);
  }, [entries]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        
        {/* Scanline HUD effect */}
        <View style={styles.scanline} />

        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>MEMORY CORE</Text>
              <Text style={styles.subtitle}>NEURAL NETWORK VISUALIZATION</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => setShowStats(true)} style={styles.iconBtn}>
                <Feather name="bar-chart-2" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.visualContainer}>
            {loading && activeLobe && (
              <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
            )}
            
            <BrainSphere 
              lobes={lobesData}
              activeLobe={activeLobe}
              onLobePress={(id) => setActiveLobe(activeLobe === id ? null : id as TabType)}
              entries={entries}
              onEntryPress={(entry) => setSelectedEntry(entry)}
            />
            
            {!activeLobe && (
              <Text style={styles.hintText}>SELECTEAZĂ UN LOB PENTRU A EXPLORA MEMORIA</Text>
            )}
            
            {activeLobe && (
              <View style={styles.categoryTitleContainer}>
                 <Text style={[styles.categoryTitle, { color: LOBE_CONFIG.find(l => l.id === activeLobe)?.color }]}>
                   {activeLobe.toUpperCase()}
                 </Text>
                 <TouchableOpacity onPress={() => setActiveLobe(null)}>
                    <Text style={styles.backBtnText}>ÎNAPOI LA CREIER</Text>
                 </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.actionBtn, cleaning && { opacity: 0.5 }]} 
              onPress={handleCompact} 
              disabled={cleaning}
            >
              <Feather name="zap" size={16} color="#000" />
              <Text style={styles.actionText}>OPTIMIZEAZĂ CORE</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionBtn, styles.secondaryBtn]} 
              onPress={async () => { await MemoryManagerEngine.migrateLifecycle(); loadStats(); }}
            >
              <Feather name="refresh-cw" size={16} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>MIGREAZĂ LIFECYCLE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Entry Detail Modal */}
        {selectedEntry && (
          <Modal transparent animationType="slide">
            <View style={styles.entryModalOverlay}>
              <View style={[styles.entryDetailCard, { borderColor: LOBE_CONFIG.find(l => l.id === activeLobe)?.color || colors.primary }]}>
                 <View style={styles.detailHeader}>
                    <Text style={styles.detailSource}>{selectedEntry.source.toUpperCase()}</Text>
                    <TouchableOpacity onPress={() => setSelectedEntry(null)}>
                       <Feather name="x" size={20} color={colors.text} />
                    </TouchableOpacity>
                 </View>
                 <ScrollView style={styles.detailScroll}>
                    <Text style={styles.detailContent}>{selectedEntry.content}</Text>
                 </ScrollView>
                 <View style={styles.detailFooter}>
                    <View>
                       <Text style={styles.detailStat}>Accesări: {selectedEntry.accessCount}</Text>
                       <Text style={styles.detailStat}>Importanță: {selectedEntry.importance}</Text>
                    </View>
                    <View style={styles.detailActions}>
                       <TouchableOpacity onPress={() => handleDeleteEntry(selectedEntry.id)} style={styles.deleteBtn}>
                          <Feather name="trash-2" size={18} color={colors.error} />
                       </TouchableOpacity>
                    </View>
                 </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Stats Modal */}
        {showStats && (
          <Modal transparent animationType="fade">
            <View style={styles.entryModalOverlay}>
              <View style={styles.statsCard}>
                 <View style={styles.detailHeader}>
                    <Text style={styles.title}>TOP 10 ACCESĂRI</Text>
                    <TouchableOpacity onPress={() => setShowStats(false)}>
                       <Feather name="x" size={20} color={colors.text} />
                    </TouchableOpacity>
                 </View>
                 <ScrollView style={{ flex: 1 }}>
                    {topEntries.map((item, i) => (
                      <View key={item.id} style={styles.statItem}>
                         <Text style={styles.statRank}>#{i+1}</Text>
                         <Text style={styles.statItemText} numberOfLines={1}>{item.content}</Text>
                         <Text style={styles.statCount}>{item.accessCount}</Text>
                      </View>
                    ))}
                    {topEntries.length === 0 && (
                      <Text style={styles.emptyText}>Nu sunt date statistice disponibile.</Text>
                    )}
                 </ScrollView>
              </View>
            </View>
          </Modal>
        )}

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
  },
  scanline: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    zIndex: 10,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 15,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 1,
    fontWeight: '700',
  },
  visualContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    position: 'absolute',
    top: 20,
  },
  hintText: {
    color: colors.textSecondary,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 20,
    textAlign: 'center',
  },
  categoryTitleContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
  },
  backBtnText: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  actionText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 11,
  },
  entryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  entryDetailCard: {
    width: '100%',
    maxHeight: '60%',
    backgroundColor: '#050d14',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.primary,
    shadowRadius: 20,
    shadowOpacity: 0.3,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 10,
  },
  detailSource: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 12,
  },
  detailScroll: {
    marginBottom: 15,
  },
  detailContent: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  detailFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  detailStat: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  detailActions: {
    flexDirection: 'row',
    gap: 15,
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,0,0,0.1)',
    borderRadius: 8,
  },
  statsCard: {
    width: '100%',
    height: '70%',
    backgroundColor: '#050d14',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  statRank: {
    color: colors.primary,
    fontWeight: '900',
    width: 30,
  },
  statItemText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    marginRight: 10,
  },
  statCount: {
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 50,
  },
});
