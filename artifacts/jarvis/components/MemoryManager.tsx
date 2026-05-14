import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as MemoryManager from '@/engine/memoryManager';
import { 
  getDBStats, 
  analyzeDatabaseHealth, 
  compactKnowledgeBase, 
  clearCacheDB 
} from '@/engine/database';
import { 
  getStorageSize, 
  clearCache as clearFileCache, 
  deleteOldConversations 
} from '@/engine/memoryFolder';
import Colors from '@/constants/colors';

const { colors } = Colors;

interface MemoryManagerProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'reguli' | 'sistem' | 'importanta' | 'mai_putin' | 'irelevanta' | 'system';

export default function MemoryManagerComponent({ visible, onClose }: MemoryManagerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('reguli');
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<MemoryManager.MemoryEntry[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [cleaning, setCleaning] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'system') {
        const s = await getDBStats();
        const h = await analyzeDatabaseHealth();
        const storage = await getStorageSize();
        const mStats = await MemoryManager.getStats();
        setStats({ ...s, storage, ...mStats });
        setHealth(h);
      } else {
        const data = await MemoryManager.getAllEntries(activeTab as any);
        setEntries(data.sort((a, b) => b.createdAt - a.createdAt));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (visible) loadData();
  }, [visible, activeTab, loadData]);

  const handleDeleteEntry = (id: string) => {
    Alert.alert('Ștergere', 'Ești sigur că vrei să ștergi această intrare?', [
      { text: 'Nu', style: 'cancel' },
      { text: 'Da', style: 'destructive', onPress: async () => {
        await MemoryManager.deleteEntry(id);
        loadData();
      }}
    ]);
  };

  const handleCompact = async () => {
    setCleaning(true);
    try {
      await compactKnowledgeBase();
      Alert.alert('Succes', 'Baza de date a fost compactată și duplicatele eliminate.');
      loadData();
    } catch {
      Alert.alert('Eroare', 'Nu s-a putut efectua compactarea.');
    } finally {
      setCleaning(false);
    }
  };

  const renderEntry = ({ item }: { item: MemoryManager.MemoryEntry }) => (
    <View style={styles.entryItem}>
      <View style={styles.entryHeader}>
        <Text style={styles.entrySource}>{item.source.toUpperCase()}</Text>
        <TouchableOpacity onPress={() => handleDeleteEntry(item.id)}>
          <Feather name="trash-2" size={16} color={colors.error} />
        </TouchableOpacity>
      </View>
      <Text style={styles.entryContent}>{item.content}</Text>
      <View style={styles.entryFooter}>
        <Text style={styles.entryDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        <Text style={styles.entryStats}>Accesări: {item.accessCount} | Imp: {item.importance}</Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Memory Manager</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(['reguli', 'sistem', 'importanta', 'mai_putin', 'irelevanta', 'system'] as TabType[]).map(tab => (
                <TouchableOpacity 
                  key={tab} 
                  style={[styles.tab, activeTab === tab && styles.activeTab]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
          ) : activeTab === 'system' ? (
            <ScrollView style={styles.content}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Capacitate Categorii</Text>
                <View style={styles.statRow}><Text style={styles.statLabel}>Reguli:</Text><Text style={styles.statValue}>{stats?.reguli || 0} / 500</Text></View>
                <View style={styles.statRow}><Text style={styles.statLabel}>Sistem:</Text><Text style={styles.statValue}>{stats?.sistem || 0} / 1000</Text></View>
                <View style={styles.statRow}><Text style={styles.statLabel}>Importantă:</Text><Text style={styles.statValue}>{stats?.importanta || 0} / 1000</Text></View>
                <View style={styles.statRow}><Text style={styles.statLabel}>Mai puțin:</Text><Text style={styles.statValue}>{stats?.mai_putin || 0} / 2000</Text></View>
                <View style={styles.statRow}><Text style={styles.statLabel}>Irelevantă:</Text><Text style={styles.statValue}>{stats?.irelevanta || 0} / 3000</Text></View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={handleCompact} disabled={cleaning}>
                  <Feather name="zap" size={18} color="#FFF" />
                  <Text style={styles.actionText}>Optimizează Baza de Date</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.secondaryBtn]} onPress={async () => { await MemoryManager.migrateLifecycle(); loadData(); }}>
                  <Feather name="refresh-cw" size={18} color={colors.text} />
                  <Text style={[styles.actionText, { color: colors.text }]}>Rulează Migrarea Acum</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <FlatList
              data={entries}
              renderItem={renderEntry}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={<Text style={styles.emptyText}>Nicio intrare în această categorie.</Text>}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '85%',
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  tabsContainer: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  tab: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.primary,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  entryItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entrySource: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    opacity: 0.8,
  },
  entryContent: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 8,
  },
  entryDate: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  entryStats: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 50,
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  statValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
