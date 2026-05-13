import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal,
  TextInput, Alert, Dimensions, PanResponder, Animated, FlatList,
  Switch, ActivityIndicator, Platform, KeyboardAvoidingView,
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

const SKILL_CATEGORIES = ['conversatie', 'scriptare', 'codare', 'cercetare', 'verificare', 'rulare', 'memorie', 'orchestrare', 'custom'];
const TOOL_TYPES = ['webSearch', 'memory', 'codeRunner', 'apiCall', 'fileSystem'];
const OUTPUT_FORMATS = ['text', 'json', 'markdown', 'code'];

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
      <React.Fragment key={`conn-${conn.fromId}-${conn.toId}-${index}`}>
        <Path d={path} stroke={`url(#g-${index})`} strokeWidth="3" fill="none" opacity={0.8} />
        <Polygon points={`${x2},${y2} ${ax1},${ay1} ${ax2},${ay2}`} fill={CATEGORY_COLORS[from.type] || '#6366f1'} />
        <Circle cx={midX} cy={midY} r="12" fill="#1e293b" stroke="#ef4444" strokeWidth="1" />
        <SvgText x={midX} y={midY + 4} fontSize="14" fill="#ef4444" textAnchor="middle" fontWeight="bold" onPress={() => deleteConnection(conn)}>×</SvgText>
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
      {priority !== undefined && <View style={styles.priorityBadge}><Text style={styles.priorityText}>P{priority}</Text></View>}
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
  const [showApiKey, setShowApiKey] = useState(false);

  // Editor States
  const [isSkillEditorVisible, setIsSkillEditorVisible] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Partial<Skill>>({ name: '', category: 'custom', systemPrompt: '', triggers: [] });
  const [isToolEditorVisible, setIsToolEditorVisible] = useState(false);
  const [isOutputEditorVisible, setIsOutputEditorVisible] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);

  const [isLogsVisible, setIsLogsVisible] = useState(false);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [logFilter, setLogFilter] = useState<'all' | 'success' | 'failed'>('all');
  
  const [isSandboxVisible, setIsSandboxVisible] = useState(false);
  const [sandboxAgent, setSandboxAgent] = useState<SubAgent | null>(null);
  const [sandboxMsg, setSandboxMsg] = useState('');
  const [sandboxResp, setSandboxResp] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const saveWS = useCallback((n: Node[], c: Connection[]) => {
    AsyncStorage.setItem('@code_studio_workspace', JSON.stringify({ nodes: n, connections: c }));
  }, []);

  const debouncedSave = useCallback((n: Node[], c: Connection[]) => {
      saveWS(n, c);
  }, [saveWS]);

  const initWorkspace = useCallback(async () => {
    try {
      await keyManager.syncKeysFromContext(settings);
      await seedDefaultAgents();
      const [sa, sk, saved] = await Promise.all([getSubAgents(), getAllSkills(), AsyncStorage.getItem('@code_studio_workspace')]);
      
      // Deduplicate subAgents
      const uniqueSA = (() => {
          const seen = new Set();
          return (sa || []).filter(a => a && (seen.has(a.id) ? false : seen.add(a.id)));
      })();
      setSubAgents(uniqueSA);
      
      // Deduplicate skills
      const uniqueSK = (() => {
          const seen = new Set();
          return (sk || []).filter(s => s && (seen.has(s.id) ? false : seen.add(s.id)));
      })();
      setAllSkills(uniqueSK);
      
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedNodes = parsed.nodes || [];
        const savedConns = parsed.connections || [];
        
        const existingNodeIds = new Set(savedNodes.map((n: Node) => n.id || (n.config?.agentId)));
        const missingAgentNodes = (uniqueSA || [])
          .filter(agent => !existingNodeIds.has(agent.id))
          .map((agent, i) => ({
            id: agent.id,
            type: 'Agent' as NodeType,
            title: agent.name,
            x: 100 + ((savedNodes.length + i) % 3) * 220,
            y: 150 + Math.floor((savedNodes.length + i) / 3) * 180,
            config: { agentId: agent.id }
          }));
        
        const allNodes = [...savedNodes, ...missingAgentNodes];
        // Final dedup on nodes
        const finalNodes = (() => {
            const seen = new Set();
            return allNodes.filter(n => n && (seen.has(n.id) ? false : seen.add(n.id)));
        })();
        setNodes(finalNodes);
        setConnections(savedConns);
        
        if (missingAgentNodes.length > 0) {
          await AsyncStorage.setItem('@code_studio_workspace', JSON.stringify({ nodes: finalNodes, connections: savedConns }));
        }
      } else if (uniqueSA && uniqueSA.length > 0) {
        // Prima deschidere - pune agentii pe canvas
        const autoNodes = uniqueSA.map((agent, i) => ({
          id: agent.id, type: 'Agent' as NodeType, title: agent.name,
          x: 100 + (i % 3) * 220, y: 150 + Math.floor(i / 3) * 180, config: { agentId: agent.id }
        }));
        setNodes(autoNodes);
        await AsyncStorage.setItem('@code_studio_workspace', JSON.stringify({ nodes: autoNodes, connections: [] }));
      }
    } catch (e) { console.error('[Studio] Init error', e); }
  }, [settings, saveWS]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const reload = async () => {
        try {
          await seedDefaultAgents(); // Seed before loading data
          const [sa, sk, saved] = await Promise.all([
            getSubAgents(),
            getAllSkills(),
            AsyncStorage.getItem('@code_studio_workspace')
          ]);
          if (!isActive) return;
          
          // Deduplicate subAgents
          const uniqueSA = (() => {
              const seen = new Set();
              return (sa || []).filter(a => a && (seen.has(a.id) ? false : seen.add(a.id)));
          })();
          setSubAgents(uniqueSA);
          
          // Deduplicate skills
          const uniqueSK = (() => {
              const seen = new Set();
              return (sk || []).filter(s => s && (seen.has(s.id) ? false : seen.add(s.id)));
          })();
          setAllSkills(uniqueSK);
          
          if (saved) {
            const parsed = JSON.parse(saved);
            const savedNodes = parsed.nodes || [];
            const savedConns = parsed.connections || [];
            
            const existingNodeIds = new Set(savedNodes.map((n: Node) => n.id || (n.config?.agentId)));
            const missingAgentNodes = (uniqueSA || [])
              .filter(agent => !existingNodeIds.has(agent.id))
              .map((agent, i) => ({
                id: agent.id,
                type: 'Agent' as NodeType,
                title: agent.name,
                x: 100 + ((savedNodes.length + i) % 3) * 220,
                y: 150 + Math.floor((savedNodes.length + i) / 3) * 180,
                config: { agentId: agent.id }
              }));
            
            const allNodes = [...savedNodes, ...missingAgentNodes];
            // Final dedup on nodes
            const finalNodes = (() => {
                const seen = new Set();
                return allNodes.filter(n => n && (seen.has(n.id) ? false : seen.add(n.id)));
            })();
            setNodes(finalNodes);
            setConnections(savedConns);
            
            if (missingAgentNodes.length > 0) {
              await AsyncStorage.setItem('@code_studio_workspace', JSON.stringify({ nodes: finalNodes, connections: savedConns }));
            }
          } else if (uniqueSA && uniqueSA.length > 0) {
            // Prima deschidere - pune agentii pe canvas
            const autoNodes = uniqueSA.map((agent, i) => ({
              id: agent.id, type: 'Agent' as NodeType, title: agent.name,
              x: 100 + (i % 3) * 220, y: 150 + Math.floor(i / 3) * 180, config: { agentId: agent.id }
            }));
            setNodes(autoNodes);
            await AsyncStorage.setItem('@code_studio_workspace', JSON.stringify({ nodes: autoNodes, connections: [] }));
          }
        } catch(e) { console.error('[Studio] Reload error:', e); }
      };
      reload();
      return () => { isActive = false; };
    }, [settings])
  );

  const canvasPanResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => !isDraggingRef.current,
    onMoveShouldSetPanResponder: (_, gs) => !isDraggingRef.current && (Math.abs(gs.dx) > 2 || Math.abs(gs.dy) > 2),
    onPanResponderGrant: () => canvasPan.extractOffset(),
    onPanResponderMove: Animated.event([null, { dx: canvasPan.x, dy: canvasPan.y }], { useNativeDriver: false }),
    onPanResponderRelease: () => { canvasPan.flattenOffset(); },
  })).current;

  const memoizedGrid = useMemo(() => {
    const dots = []; const step = 100;
    for (let x = 0; x < CANVAS_SIZE; x += step) for (let y = 0; y < CANVAS_SIZE; y += step) dots.push(<Circle key={`grid-dot-${x}-${y}`} cx={x} cy={y} r="1" fill="rgba(255,255,255,0.1)" />);
    return dots;
  }, []);

  const updateNode = (id: string, updates: Partial<Node>) => {
    const updated = nodes.map(n => n.id === id ? {...n, ...updates} : n);
    setNodes(updated);
    debouncedSave(updated, connections);
  };

  const handleCreateAgent = async () => {
    try {
      if (!newAgentConfig.name?.trim()) return Alert.alert('Eroare', 'Numele agentului este obligatoriu!');
      const agent = await createSubAgent({ ...newAgentConfig, isActive: true });
      const newNode: Node = { 
          id: agent.id, type: 'Agent', title: agent.name, x: 200 + Math.random() * 100, y: 200 + Math.random() * 100, 
          config: { agentId: agent.id, provider: agent.agentProvider } 
      };
      const updatedNodes = [...nodes, newNode];
      setNodes(updatedNodes); debouncedSave(updatedNodes, connections);
      const refreshedAgents = await getSubAgents(); setSubAgents(refreshedAgents);
      setIsWizardVisible(false); setWizardStep(1);
      setNewAgentConfig({ name: '', description: '', agentProvider: 'groq', skills: [], tools: [], systemPrompt: '', priority: 5 });
      Alert.alert('Succes', `Agentul "${agent.name}" a fost creat!`);
    } catch(e: any) { Alert.alert('Eroare', e.message || 'Salvare eșuată.'); }
  };

  const handleSaveSkill = async () => {
    if (!editingSkill.name || !editingSkill.systemPrompt) return Alert.alert('Eroare', 'Completează câmpurile obligatorii.');
    try {
        const triggers = Array.isArray(editingSkill.triggers) ? editingSkill.triggers : (editingSkill.triggers as any || "").split(',').map((t: string)=>t.trim()).filter(Boolean);
        await saveSkill({ ...editingSkill as Skill, id: editingSkill.id || `sk-${Date.now()}`, triggers });
        await initWorkspace(); setIsSkillEditorVisible(false);
    } catch (e) { Alert.alert('Eroare', 'Nu s-a putut salva skill-ul.'); }
  };

  const handleTestAgent = async () => {
    if (!sandboxAgent || !sandboxMsg.trim()) return;
    setIsThinking(true); setSandboxResp('');
    try {
      const res = await callSubAgent(sandboxAgent.id, sandboxMsg);
      setSandboxResp(res.response);
    } catch (e: any) { setSandboxResp(`Eroare: ${e.message}`); }
    finally { setIsThinking(false); }
  };

  const autoGeneratePrompt = () => {
      const selected = allSkills.filter(s => newAgentConfig.skills?.includes(s.id));
      const prompt = selected
        .map(s => '### ' + s.name + '\n' + (s.systemPrompt || ''))
        .join('\n\n');
      setNewAgentConfig({ ...newAgentConfig, systemPrompt: prompt });
  };

  const filteredLogs = useMemo(() => {
      if (logFilter === 'success') return agentLogs.filter(l => l.success);
      if (logFilter === 'failed') return agentLogs.filter(l => !l.success);
      return agentLogs;
  }, [agentLogs, logFilter]);

  const renderCanvas = () => (
    <View style={styles.canvasContainer} {...canvasPanResponder.panHandlers}>
      <Animated.View style={[styles.canvas, { width: CANVAS_SIZE, height: CANVAS_SIZE, transform: [{ scale }, { translateX: canvasPan.x }, { translateY: canvasPan.y }], transformOrigin: [0, 0, 0] }]}>
        <Svg style={StyleSheet.absoluteFill}>
          <Defs>{connections.map((c, i) => {
            const f = nodes.find(n => n.id === c.fromId), t = nodes.find(n => n.id === c.toId);
            if (!f || !t) return null;
            return <LinearGradient key={`grad-def-${i}`} id={`g-${i}`} x1="0%" y1="0%" x2="100%" y2="0%"><Stop offset="0%" stopColor={CATEGORY_COLORS[f.type]} /><Stop offset="100%" stopColor={CATEGORY_COLORS[t.type]} /></LinearGradient>
          })}</Defs>
          {memoizedGrid}
          <ConnectionLines connections={connections} nodes={nodes} deleteConnection={(c: any) => { const u = connections.filter(x => x !== c); setConnections(u); saveWS(nodes, u); }} />
        </Svg>
        {nodes.map((n, idx) => (
          <DraggableNode key={`node-${n.id}-${idx}`} node={n} onFinalizePosition={(id: string, x: number, y: number) => { const u = nodes.map(nx => nx.id === id ? { ...nx, x, y } : nx); setNodes(u); saveWS(u, connections); }}
            onPress={() => { setConnectingFromId(n.id); setIsConnectionModalVisible(true); }}
            onRun={() => {
                if (n.type === 'Agent') {
                   const a = subAgents.find(s => s.id === n.id || s.id === n.config?.agentId);
                   if (a) { setSandboxAgent(a); setIsSandboxVisible(true); }
                }
            }}
            onConfig={() => { 
                if (n.type === 'Agent') {
                    const a = subAgents.find(s => s.id === n.id || s.id === n.config?.agentId); 
                    if (a) { setNewAgentConfig({...a}); setIsWizardVisible(true); setWizardStep(1); }
                    else { setNewAgentConfig({ name: n.title, description: '', agentProvider: 'groq', skills: [], tools: [], systemPrompt: '', priority: 5 }); setIsWizardVisible(true); setWizardStep(1); }
                } else if (n.type === 'Skill') {
                    const s = allSkills.find(sk => sk.id === n.id || sk.id === n.config?.skillId); 
                    setEditingSkill(s || { id: n.id, name: n.title, category: 'custom', systemPrompt: '', triggers: [] }); 
                    setIsSkillEditorVisible(true); 
                } else if (n.type === 'Tool') {
                    setEditingNode(n); setIsToolEditorVisible(true);
                } else if (n.type === 'Output') {
                    setEditingNode(n); setIsOutputEditorVisible(true);
                }
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
        <View style={styles.row}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => { setEditingSkill({ name: '', category: 'custom', systemPrompt: '', triggers: [] }); setIsSkillEditorVisible(true); }}><Ionicons name="flash-outline" size={20} color="#fff" /></TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={async () => { const l = await getAgentLogs(); setAgentLogs(l); setIsLogsVisible(true); }}><Ionicons name="list-outline" size={20} color="#fff" /></TouchableOpacity>
            <TouchableOpacity style={styles.templatesBtn} onPress={() => setIsAddModalVisible(true)}><Ionicons name="add-outline" size={20} color="#fff" /><Text style={styles.templatesBtnText}>Add</Text></TouchableOpacity>
        </View>
      </View>

      {viewMode === 'canvas' ? renderCanvas() : (
        <View style={styles.dashboard}>
          <View style={styles.row}>
              <Text style={styles.dashboardTitle}>Agenți ({subAgents.length})</Text>
              <TouchableOpacity onPress={() => setIsAddModalVisible(true)}><Text style={styles.logsLink}>+ Adaugă Node</Text></TouchableOpacity>
          </View>
          <FlatList data={subAgents} keyExtractor={(item, index) => `agent-${item.id}-${index}`} renderItem={({ item }) => (
            <View style={styles.agentCard}>
              <View style={styles.agentCardHeader}><Text style={styles.agentCardName}>{item.name}</Text><Switch value={item.isActive} onValueChange={v => toggleSubAgent(item.id, v).then(initWorkspace)} /></View>
              <Text style={styles.agentCardMeta}>{item.agentProvider.toUpperCase()} • P{item.priority} • {item.skills?.length || 0} skills</Text>
              <View style={styles.agentCardActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => { setSandboxAgent(item); setIsSandboxVisible(true); }}><Text style={styles.actionBtnText}>Test</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => { setNewAgentConfig(item); setIsWizardVisible(true); setWizardStep(1); }}><Text style={styles.actionBtnText}>Edit</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ef4444' }]} onPress={() => Alert.alert('Sterge', 'Stergi acest agent?', [{text:'Anuleaza'}, {text:'Sterge', onPress: () => deleteSubAgent(item.id).then(initWorkspace)}])}><Ionicons name="trash" size={14} color="#fff" /></TouchableOpacity>
              </View>
            </View>
          )} ListEmptyComponent={<Text style={styles.emptyText}>Niciun agent creat.</Text>} />
        </View>
      )}

      <TouchableOpacity style={[styles.fab, { bottom: 80 + insets.bottom }]} onPress={() => { setNewAgentConfig({ name: '', description: '', agentProvider: 'groq', skills: [], tools: [], systemPrompt: '', priority: 5 }); setIsWizardVisible(true); setWizardStep(1); }}><Ionicons name="add" size={32} color="#fff" /></TouchableOpacity>

      {/* MODALS */}
      <Modal visible={isAddModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adaugă Node în Workspace</Text>
            <View style={styles.nodeTypeGrid}>{['Agent', 'Skill', 'Tool', 'Output'].map((t, idx) => (
              <TouchableOpacity key={`type-btn-${t}-${idx}`} style={[styles.typeBtn, { borderLeftColor: CATEGORY_COLORS[t] }]} onPress={() => { const id = Math.random().toString(36).substr(2,9); const n = [...nodes, { id, type: t as any, title: `New ${t}`, x: 100, y: 100, config: {} }]; setNodes(n); saveWS(n, connections); setIsAddModalVisible(false); }}>
                <Ionicons name={CATEGORY_ICONS[t] as any} size={24} color={CATEGORY_COLORS[t]} /><Text style={styles.typeBtnText}>{t}</Text>
              </TouchableOpacity>
            ))}</View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsAddModalVisible(false)}><Text style={styles.closeBtnText}>Închide</Text></TouchableOpacity>
        </View></View>
      </Modal>

      <Modal visible={isConnectionModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Conectează la...</Text>
            <FlatList data={nodes.filter(n => n.id !== connectingFromId && !connections.some(c => c.fromId === connectingFromId && c.toId === n.id))} keyExtractor={(item, index) => `conn-target-${item.id}-${index}`} renderItem={({ item }) => (
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
            {wizardStep === 2 && <View style={styles.wizardBody}>
                <Text style={styles.inputLabel}>AI Provider</Text>
                <View style={styles.row}>{['groq', 'openrouter'].map((p, idx) => (<TouchableOpacity key={`prov-tab-${p}-${idx}`} style={[styles.providerTab, newAgentConfig.agentProvider === p && styles.providerTabActive]} onPress={() => setNewAgentConfig({...newAgentConfig, agentProvider: p as any})}><Text style={styles.providerTabText}>{p.toUpperCase()}</Text></TouchableOpacity>))}</View>
                <Text style={styles.inputLabel}>API Key (optional - lasă gol pentru cheia globală)</Text>
                <View style={styles.row}>
                    <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} value={newAgentConfig.apiKey || ''} onChangeText={t => setNewAgentConfig({...newAgentConfig, apiKey: t})} placeholder="sk-... (optional)" placeholderTextColor="#475569" secureTextEntry={!showApiKey} />
                    <TouchableOpacity onPress={() => setShowApiKey(!showApiKey)} style={styles.eyeBtn}><Ionicons name={showApiKey ? 'eye-off' : 'eye'} size={20} color="#fff" /></TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.validateKeyBtn} onPress={async () => {
                    if (!newAgentConfig.apiKey) return Alert.alert('Info', 'Nicio cheie introdusă.');
                    const { validateKey } = await import('@/engine/code-studio/keyManager');
                    const ok = await validateKey(newAgentConfig.agentProvider || 'groq', newAgentConfig.apiKey);
                    Alert.alert(ok ? '✅ Cheie validă!' : '❌ Cheie invalidă');
                }}><Text style={styles.validateKeyBtnText}>Validează Cheia</Text></TouchableOpacity>
            </View>}
            {wizardStep === 3 && <View style={styles.wizardBody}><Text style={styles.inputLabel}>Selectează Skills</Text><ScrollView style={{ height: 400 }}>{allSkills.map((s, idx) => {
                const isSel = newAgentConfig.skills?.includes(s.id);
                return <TouchableOpacity key={`wizard-skill-${s.id}-${idx}`} style={[styles.selectableItem, isSel && styles.selectedItem]} onPress={() => { const sk = newAgentConfig.skills || []; setNewAgentConfig({...newAgentConfig, skills: isSel ? sk.filter(x=>x!==s.id) : [...sk, s.id]}); }}>
                  <View style={styles.row}><Text style={styles.selectableText}>{s.name}</Text><Ionicons name={isSel ? "checkbox" : "square-outline"} size={20} color={isSel ? "#10b981" : "#475569"} /></View>
                  <Text style={styles.selectableSub}>{s.category}</Text>
                </TouchableOpacity>
            })}</ScrollView></View>}
            {wizardStep === 4 && <View style={styles.wizardBody}><Text style={styles.inputLabel}>Unelte active (Tools)</Text>{['webSearch', 'memory', 'codeRunner'].map((t, idx) => (
                <View key={`tool-row-${t}-${idx}`} style={styles.toolRow}><Text style={styles.toolText}>{t}</Text><Switch value={newAgentConfig.tools?.includes(t)} onValueChange={v => { const ts = newAgentConfig.tools || []; setNewAgentConfig({...newAgentConfig, tools: v ? [...ts, t] : ts.filter(x=>x!==t)}); }} /></View>
            ))}<Text style={styles.inputLabel}>Prioritate Execuție: {newAgentConfig.priority}</Text><View style={styles.row}>{[1,3,5,8,10].map((p, idx) => (<TouchableOpacity key={`prio-btn-${p}-${idx}`} style={[styles.priorityBtn, newAgentConfig.priority === p && styles.priorityBtnActive]} onPress={() => setNewAgentConfig({...newAgentConfig, priority: p})}><Text style={styles.priorityBtnText}>{p}</Text></TouchableOpacity>))}</View></View>}
            {wizardStep === 5 && <View style={styles.wizardBody}><View style={styles.row}><Text style={styles.inputLabel}>Personalitate (System Prompt)</Text><TouchableOpacity onPress={autoGeneratePrompt}><Text style={styles.autoGenLink}>Generate from Skills</Text></TouchableOpacity></View><TextInput style={[styles.input, { height: 250 }]} value={newAgentConfig.systemPrompt} onChangeText={t => setNewAgentConfig({...newAgentConfig, systemPrompt: t})} multiline placeholder="Instrucțiuni pentru acest agent..." placeholderTextColor="#475569" /><TouchableOpacity style={styles.finalizeBtn} onPress={handleCreateAgent}><Text style={styles.finalizeBtnText}>Finalizează & Salvează Agent</Text></TouchableOpacity></View>}
            <View style={styles.wizardFooter}><TouchableOpacity onPress={() => wizardStep > 1 && setWizardStep(wizardStep - 1)} disabled={wizardStep === 1}><Text style={styles.wizardBtnText}>Înapoi</Text></TouchableOpacity><TouchableOpacity onPress={() => setIsWizardVisible(false)}><Text style={styles.closeWizardText}>Anulează</Text></TouchableOpacity>{wizardStep < 5 && <TouchableOpacity onPress={() => setWizardStep(wizardStep + 1)}><Text style={styles.wizardBtnText}>Înainte</Text></TouchableOpacity>}</View>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={isSkillEditorVisible} transparent animationType="slide"><View style={styles.modalOverlay}><View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Configurare Skill</Text>
        <TextInput style={styles.input} placeholder="Nume Skill" value={editingSkill.name} onChangeText={t => setEditingSkill({...editingSkill, name: t})} placeholderTextColor="#475569" />
        <Text style={styles.inputLabel}>Categorie</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>{SKILL_CATEGORIES.map(c => (
            <TouchableOpacity key={`cat-chip-${c}`} style={[styles.catChip, editingSkill.category === c && styles.catChipActive]} onPress={() => setEditingSkill({...editingSkill, category: c as any})}><Text style={styles.catChipText}>{c}</Text></TouchableOpacity>
        ))}</ScrollView>
        <TextInput style={[styles.input, { height: 120, marginTop: 10 }]} placeholder="System Prompt (instrucțiuni)" value={editingSkill.systemPrompt} onChangeText={t => setEditingSkill({...editingSkill, systemPrompt: t})} multiline placeholderTextColor="#475569" />
        <TextInput style={[styles.input, { marginTop: 10 }]} placeholder="Cuvinte cheie (separate prin virgulă)" value={Array.isArray(editingSkill.triggers) ? editingSkill.triggers.join(', ') : (editingSkill.triggers as any || '')} onChangeText={t => setEditingSkill({...editingSkill, triggers: t.split(',').map(s => s.trim()).filter(Boolean)})} placeholderTextColor="#475569" />
        <TouchableOpacity style={styles.finalizeBtn} onPress={handleSaveSkill}><Text style={styles.finalizeBtnText}>Salvează Skill</Text></TouchableOpacity>
        {editingSkill.id && <TouchableOpacity style={[styles.finalizeBtn, { backgroundColor: '#ef4444', marginTop: 8 }]} onPress={async () => { await deleteSkill(editingSkill.id!); setIsSkillEditorVisible(false); }}><Text style={styles.finalizeBtnText}>Șterge Skill</Text></TouchableOpacity>}
        <TouchableOpacity style={styles.closeBtn} onPress={() => setIsSkillEditorVisible(false)}><Text style={styles.closeBtnText}>Anulează</Text></TouchableOpacity>
      </View></View></Modal>

      <Modal visible={isToolEditorVisible} transparent animationType="fade"><View style={styles.modalOverlay}><View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Configurare Tool</Text>
        <TextInput style={styles.input} placeholder="Titlu Tool" value={editingNode?.title} onChangeText={t => updateNode(editingNode!.id, { title: t })} />
        <Text style={styles.inputLabel}>Tip Tool</Text>
        <View style={styles.nodeTypeGrid}>{TOOL_TYPES.map((t, idx) => (
            <TouchableOpacity key={`tool-cat-${t}-${idx}`} style={[styles.catChip, editingNode?.config?.toolType === t && styles.catChipActive, { marginBottom: 8 }]} onPress={() => updateNode(editingNode!.id, { config: { ...editingNode?.config, toolType: t } })}><Text style={styles.catChipText}>{t}</Text></TouchableOpacity>
        ))}</View>
        <TouchableOpacity style={styles.finalizeBtn} onPress={() => setIsToolEditorVisible(false)}><Text style={styles.finalizeBtnText}>Gata</Text></TouchableOpacity>
        <TouchableOpacity style={styles.closeBtn} onPress={() => setIsToolEditorVisible(false)}><Text style={styles.closeBtnText}>Închide</Text></TouchableOpacity>
      </View></View></Modal>

      <Modal visible={isOutputEditorVisible} transparent animationType="fade"><View style={styles.modalOverlay}><View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Configurare Output</Text>
        <TextInput style={styles.input} placeholder="Titlu Output" value={editingNode?.title} onChangeText={t => updateNode(editingNode!.id, { title: t })} />
        <Text style={styles.inputLabel}>Format</Text>
        <View style={styles.nodeTypeGrid}>{OUTPUT_FORMATS.map((f, idx) => (
            <TouchableOpacity key={`out-fmt-${f}-${idx}`} style={[styles.catChip, editingNode?.config?.format === f && styles.catChipActive, { marginBottom: 8 }]} onPress={() => updateNode(editingNode!.id, { config: { ...editingNode?.config, format: f } })}><Text style={styles.catChipText}>{f}</Text></TouchableOpacity>
        ))}</View>
        <TouchableOpacity style={styles.finalizeBtn} onPress={() => setIsOutputEditorVisible(false)}><Text style={styles.finalizeBtnText}>Gata</Text></TouchableOpacity>
        <TouchableOpacity style={styles.closeBtn} onPress={() => setIsOutputEditorVisible(false)}><Text style={styles.closeBtnText}>Închide</Text></TouchableOpacity>
      </View></View></Modal>

      <Modal visible={isSandboxVisible} transparent={false} animationType="fade"><SafeAreaView style={styles.fullscreenModal}><View style={styles.sandboxContent}>
        <View style={styles.wizardHeader}><View><Text style={styles.wizardTitle}>Sandbox: {sandboxAgent?.name}</Text><Text style={styles.catChipText}>{sandboxAgent?.agentProvider}</Text></View><TouchableOpacity onPress={() => setIsSandboxVisible(false)}><Ionicons name="close" size={28} color="#fff" /></TouchableOpacity></View>
        <ScrollView style={styles.sandboxOutput}><Text style={styles.responseText}>{sandboxResp || 'Introdu un mesaj mai jos pentru a testa agentul...'}</Text>{isThinking && <ActivityIndicator color="#6366f1" style={{ marginTop: 20 }} />}</ScrollView>
        <View style={styles.sandboxInputRow}><TextInput style={styles.sandboxInput} value={sandboxMsg} onChangeText={setSandboxMsg} placeholder="Scrie ceva pentru agent..." placeholderTextColor="#475569" /><TouchableOpacity style={[styles.sendBtn, (!sandboxMsg.trim() || isThinking) && { opacity: 0.5 }]} onPress={handleTestAgent} disabled={!sandboxMsg.trim() || isThinking}><Ionicons name="send" size={20} color="#fff" /></TouchableOpacity></View>
      </View></SafeAreaView></Modal>

      <Modal visible={isLogsVisible} transparent animationType="fade"><View style={styles.modalOverlay}><View style={styles.modalContent}>
        <View style={styles.row}><Text style={styles.modalTitle}>Activitate Agenți</Text><TouchableOpacity onPress={async () => { await clearAgentLogs(); setAgentLogs([]); }}><Text style={styles.clearLogs}>Golește</Text></TouchableOpacity></View>
        <View style={[styles.row, { marginBottom: 10 }]}>{['all', 'success', 'failed'].map(f => (
            <TouchableOpacity key={`log-filt-${f}`} style={[styles.catChip, logFilter === f && styles.catChipActive]} onPress={() => setLogFilter(f as any)}><Text style={styles.catChipText}>{f}</Text></TouchableOpacity>
        ))}</View>
        <FlatList style={{ maxHeight: 500 }} data={filteredLogs} keyExtractor={(item, index) => `log-${item.agentId}-${item.timestamp}-${index}`} renderItem={({ item }) => (
          <View style={styles.logItem}><View style={styles.row}><Text style={styles.logTime}>{new Date(item.timestamp).toLocaleTimeString()}</Text><Text style={[styles.logStatus, { color: item.success ? '#10b981' : '#ef4444' }]}>{item.success ? 'OK' : 'FAIL'}</Text></View><Text style={styles.agentCardName}>{item.agentName}</Text><Text style={styles.logText} numberOfLines={2}>MSG: {item.input}</Text><Text style={styles.logTime}>Durată: {item.durationMs}ms</Text></View>
        )} ListEmptyComponent={<Text style={styles.emptyText}>Niciun log disponibil.</Text>} />
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
  headerBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  templatesBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6366f1', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  templatesBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
  canvasContainer: { flex: 1, position: 'relative', overflow: 'hidden' },
  canvas: { backgroundColor: '#0f172a' },
  node: { width: NODE_WIDTH, padding: 10, backgroundColor: '#1e293b', borderRadius: 10, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 8, elevation: 10 },
  nodeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  nodeActions: { flexDirection: 'row' },
  nodeMiniBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
  nodeTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  nodeType: { color: '#94a3b8', fontSize: 10, textTransform: 'uppercase' },
  priorityBadge: { position: 'absolute', bottom: -6, left: -6, backgroundColor: '#f59e0b', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  priorityText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  connectPlusBtn: { position: 'absolute', right: -12, top: 48, width: 24, height: 24, borderRadius: 12, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#1e293b', zIndex: 10 },
  dashboard: { flex: 1, padding: 16 },
  dashboardTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  logsLink: { color: '#6366f1', fontWeight: 'bold', fontSize: 13 },
  agentCard: { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  agentCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  agentCardName: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  agentCardMeta: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  agentCardActions: { flexDirection: 'row', marginTop: 14 },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#334155', marginRight: 10 },
  actionBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  zoomControls: { position: 'absolute', left: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 20, padding: 6, shadowColor: '#000', shadowOpacity: 0.3, elevation: 5, zIndex: 1001 },
  zoomBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center', marginHorizontal: 3 },
  zoomLevel: { paddingHorizontal: 10 },
  zoomLevelText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  fab: { position: 'absolute', right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', elevation: 10, zIndex: 1000 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1e293b', borderRadius: 24, padding: 24, maxHeight: '90%' },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  typeBtn: { width: '100%', backgroundColor: '#0f172a', padding: 16, borderRadius: 12, borderLeftWidth: 4, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  typeBtnText: { color: '#fff', marginLeft: 12, fontWeight: 'bold', fontSize: 15 },
  nodeTypeGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap' },
  connectionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', padding: 16, borderRadius: 12, marginBottom: 12 },
  connectionItemText: { color: '#fff', marginLeft: 14, fontWeight: 'bold', fontSize: 15 },
  closeBtn: { marginTop: 18, alignItems: 'center' },
  closeBtnText: { color: '#94a3b8', fontWeight: 'bold', fontSize: 14 },
  fullscreenModal: { flex: 1, backgroundColor: '#0f172a' },
  wizardContent: { flex: 1, padding: 20 },
  wizardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  wizardTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  wizardStep: { color: '#6366f1', fontWeight: 'bold', fontSize: 14 },
  wizardBody: { flex: 1 },
  inputLabel: { color: '#94a3b8', fontSize: 14, marginBottom: 8, marginTop: 18, fontWeight: 'bold' },
  input: { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, color: '#fff', borderWidth: 1, borderColor: '#334155', fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  providerTab: { padding: 16, borderRadius: 12, backgroundColor: '#1e293b', flex: 0.48, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  providerTabActive: { backgroundColor: '#6366f1', borderColor: '#fff' },
  providerTabText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  selectableItem: { padding: 16, borderRadius: 14, backgroundColor: '#1e293b', marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  selectedItem: { borderColor: '#10b981', backgroundColor: '#1e293b' },
  selectableText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  selectableSub: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  toolRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#334155' },
  toolText: { color: '#fff', fontSize: 15 },
  priorityBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center' },
  priorityBtnActive: { backgroundColor: '#f59e0b' },
  priorityBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  autoGenLink: { color: '#10b981', fontWeight: 'bold', fontSize: 13 },
  finalizeBtn: { backgroundColor: '#10b981', padding: 20, borderRadius: 16, alignItems: 'center', marginTop: 24 },
  finalizeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  wizardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, paddingBottom: 20 },
  wizardBtnText: { color: '#6366f1', fontWeight: 'bold', fontSize: 17 },
  closeWizardText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 },
  catChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#334155', marginRight: 8 },
  catChipActive: { backgroundColor: '#10b981' },
  catChipText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  sandboxContent: { flex: 1, padding: 20 },
  sandboxOutput: { flex: 1, backgroundColor: '#1e293b', borderRadius: 20, padding: 20, marginBottom: 20 },
  responseText: { color: '#fff', fontSize: 16, lineHeight: 24 },
  sandboxInputRow: { flexDirection: 'row', alignItems: 'center' },
  sandboxInput: { flex: 1, backgroundColor: '#1e293b', borderRadius: 16, padding: 18, color: '#fff', marginRight: 12, fontSize: 16, borderWidth: 1, borderColor: '#334155' },
  sendBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', elevation: 5 },
  logItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#334155' },
  logTime: { color: '#6366f1', fontSize: 11, fontWeight: 'bold' },
  logText: { color: '#fff', fontSize: 13, marginTop: 4 },
  logStatus: { fontSize: 11, fontWeight: 'black' },
  clearLogs: { color: '#ef4444', fontSize: 13, fontWeight: 'bold' },
  emptyText: { color: '#475569', textAlign: 'center', marginTop: 60, fontSize: 15 },
  eyeBtn: { padding: 12, backgroundColor: '#334155', borderRadius: 12 },
  validateKeyBtn: { marginTop: 12, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#6366f1', padding: 14, borderRadius: 12, alignItems: 'center' },
  validateKeyBtnText: { color: '#6366f1', fontWeight: 'bold', fontSize: 14 },
});
