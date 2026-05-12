import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal,
  TextInput, Alert, Dimensions, PanResponder, Animated, FlatList,
  Switch, ActivityIndicator,
} from 'react-native';
import Svg, { Path, Circle, Polygon, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';

import * as keyManager from '@/engine/code-studio/keyManager';
import { Skill, getAllSkills, saveSkill, deleteSkill } from '@/engine/code-studio/skills';
import { 
  SubAgent, getSubAgents, deleteSubAgent, toggleSubAgent, 
  createSubAgent, callSubAgent, getAgentLogs, AgentLog, updateAgentPriority,
  updateSubAgent, clearAgentLogs
} from '@/engine/code-studio/subAgentManager';
import { seedDefaultAgents } from '@/engine/code-studio/defaultAgents';
import { useAIProvider } from '@/context/AIProviderContext';
import { useBrain } from '@/context/BrainContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_SIZE = 2000;
const NODE_WIDTH = 180;
const NODE_HEIGHT = 120;

type NodeType = 'Agent' | 'Skill' | 'Tool' | 'Output';
type ViewMode = 'canvas' | 'dashboard';

interface Node {
  id: string;
  type: NodeType;
  title: string;
  x: number;
  y: number;
  config: any;
}

interface Connection {
  fromId: string;
  toId: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Agent: '#6366f1', Skill: '#10b981', Tool: '#f59e0b', Output: '#ef4444',
};

const CATEGORY_ICONS: Record<string, string> = {
  Agent: 'hardware-chip-outline', Skill: 'book-outline', Tool: 'hammer-outline', Output: 'paper-plane-outline',
};

// ─── MEMOIZED COMPONENTS ─────────────────────────────────────────────────────

const ConnectionLines = React.memo(({ connections, nodes, deleteConnection }: any) => {
  if (!connections || !Array.isArray(connections) || !nodes) return null;
  return connections.map((conn: Connection, index: number) => {
    const from = nodes.find((n: Node) => n.id === conn.fromId);
    const to = nodes.find((n: Node) => n.id === conn.toId);
    if (!from || !to) return null;
    const x1 = from.x + NODE_WIDTH, y1 = from.y + NODE_HEIGHT / 2;
    const x2 = to.x, y2 = to.y + NODE_HEIGHT / 2;
    const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2;
    const path = `M ${x1} ${y1} C ${x1 + (x2 - x1) / 2} ${y1}, ${x1 + (x2 - x1) / 2} ${y2}, ${x2} ${y2}`;
    const angle = Math.atan2(y2 - y1, x2 - x1), sz = 10;
    const ax1 = x2 - sz * Math.cos(angle - Math.PI / 6), ay1 = y2 - sz * Math.sin(angle - Math.PI / 6);
    const ax2 = x2 - sz * Math.cos(angle + Math.PI / 6), ay2 = y2 - sz * Math.sin(angle + Math.PI / 6);
    return (
      <React.Fragment key={`c-${index}`}>
        <Path d={path} stroke={`url(#g-${index})`} strokeWidth="3" fill="none" opacity={0.8} />
        <Polygon points={`${x2},${y2} ${ax1},${ay1} ${ax2},${ay2}`} fill={CATEGORY_COLORS[from.type] || '#6366f1'} />
        <Circle cx={midX} cy={midY} r="10" fill="#1e293b" stroke="#ef4444" strokeWidth="1" />
        <SvgText x={midX} y={midY + 4} fontSize="12" fill="#ef4444" textAnchor="middle" fontWeight="bold" onPress={() => deleteConnection(conn)}>×</SvgText>
      </React.Fragment>
    );
  });
});

const DraggableNode = React.memo(({ node, onFinalizePosition, onPress, onConfig, onRun, onDelete, isSelected, onDragStart, onDragEnd, isActive, priority }: any) => {
  const pan = useRef(new Animated.ValueXY({ x: node.x || 0, y: node.y || 0 })).current;
  const valRef = useRef({ x: node.x || 0, y: node.y || 0 });
  useEffect(() => { const l = pan.addListener(v => valRef.current = v); return () => pan.removeListener(l); }, [pan]);
  useEffect(() => { pan.setValue({ x: node.x || 0, y: node.y || 0 }); }, [node.x, node.y]);

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 2 || Math.abs(gs.dy) > 2,
    onPanResponderGrant: () => { pan.extractOffset(); onDragStart(); },
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderRelease: () => { pan.flattenOffset(); onDragEnd(); onFinalizePosition(node.id, valRef.current.x, valRef.current.y); },
  })).current;

  const color = CATEGORY_COLORS[node.type] || '#6366f1';
  return (
    <Animated.View style={[styles.node, { position: 'absolute', left: pan.x, top: pan.y, borderLeftColor: color, borderColor: isSelected ? '#fff' : (isActive ? '#10b981' : '#334155'), borderWidth: isSelected ? 2 : 1 }]} {...panResponder.panHandlers}>
      <View style={styles.nodeHeader}>
        <Ionicons name={CATEGORY_ICONS[node.type] as any || 'help-outline'} size={20} color={color} />
        <View style={styles.nodeActions}>
          <TouchableOpacity onPress={onRun} style={styles.nodeMiniBtn}><Ionicons name="play" size={12} color="#fff" /></TouchableOpacity>
          <TouchableOpacity onPress={onConfig} style={styles.nodeMiniBtn}><Ionicons name="settings" size={12} color="#fff" /></TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.nodeMiniBtn}><Ionicons name="close" size={12} color="#ef4444" /></TouchableOpacity>
        </View>
      </View>
      <Text style={styles.nodeTitle} numberOfLines={1}>{node.title || 'Untitled'}</Text>
      <Text style={styles.nodeType}>{node.type}</Text>
      {priority && <View style={styles.priorityBadge}><Text style={styles.priorityText}>P{priority}</Text></View>}
      <TouchableOpacity style={styles.connectPlusBtn} onPress={onPress}><Ionicons name="add" size={14} color="#fff" /></TouchableOpacity>
    </Animated.View>
  );
});

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function CodeStudio() {
  const insets = useSafeAreaInsets();
  const { settings } = useAIProvider();
  const [viewMode, setViewMode] = useState<ViewMode>('canvas');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [subAgents, setSubAgents] = useState<SubAgent[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [scale, setScale] = useState(1.0);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isConnectionModalVisible, setIsConnectionModalVisible] = useState(false);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);
  const isDraggingRef = useRef(false);
  const canvasPan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Wizard State
  const [isWizardVisible, setIsWizardVisible] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newAgentConfig, setNewAgentConfig] = useState<Partial<SubAgent>>({
    name: '', description: '', agentProvider: 'groq', skills: [], tools: [], systemPrompt: '', priority: 5,
  });

  // Editor States
  const [isSkillEditorVisible, setIsSkillEditorVisible] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Partial<Skill>>({ name: '', category: 'custom', systemPrompt: '', triggers: [] });
  const [isLogsVisible, setIsLogsVisible] = useState(false);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [isSandboxVisible, setIsSandboxVisible] = useState(false);
  const [sandboxAgent, setSandboxAgent] = useState<SubAgent | null>(null);
  const [sandboxMsg, setSandboxMsg] = useState('');
  const [sandboxResp, setSandboxResp] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const initWorkspace = useCallback(async () => {
    try {
      await keyManager.syncKeysFromContext(settings);
      await seedDefaultAgents();
      const [sa, sk, saved] = await Promise.all([getSubAgents(), getAllSkills(), AsyncStorage.getItem('@code_studio_workspace')]);
      setSubAgents(sa || []); setAllSkills(sk || []);
      if (saved) { const p = JSON.parse(saved); setNodes(p.nodes || []); setConnections(p.connections || []); }
    } catch (e) { console.error('[Studio] Init error', e); }
  }, [settings]);

  useFocusEffect(useCallback(() => { initWorkspace(); }, [initWorkspace]));

  const saveWS = useCallback((n: Node[], c: Connection[]) => {
    AsyncStorage.setItem('@code_studio_workspace', JSON.stringify({ nodes: n, connections: c }));
  }, []);

  const canvasPanResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => !isDraggingRef.current,
    onMoveShouldSetPanResponder: (_, gs) => !isDraggingRef.current && (Math.abs(gs.dx) > 2 || Math.abs(gs.dy) > 2),
    onPanResponderGrant: () => canvasPan.extractOffset(),
    onPanResponderMove: Animated.event([null, { dx: canvasPan.x, dy: canvasPan.y }], { useNativeDriver: false }),
    onPanResponderRelease: () => canvasPan.flattenOffset(),
  })).current;

  const memoizedGrid = useMemo(() => {
    const dots = []; const step = 100;
    for (let x = 0; x < CANVAS_SIZE; x += step) for (let y = 0; y < CANVAS_SIZE; y += step) dots.push(<Circle key={`d-${x}-${y}`} cx={x} cy={y} r="1" fill="rgba(255,255,255,0.1)" />);
    return dots;
  }, []);

  const handleSaveAgent = async () => {
    if (!newAgentConfig.name) return Alert.alert('Eroare', 'Numele este obligatoriu.');
    try {
      const agent = await createSubAgent(newAgentConfig);
      const newNode: Node = { id: agent.id, type: 'Agent', title: agent.name, x: 200, y: 200, config: { agentId: agent.id } };
      const updatedNodes = [...nodes, newNode];
      setNodes(updatedNodes); saveWS(updatedNodes, connections);
      await initWorkspace(); setIsWizardVisible(false); setWizardStep(1);
    } catch { Alert.alert('Eroare', 'Salvare eșuată.'); }
  };

  const handleSaveSkill = async () => {
    if (!editingSkill.name || !editingSkill.systemPrompt) return Alert.alert('Eroare', 'Completează câmpurile.');
    await saveSkill({ ...editingSkill as Skill, id: editingSkill.id || `sk-${Date.now()}` });
    await initWorkspace(); setIsSkillEditorVisible(false);
  };

  const handleTestAgent = async () => {
    if (!sandboxAgent || !sandboxMsg) return;
    setIsThinking(true); setSandboxResp('');
    try {
      const res = await callSubAgent(sandboxAgent.id, sandboxMsg);
      setSandboxResp(res.response);
    } catch (e: any) { setSandboxResp(`Eroare: ${e.message}`); }
    finally { setIsThinking(false); }
  };

  const autoGeneratePrompt = () => {
      const selected = allSkills.filter(s => newAgentConfig.skills?.includes(s.id));
      const prompt = selected.map(s => `### ${s.name}\n${s.systemPrompt}`).join('\n\n');
      setNewAgentConfig({ ...newAgentConfig, systemPrompt: prompt });
  };

  const renderCanvas = () => (
    <View style={styles.canvasContainer} {...canvasPanResponder.panHandlers}>
      <Animated.View style={[styles.canvas, { width: CANVAS_SIZE, height: CANVAS_SIZE, transform: [{ scale }, { translateX: canvasPan.x }, { translateY: canvasPan.y }], transformOrigin: [0, 0, 0] }]}>
        <Svg style={StyleSheet.absoluteFill}>
          <Defs>{connections.map((c, i) => {
            const f = nodes.find(n => n.id === c.fromId), t = nodes.find(n => n.id === c.toId);
            if (!f || !t) return null;
            return <LinearGradient key={`g-${i}`} id={`g-${i}`} x1="0%" y1="0%" x2="100%" y2="0%"><Stop offset="0%" stopColor={CATEGORY_COLORS[f.type]} /><Stop offset="100%" stopColor={CATEGORY_COLORS[t.type]} /></LinearGradient>
          })}</Defs>
          {memoizedGrid}
          <ConnectionLines connections={connections} nodes={nodes} deleteConnection={(c: any) => { const u = connections.filter(x => x !== c); setConnections(u); saveWS(nodes, u); }} />
        </Svg>
        {nodes.map(n => (
          <DraggableNode key={n.id} node={n} onFinalizePosition={(id: string, x: number, y: number) => { const u = nodes.map(nx => nx.id === id ? { ...nx, x, y } : nx); setNodes(u); saveWS(u, connections); }}
            onPress={() => { setConnectingFromId(n.id); setIsConnectionModalVisible(true); }}
            onRun={() => { const a = subAgents.find(s => s.id === n.id || s.id === n.config?.agentId); if (a) { setSandboxAgent(a); setIsSandboxVisible(true); } }}
            onConfig={() => { 
                const a = subAgents.find(s => s.id === n.id || s.id === n.config?.agentId); 
                if (a) { setNewAgentConfig(a); setIsWizardVisible(true); setWizardStep(1); }
                else if (n.type === 'Skill') { const s = allSkills.find(sk => sk.id === n.id); if (s) { setEditingSkill(s); setIsSkillEditorVisible(true); } }
            }}
            onDelete={() => { const un = nodes.filter(x => x.id !== n.id), uc = connections.filter(x => x.fromId !== n.id && x.toId !== n.id); setNodes(un); setConnections(uc); saveWS(un, uc); }}
            onDragStart={() => isDraggingRef.current = true} onDragEnd={() => isDraggingRef.current = false}
            isActive={subAgents.some(s => s.isActive && (s.id === n.id || s.id === n.config?.agentId))}
            priority={subAgents.find(s => s.id === n.id || s.id === n.config?.agentId)?.priority}
          />
        ))}
      </Animated.View>
      <View style={[styles.zoomControls, { bottom: 90 + insets.bottom }]}>
        <TouchableOpacity style={styles.zoomBtn} onPress={() => setScale(Math.min(scale + 0.1, 2.0))}><Ionicons name="add" size={20} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.zoomLevel} onPress={() => setScale(1.0)}><Text style={styles.zoomLevelText}>{Math.round(scale * 100)}%</Text></TouchableOpacity>
        <TouchableOpacity style={styles.zoomBtn} onPress={() => setScale(Math.max(scale - 0.1, 0.3))}><Ionicons name="remove" size={20} color="#fff" /></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12, minHeight: 60 + insets.top }]}>
        <View style={styles.tabSwitcher}>
          <TouchableOpacity style={[styles.tabBtn, viewMode === 'canvas' && styles.tabBtnActive]} onPress={() => setViewMode('canvas')}><Text style={[styles.tabBtnText, viewMode === 'canvas' && styles.tabBtnTextActive]}>Canvas</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, viewMode === 'dashboard' && styles.tabBtnActive]} onPress={() => setViewMode('dashboard')}><Text style={[styles.tabBtnText, viewMode === 'dashboard' && styles.tabBtnTextActive]}>Dashboard</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.templatesBtn} onPress={() => setIsAddModalVisible(true)}><Ionicons name="layers-outline" size={20} color="#fff" /><Text style={styles.templatesBtnText}>Workspace</Text></TouchableOpacity>
      </View>

      {viewMode === 'canvas' ? renderCanvas() : (
        <View style={styles.dashboard}>
          <View style={styles.row}>
              <Text style={styles.dashboardTitle}>Agenți ({subAgents.length})</Text>
              <TouchableOpacity onPress={async () => { const l = await getAgentLogs(); setAgentLogs(l); setIsLogsVisible(true); }}><Text style={styles.logsLink}>Vezi Logs</Text></TouchableOpacity>
          </View>
          <FlatList data={subAgents} keyExtractor={item => item.id} renderItem={({ item }) => (
            <View style={styles.agentCard}>
              <View style={styles.agentCardHeader}><Text style={styles.agentCardName}>{item.name}</Text><Switch value={item.isActive} onValueChange={v => toggleSubAgent(item.id, v).then(initWorkspace)} /></View>
              <Text style={styles.agentCardMeta}>{item.agentProvider.toUpperCase()} • P{item.priority} • {item.skills.length} skills</Text>
              <View style={styles.agentCardActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => { setSandboxAgent(item); setIsSandboxVisible(true); }}><Text style={styles.actionBtnText}>Test</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => { setNewAgentConfig(item); setIsWizardVisible(true); setWizardStep(1); }}><Text style={styles.actionBtnText}>Edit</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ef4444' }]} onPress={() => deleteSubAgent(item.id).then(initWorkspace)}><Ionicons name="trash" size={14} color="#fff" /></TouchableOpacity>
              </View>
            </View>
          )} ListEmptyComponent={<Text style={styles.emptyText}>Niciun agent activ.</Text>} />
        </View>
      )}

      <TouchableOpacity style={[styles.fab, { bottom: 80 + insets.bottom }]} onPress={() => { setNewAgentConfig({ name: '', description: '', agentProvider: 'groq', skills: [], tools: [], systemPrompt: '', priority: 5 }); setIsWizardVisible(true); setWizardStep(1); }}><Ionicons name="add" size={32} color="#fff" /></TouchableOpacity>

      {/* MODALS */}
      <Modal visible={isAddModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adaugă Node</Text>
            <View style={styles.nodeTypeGrid}>{['Agent', 'Skill', 'Tool', 'Output'].map(t => (
              <TouchableOpacity key={t} style={[styles.typeBtn, { borderLeftColor: CATEGORY_COLORS[t] }]} onPress={() => { const id = Math.random().toString(36).substr(2,9); const n = [...nodes, { id, type: t as any, title: `New ${t}`, x: 100, y: 100, config: {} }]; setNodes(n); saveWS(n, connections); setIsAddModalVisible(false); }}>
                <Ionicons name={CATEGORY_ICONS[t] as any} size={24} color={CATEGORY_COLORS[t]} /><Text style={styles.typeBtnText}>{t}</Text>
              </TouchableOpacity>
            ))}</View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsAddModalVisible(false)}><Text style={styles.closeBtnText}>Închide</Text></TouchableOpacity>
        </View></View>
      </Modal>

      <Modal visible={isConnectionModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Conectează la...</Text>
            <FlatList data={nodes.filter(n => n.id !== connectingFromId && !connections.some(c => c.fromId === connectingFromId && c.toId === n.id))} keyExtractor={item => item.id} renderItem={({ item }) => (
              <TouchableOpacity style={styles.connectionItem} onPress={() => { if (!connectingFromId) return; const c = [...connections, { fromId: connectingFromId, toId: item.id }]; setConnections(c); saveWS(nodes, c); setConnectingFromId(null); setIsConnectionModalVisible(false); }}>
                <Ionicons name={CATEGORY_ICONS[item.type] as any} size={20} color={CATEGORY_COLORS[item.type]} /><Text style={styles.connectionItemText}>{item.title}</Text>
              </TouchableOpacity>
            )} ListEmptyComponent={<Text style={styles.emptyText}>Niciun nod disponibil.</Text>} />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsConnectionModalVisible(false)}><Text style={styles.closeBtnText}>Anulează</Text></TouchableOpacity>
        </View></View>
      </Modal>

      <Modal visible={isWizardVisible} transparent={false} animationType="slide">
        <SafeAreaView style={styles.fullscreenModal} edges={['top', 'bottom']}>
          <View style={styles.wizardContent}>
            <View style={styles.wizardHeader}><Text style={styles.wizardTitle}>{newAgentConfig.id ? 'Editare Agent' : 'Agent Wizard'}</Text><Text style={styles.wizardStep}>Pas {wizardStep}/5</Text></View>
            {wizardStep === 1 && <View style={styles.wizardBody}><Text style={styles.inputLabel}>Nume Agent</Text><TextInput style={styles.input} value={newAgentConfig.name} onChangeText={t => setNewAgentConfig({...newAgentConfig, name: t})} /><Text style={styles.inputLabel}>Descriere</Text><TextInput style={[styles.input, { height: 80 }]} value={newAgentConfig.description} onChangeText={t => setNewAgentConfig({...newAgentConfig, description: t})} multiline /></View>}
            {wizardStep === 2 && <View style={styles.wizardBody}><Text style={styles.inputLabel}>Provider</Text><View style={styles.row}>{['groq', 'openrouter'].map(p => (<TouchableOpacity key={p} style={[styles.providerTab, newAgentConfig.agentProvider === p && styles.providerTabActive]} onPress={() => setNewAgentConfig({...newAgentConfig, agentProvider: p as any})}><Text style={styles.providerTabText}>{p.toUpperCase()}</Text></TouchableOpacity>))}</View></View>}
            {wizardStep === 3 && <View style={styles.wizardBody}><Text style={styles.inputLabel}>Selectează Skills</Text><ScrollView style={{ height: 300 }}>{allSkills.map(s => (
                <TouchableOpacity key={s.id} style={[styles.selectableItem, newAgentConfig.skills?.includes(s.id) && styles.selectedItem]} onPress={() => { const sk = newAgentConfig.skills || []; setNewAgentConfig({...newAgentConfig, skills: sk.includes(s.id) ? sk.filter(x=>x!==s.id) : [...sk, s.id]}); }}>
                  <Text style={styles.selectableText}>{s.name}</Text>
                </TouchableOpacity>
            ))}</ScrollView></View>}
            {wizardStep === 4 && <View style={styles.wizardBody}><Text style={styles.inputLabel}>Unelte (Tools)</Text>{['webSearch', 'memory', 'codeRunner'].map(t => (
                <View key={t} style={styles.toolRow}><Text style={styles.toolText}>{t}</Text><Switch value={newAgentConfig.tools?.includes(t)} onValueChange={v => { const ts = newAgentConfig.tools || []; setNewAgentConfig({...newAgentConfig, tools: v ? [...ts, t] : ts.filter(x=>x!==t)}); }} /></View>
            ))}<Text style={styles.inputLabel}>Prioritate: {newAgentConfig.priority}</Text><View style={styles.row}>{[1,3,5,8,10].map(p => (<TouchableOpacity key={p} style={[styles.priorityBtn, newAgentConfig.priority === p && styles.priorityBtnActive]} onPress={() => setNewAgentConfig({...newAgentConfig, priority: p})}><Text style={styles.priorityBtnText}>{p}</Text></TouchableOpacity>))}</View></View>}
            {wizardStep === 5 && <View style={styles.wizardBody}><View style={styles.row}><Text style={styles.inputLabel}>System Prompt</Text><TouchableOpacity onPress={autoGeneratePrompt}><Text style={styles.autoGenLink}>Auto-generează din Skills</Text></TouchableOpacity></View><TextInput style={[styles.input, { height: 200 }]} value={newAgentConfig.systemPrompt} onChangeText={t => setNewAgentConfig({...newAgentConfig, systemPrompt: t})} multiline /><TouchableOpacity style={styles.finalizeBtn} onPress={handleSaveAgent}><Text style={styles.finalizeBtnText}>Salvează Agent</Text></TouchableOpacity></View>}
            <View style={styles.wizardFooter}><TouchableOpacity onPress={() => wizardStep > 1 && setWizardStep(wizardStep - 1)} disabled={wizardStep === 1}><Text style={styles.wizardBtnText}>Înapoi</Text></TouchableOpacity><TouchableOpacity onPress={() => setIsWizardVisible(false)}><Text style={styles.closeWizardText}>Anulează</Text></TouchableOpacity>{wizardStep < 5 && <TouchableOpacity onPress={() => setWizardStep(wizardStep + 1)}><Text style={styles.wizardBtnText}>Înainte</Text></TouchableOpacity>}</View>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={isSkillEditorVisible} transparent animationType="slide"><View style={styles.modalOverlay}><View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Editor Skill</Text>
        <TextInput style={styles.input} placeholder="Nume Skill" value={editingSkill.name} onChangeText={t => setEditingSkill({...editingSkill, name: t})} />
        <TextInput style={[styles.input, { height: 150, marginTop: 10 }]} placeholder="System Prompt" value={editingSkill.systemPrompt} onChangeText={t => setEditingSkill({...editingSkill, systemPrompt: t})} multiline />
        <TextInput style={[styles.input, { marginTop: 10 }]} placeholder="Triggers (comma separated)" value={editingSkill.triggers?.join(',')} onChangeText={t => setEditingSkill({...editingSkill, triggers: t.split(',')})} />
        <TouchableOpacity style={styles.finalizeBtn} onPress={handleSaveSkill}><Text style={styles.finalizeBtnText}>Salvează</Text></TouchableOpacity>
        <TouchableOpacity style={styles.closeBtn} onPress={() => setIsSkillEditorVisible(false)}><Text style={styles.closeBtnText}>Închide</Text></TouchableOpacity>
      </View></View></Modal>

      <Modal visible={isSandboxVisible} transparent={false} animationType="fade"><SafeAreaView style={styles.fullscreenModal}><View style={styles.sandboxContent}>
        <View style={styles.wizardHeader}><Text style={styles.wizardTitle}>Sandbox: {sandboxAgent?.name}</Text><TouchableOpacity onPress={() => setIsSandboxVisible(false)}><Ionicons name="close" size={28} color="#fff" /></TouchableOpacity></View>
        <ScrollView style={styles.sandboxOutput}><Text style={styles.responseText}>{sandboxResp || 'Aștept mesaj de test...'}</Text>{isThinking && <ActivityIndicator color="#6366f1" />}</ScrollView>
        <View style={styles.sandboxInputRow}><TextInput style={styles.sandboxInput} value={sandboxMsg} onChangeText={setSandboxMsg} placeholder="Mesaj test..." placeholderTextColor="#475569" /><TouchableOpacity style={styles.sendBtn} onPress={handleTestAgent}><Ionicons name="send" size={20} color="#fff" /></TouchableOpacity></View>
      </View></SafeAreaView></Modal>

      <Modal visible={isLogsVisible} transparent animationType="fade"><View style={styles.modalOverlay}><View style={styles.modalContent}>
        <View style={styles.row}><Text style={styles.modalTitle}>Logs Sistem</Text><TouchableOpacity onPress={async () => { await clearAgentLogs(); setAgentLogs([]); }}><Text style={styles.clearLogs}>Șterge tot</Text></TouchableOpacity></View>
        <FlatList style={{ maxHeight: 400 }} data={agentLogs} keyExtractor={(item, index) => index.toString()} renderItem={({ item }) => (
          <View style={styles.logItem}><Text style={styles.logTime}>{new Date(item.timestamp).toLocaleTimeString()} - {item.agentName}</Text><Text style={styles.logText} numberOfLines={1}>IN: {item.input}</Text><Text style={[styles.logStatus, { color: item.success ? '#10b981' : '#ef4444' }]}>{item.success ? 'Success' : 'Fail'} • {item.durationMs}ms</Text></View>
        )} />
        <TouchableOpacity style={styles.closeBtn} onPress={() => setIsLogsVisible(false)}><Text style={styles.closeBtnText}>Închide</Text></TouchableOpacity>
      </View></View></Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { backgroundColor: '#1e293b', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#334155' },
  tabSwitcher: { flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 10, padding: 4 },
  tabBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 8 },
  tabBtnActive: { backgroundColor: '#334155' },
  tabBtnText: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold' },
  tabBtnTextActive: { color: '#fff' },
  templatesBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6366f1', padding: 8, borderRadius: 8 },
  templatesBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
  canvasContainer: { flex: 1, position: 'relative', overflow: 'hidden' },
  canvas: { backgroundColor: '#0f172a' },
  node: { width: NODE_WIDTH, padding: 10, backgroundColor: '#1e293b', borderRadius: 10, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 8, elevation: 10 },
  nodeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  nodeActions: { flexDirection: 'row' },
  nodeMiniBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
  nodeTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  nodeType: { color: '#94a3b8', fontSize: 9, textTransform: 'uppercase' },
  priorityBadge: { position: 'absolute', bottom: -6, left: -6, backgroundColor: '#f59e0b', borderRadius: 6, paddingHorizontal: 4, paddingVertical: 1 },
  priorityText: { color: '#fff', fontSize: 8, fontWeight: 'bold' },
  connectPlusBtn: { position: 'absolute', right: -12, top: 48, width: 24, height: 24, borderRadius: 12, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#1e293b', zIndex: 10 },
  dashboard: { flex: 1, padding: 16 },
  dashboardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  logsLink: { color: '#6366f1', fontWeight: 'bold' },
  agentCard: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 10 },
  agentCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  agentCardName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  agentCardMeta: { color: '#94a3b8', fontSize: 11, marginTop: 4 },
  agentCardActions: { flexDirection: 'row', marginTop: 12 },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#334155', marginRight: 8 },
  actionBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  zoomControls: { position: 'absolute', left: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 20, padding: 5, shadowColor: '#000', shadowOpacity: 0.3, elevation: 5, zIndex: 1001 },
  zoomBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center', marginHorizontal: 2 },
  zoomLevel: { paddingHorizontal: 10 },
  zoomLevelText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  fab: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', elevation: 8, zIndex: 1000 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1e293b', borderRadius: 20, padding: 20, maxHeight: '90%' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  typeBtn: { width: '100%', backgroundColor: '#0f172a', padding: 14, borderRadius: 10, borderLeftWidth: 4, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  typeBtnText: { color: '#fff', marginLeft: 10, fontWeight: 'bold' },
  nodeTypeGrid: { width: '100%' },
  connectionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', padding: 14, borderRadius: 10, marginBottom: 10 },
  connectionItemText: { color: '#fff', marginLeft: 12, fontWeight: 'bold' },
  closeBtn: { marginTop: 16, alignItems: 'center' },
  closeBtnText: { color: '#94a3b8', fontWeight: 'bold' },
  fullscreenModal: { flex: 1, backgroundColor: '#0f172a' },
  wizardContent: { flex: 1, padding: 20 },
  wizardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  wizardTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  wizardStep: { color: '#6366f1', fontWeight: 'bold' },
  wizardBody: { flex: 1 },
  inputLabel: { color: '#94a3b8', fontSize: 14, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#1e293b', borderRadius: 12, padding: 14, color: '#fff', borderWidth: 1, borderColor: '#334155' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  providerTab: { padding: 12, borderRadius: 10, backgroundColor: '#1e293b', flex: 0.48, alignItems: 'center' },
  providerTabActive: { backgroundColor: '#6366f1' },
  providerTabText: { color: '#fff', fontWeight: 'bold' },
  selectableItem: { padding: 14, borderRadius: 12, backgroundColor: '#1e293b', marginBottom: 8 },
  selectedItem: { borderColor: '#6366f1', borderWidth: 2 },
  selectableText: { color: '#fff' },
  toolRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  toolText: { color: '#fff' },
  priorityBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  priorityBtnActive: { backgroundColor: '#f59e0b' },
  priorityBtnText: { color: '#fff', fontWeight: 'bold' },
  autoGenLink: { color: '#10b981', fontWeight: 'bold', fontSize: 12 },
  finalizeBtn: { backgroundColor: '#10b981', padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 20 },
  finalizeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  wizardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  wizardBtnText: { color: '#6366f1', fontWeight: 'bold', fontSize: 16 },
  closeWizardText: { color: '#ef4444', fontWeight: 'bold' },
  sandboxContent: { flex: 1, padding: 20 },
  sandboxOutput: { flex: 1, backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 16 },
  responseText: { color: '#fff', fontSize: 15, lineHeight: 22 },
  sandboxInputRow: { flexDirection: 'row', alignItems: 'center' },
  sandboxInput: { flex: 1, backgroundColor: '#1e293b', borderRadius: 12, padding: 14, color: '#fff', marginRight: 12 },
  sendBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
  logItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  logTime: { color: '#6366f1', fontSize: 10 },
  logText: { color: '#fff', fontSize: 12 },
  logStatus: { fontSize: 10, fontWeight: 'bold' },
  clearLogs: { color: '#ef4444', fontSize: 12, fontWeight: 'bold' },
  emptyText: { color: '#475569', textAlign: 'center', marginTop: 40 },
});
