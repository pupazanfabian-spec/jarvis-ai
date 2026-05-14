import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LOBE_CONFIG = [
  { id: 'reguli', name: 'Reguli', color: '#00f0ff', max: 500 },
  { id: 'sistem', name: 'Sistem', color: '#00ff88', max: 1000 },
  { id: 'importanta', name: 'Importanță', color: '#ffaa00', max: 1000 },
  { id: 'mai_putin', name: 'Mai puțin', color: '#ff5500', max: 2000 },
  { id: 'irelevanta', name: 'Irelevantă', color: '#ff0066', max: 3000 },
];

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [memoryStats, setMemoryStats] = useState<Record<string, number>>({});
  const [apiStats, setApiStats] = useState<any>({});
  const [chatActivity, setChatActivity] = useState<any>({ total: 0, today: 0, week: 0, last7Days: [] });
  const [agents, setAgents] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      // Memory
      const stats: Record<string, number> = {};
      for (const lobe of LOBE_CONFIG) {
        const data = await AsyncStorage.getItem(`@jarvis_memory_${lobe.id}`);
        stats[lobe.id] = data ? JSON.parse(data).length : 0;
      }
      setMemoryStats(stats);

      // API
      const groqCount = await AsyncStorage.getItem('@jarvis_request_count_groq');
      const orCount = await AsyncStorage.getItem('@jarvis_request_count_openrouter');
      setApiStats({ groq: groqCount || '0', openrouter: orCount || '0' });

      // Chat
      const logsRaw = await AsyncStorage.getItem('@jarvis_agent_logs_v2');
      const logs = logsRaw ? JSON.parse(logsRaw) : [];
      const now = Date.now();
      const oneDay = 24 * 3600 * 1000;
      setChatActivity({
        total: logs.length,
        today: logs.filter((l: any) => now - l.timestamp < oneDay).length,
        week: logs.filter((l: any) => now - l.timestamp < 7 * oneDay).length,
        last7Days: Array(7).fill(0).map((_, i) => logs.filter((l: any) => {
            const diff = now - l.timestamp;
            return diff < (i + 1) * oneDay && diff >= i * oneDay;
        }).length)
      });

      // Agents
      const agentsRaw = await AsyncStorage.getItem('@jarvis_subagents_v2');
      setAgents(agentsRaw ? JSON.parse(agentsRaw) : []);

    } catch (e) { console.error(e); }
    setRefreshing(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top + 10 }]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}>
      <View style={styles.header}><Text style={styles.headerTitle}>SISTEM STATUS</Text><TouchableOpacity onPress={loadData}><Ionicons name="refresh" size={20} color="#00d4ff" /></TouchableOpacity></View>

      {/* Memory Status */}
      <View style={styles.card}><Text style={styles.cardTitle}>Memorie Status</Text>
        {LOBE_CONFIG.map(l => (
          <View key={l.id} style={styles.memRow}><View style={styles.row}><Text style={styles.memLabel}>{l.name}</Text><Text style={styles.memValue}>{memoryStats[l.id] || 0}/{l.max}</Text></View>
            <View style={styles.barBg}><View style={[styles.bar, { width: `${Math.min(100, ((memoryStats[l.id] || 0) / l.max) * 100)}%`, backgroundColor: l.color }]} /></View>
          </View>
        ))}
      </View>

      {/* API Keys */}
      <View style={styles.card}><Text style={styles.cardTitle}>API Keys Status</Text>
        <View style={styles.row}><Text style={styles.txt}>Groq Requests:</Text><Text style={styles.cyan}>{apiStats.groq}</Text></View>
        <View style={styles.row}><Text style={styles.txt}>OpenRouter Requests:</Text><Text style={styles.cyan}>{apiStats.openrouter}</Text></View>
      </View>

      {/* Chat Activity */}
      <View style={styles.card}><Text style={styles.cardTitle}>Activitate Chat</Text>
        <View style={styles.row}><Text style={styles.txt}>Total:</Text><Text style={styles.cyan}>{chatActivity.total}</Text></View>
        <View style={styles.chart}><View style={styles.barChart}>{chatActivity.last7Days.map((h: number, i: number) => <View key={i} style={[styles.chartBar, { height: `${Math.min(100, (h / (Math.max(...chatActivity.last7Days) || 1)) * 100)}%` }]} />)}</View></View>
      </View>

      {/* Active Agents */}
      <View style={styles.card}><Text style={styles.cardTitle}>Agenți Activi</Text>
        {agents.map((a: any, i: number) => <View key={i} style={styles.row}><Text style={styles.txt}>{a.name}</Text><Text style={styles.cyan}>{a.agentProvider}</Text></View>)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', letterSpacing: 2 },
  card: { backgroundColor: 'rgba(0,20,40,0.8)', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(0,212,255,0.3)' },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
  memRow: { marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  memLabel: { color: '#aaa', fontSize: 12 }, memValue: { color: '#fff', fontSize: 12 },
  barBg: { height: 6, backgroundColor: '#1a1a2e', borderRadius: 3, overflow: 'hidden' },
  bar: { height: '100%' },
  txt: { color: '#fff', fontSize: 13 }, cyan: { color: '#00d4ff', fontSize: 13 },
  chart: { height: 60, marginTop: 10 }, barChart: { flexDirection: 'row', alignItems: 'flex-end', height: '100%', gap: 4 },
  chartBar: { flex: 1, backgroundColor: '#00d4ff', borderRadius: 2 }
});
