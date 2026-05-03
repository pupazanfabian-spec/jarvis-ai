import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
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

export default function MemoryManager({ visible, onClose }: MemoryManagerProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [cleaning, setCleaning] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const s = await getDBStats();
      const h = await analyzeDatabaseHealth();
      const storage = await getStorageSize();
      setStats({ ...s, storage });
      setHealth(h);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) loadData();
  }, [visible]);

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

  const handleClearCache = async () => {
    setCleaning(true);
    try {
      await clearCacheDB();
      await clearFileCache();
      Alert.alert('Succes', 'Cache-ul a fost curățat.');
      loadData();
    } finally {
      setCleaning(false);
    }
  };

  const handleDeleteOld = async () => {
    Alert.alert(
      'Ștergere conversații vechi',
      'Ești sigur că vrei să ștergi conversațiile mai vechi de 30 de zile?',
      [
        { text: 'Anulează', style: 'cancel' },
        { 
          text: 'Șterge', 
          style: 'destructive',
          onPress: async () => {
            const count = await deleteOldConversations(30);
            Alert.alert('Succes', `Au fost șterse ${count} conversații vechi.`);
            loadData();
          }
        }
      ]
    );
  };

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

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
          ) : (
            <ScrollView style={styles.content}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Statistici Stocare</Text>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Cunoștințe salvate:</Text>
                  <Text style={styles.statValue}>{stats?.knowledgeCount || 0}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Fapte învățate:</Text>
                  <Text style={styles.statValue}>{stats?.factsCount || 0}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Entități urmărite:</Text>
                  <Text style={styles.statValue}>{stats?.entitiesCount || 0}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Cache web:</Text>
                  <Text style={styles.statValue}>{stats?.cacheCount || 0} intrări</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sănătate Date</Text>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Duplicate detectate:</Text>
                  <Text style={[styles.statValue, health?.duplicates > 0 && { color: colors.error }]}>
                    {health?.duplicates || 0}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Intrări învechite:</Text>
                  <Text style={styles.statValue}>{health?.staleEntries || 0}</Text>
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity 
                  style={[styles.actionBtn, cleaning && styles.disabled]} 
                  onPress={handleCompact}
                  disabled={cleaning}
                >
                  <Feather name="zap" size={18} color="#FFF" />
                  <Text style={styles.actionText}>Optimizează & Compactează</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionBtn, styles.secondaryBtn, cleaning && styles.disabled]} 
                  onPress={handleClearCache}
                  disabled={cleaning}
                >
                  <Feather name="trash-2" size={18} color={colors.text} />
                  <Text style={[styles.actionText, { color: colors.text }]}>Curăță Cache-ul</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionBtn, styles.dangerBtn]} 
                  onPress={handleDeleteOld}
                >
                  <Feather name="calendar" size={18} color="#FFF" />
                  <Text style={styles.actionText}>Șterge conv. > 30 zile</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    height: '80%',
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.05)',
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
    marginBottom: 30,
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
  dangerBtn: {
    backgroundColor: colors.error,
  },
  actionText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
  },
  disabled: {
    opacity: 0.5,
  },
});
