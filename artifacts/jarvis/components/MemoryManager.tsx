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
  TextInput,
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
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<MemoryManagerEngine.MemoryEntry[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [cleaning, setCleaning] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MemoryManagerEngine.MemoryEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
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
      setEntries([...data].sort((a: any, b: any) => b.createdAt - a.createdAt));
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
    } else {
      setEntries([]);
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

  const handleUpdateEntry = async () => {
    if (!selectedEntry || !editContent.trim()) return;
    try {
      await MemoryManagerEngine.updateEntry(selectedEntry.id, { content: editContent.trim() });
      if (activeLobe) loadEntries(activeLobe);
      setIsEditing(false);
      setSelectedEntry({ ...selectedEntry, content: editContent.trim() });
      Alert.alert('Succes', 'Memoria a fost actualizată.');
    } catch (err) {
      Alert.alert('Eroare', 'Nu s-a putut salva modificarea.');
    }
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
    return entries.slice(0, 10).sort((a, b) => b.accessCount - a.accessCount);
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
              <TouchableOpacity onPress={() => { loadStats(); if(activeLobe) loadEntries(activeLobe); }} style={styles.iconBtn}>
                <Feather name="refresh-cw" size={18} color={colors.primary} />
              </TouchableOpacity>
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
              onEntryPress={(entry) => {
                setSelectedEntry(entry);
                setEditContent(entry.content);
                setIsEditing(false);
              }}
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
              onPress={async () => { 
                await MemoryManagerEngine.migrateLifecycle(); 
                loadStats(); 
                if(activeLobe) loadEntries(activeLobe);
                Alert.alert('Migrare', 'Procesul de lifecycle a fost finalizat.');
              }}
            >
              <Feather name="layers" size={16} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>MIGREAZĂ LIFECYCLE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Entry Detail Modal (View / Edit / Delete) */}
        {selectedEntry && (
          <Modal transparent animationType="slide" visible={!!selectedEntry}>
            <View style={styles.entryModalOverlay}>
              <View style={[styles.entryDetailCard, { borderColor: LOBE_CONFIG.find(l => l.id === selectedEntry.category)?.color || colors.primary }]}>
                 <View style={styles.detailHeader}>
                    <Text style={styles.detailSource}>{selectedEntry.source.toUpperCase()} | {selectedEntry.category.toUpperCase()}</Text>
                    <TouchableOpacity onPress={() => setSelectedEntry(null)}>
                       <Feather name="x" size={22} color={colors.text} />
                    </TouchableOpacity>
                 </View>
                 
                 <ScrollView style={styles.detailScroll} contentContainerStyle={{ paddingBottom: 20 }}>
                    {isEditing ? (
                      <TextInput
                        style={styles.editInput}
                        multiline
                        value={editContent}
                        onChangeText={setEditContent}
                        autoFocus
                      />
                    ) : (
                      <Text style={styles.detailContent}>{selectedEntry.content}</Text>
                    )}
                 </ScrollView>

                 <View style={styles.detailFooter}>
                    <View>
                       <Text style={styles.detailStat}>Accesări: {selectedEntry.accessCount}</Text>
                       <Text style={styles.detailStat}>Importanță: {selectedEntry.importance}/10</Text>
                       <Text style={styles.detailStat}>Creat: {new Date(selectedEntry.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.detailActions}>
                       {isEditing ? (
                         <TouchableOpacity onPress={handleUpdateEntry} style={[styles.iconBtnDetail, { backgroundColor: colors.primary }]}>
                            <Feather name="check" size={20} color="#000" />
                         </TouchableOpacity>
                       ) : (
                         <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.iconBtnDetail}>
                            <Feather name="edit-3" size={20} color={colors.primary} />
                         </TouchableOpacity>
                       )}
                       <TouchableOpacity onPress={() => handleDeleteEntry(selectedEntry.id)} style={[styles.iconBtnDetail, { backgroundColor: 'rgba(255,0,0,0.1)' }]}>
                          <Feather name="trash-2" size={20} color={colors.error} />
                       </TouchableOpacity>
                    </View>
                 </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Stats Modal */}
        {showStats && (
          <Modal transparent animationType="fade" visible={showStats}>
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
                      <TouchableOpacity key={item.id} style={styles.statItem} onPress={() => { setSelectedEntry(item); setShowStats(false); }}>
                         <Text style={styles.statRank}>#{i+1}</Text>
                         <Text style={styles.statItemText} numberOfLines={1}>{item.content}</Text>
                         <Text style={styles.statCount}>{item.accessCount}</Text>
                      </TouchableOpacity>
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
    gap: 12,
  },
  iconBtn: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
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
    opacity: 0.6,
  },
  categoryTitleContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowRadius: 10,
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
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  actionText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 11,
  },
  // Modal Styles
  entryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  entryDetailCard: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: '#050d14',
    borderWidth: 2,
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.primary,
    shadowRadius: 30,
    shadowOpacity: 0.4,
    elevation: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 12,
  },
  detailSource: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1,
  },
  detailScroll: {
    marginBottom: 20,
  },
  detailContent: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  editInput: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  detailFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  detailStat: {
    color: colors.textSecondary,
    fontSize: 10,
    marginBottom: 2,
    fontWeight: '600',
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtnDetail: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statsCard: {
    width: '100%',
    height: '75%',
    backgroundColor: '#050d14',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 20,
    padding: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  statRank: {
    color: colors.primary,
    fontWeight: '900',
    width: 35,
    fontSize: 12,
  },
  statItemText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    marginRight: 10,
  },
  statCount: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 50,
    fontWeight: '600',
  },
});
