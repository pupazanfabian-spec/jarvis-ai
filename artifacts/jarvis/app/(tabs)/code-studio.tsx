import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  PanResponder,
  Animated,
  FlatList,
  Switch,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path, Circle, Polygon, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import * as keyManager from '@/engine/code-studio/keyManager';
import { 
  Skill, 
  getAllSkills, 
  saveSkill, 
  deleteSkill, 
  getSkillById 
} from '@/engine/code-studio/skills';
import { 
  SubAgent, 
  getSubAgents, 
  deleteSubAgent as deleteSA, 
  toggleSubAgent, 
  createSubAgent, 
  callSubAgent,
  getAgentLogs,
  AgentLog,
  updateAgentPriority
} from '@/engine/code-studio/subAgentManager';
import { AGENT_TEMPLATES } from '@/engine/code-studio/templates';
import { useAIProvider } from '@/context/AIProviderContext';
import { useBrain } from '@/context/BrainContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_SIZE = 5000;
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
  Agent: '#6366f1',
  Skill: '#10b981',
  Tool: '#f59e0b',
  Output: '#ef4444',
};

const CATEGORY_ICONS: Record<string, string> = {
  Agent: 'hardware-chip-outline',
  Skill: 'book-outline',
  Tool: 'hammer-outline',
  Output: 'paper-plane-outline',
};

// ─── Memoized Components ─────────────────────────────────────────────────────

const ConnectionLines = React.memo(({ connections, nodes, deleteConnection }: any) => {
  if (!connections || !Array.isArray(connections) || !nodes || !Array.isArray(nodes)) return null;
  
  return connections.map((conn: Connection, index: number) => {
    try {
        const fromNode = nodes.find((n: Node) => n && n.id === conn.fromId);
        const toNode = nodes.find((n: Node) => n && n.id === conn.toId);
        if (!fromNode || !toNode) return null;
        
        const x1 = (fromNode.x || 0) + NODE_WIDTH;
        const y1 = (fromNode.y || 0) + NODE_HEIGHT / 2;
        const x2 = (toNode.x || 0);
        const y2 = (toNode.y || 0) + NODE_HEIGHT / 2;
        
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        const path = `M ${x1} ${y1} C ${x1 + (x2 - x1) / 2} ${y1}, ${x1 + (x2 - x1) / 2} ${y2}, ${x2} ${y2}`;
        
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const arrowSize = 10;
        const ax1 = x2 - arrowSize * Math.cos(angle - Math.PI / 6);
        const ay1 = y2 - arrowSize * Math.sin(angle - Math.PI / 6);
        const ax2 = x2 - arrowSize * Math.cos(angle + Math.PI / 6);
        const ay2 = y2 - arrowSize * Math.sin(angle + Math.PI / 6);

        const colorFrom = CATEGORY_COLORS[fromNode.type] || '#6366f1';

        return (
          <React.Fragment key={`conn-${index}`}>
            <Path 
              d={path} 
              stroke={`url(#grad-${index})`} 
              strokeWidth="3" 
              fill="none" 
              opacity={0.8} 
            />
            <Polygon 
              points={`${x2},${y2} ${ax1},${ay1} ${ax2},${ay2}`} 
              fill={colorFrom} 
              opacity={1} 
            />
            <Circle 
              cx={midX} 
              cy={midY} 
              r="12" 
              fill="#1e293b" 
              stroke="#ef4444" 
              strokeWidth="1" 
            />
            <SvgText 
              x={midX} 
              y={midY + 4} 
              fontSize="12" 
              fill="#ef4444" 
              textAnchor="middle" 
              fontWeight="bold"
              onPress={() => deleteConnection(conn)}
            >
              ×
            </SvgText>
          </React.Fragment>
        );
    } catch (e) {
        return null;
    }
  });
});

const DraggableNode = React.memo(({ node, onFinalizePosition, onPress, onConfig, onRun, onDelete, isSelected, onDragStart, onDragEnd, isActive, priority }: any) => {
  const pan = useRef(new Animated.ValueXY({ x: node.x || 0, y: node.y || 0 })).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const valRef = useRef({ x: node.x || 0, y: node.y || 0 });

  useEffect(() => {
    const listener = pan.addListener((v) => { valRef.current = v; });
    return () => pan.removeListener(listener);
  }, [pan]);

  useEffect(() => {
    if (isSelected || isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0, duration: 1000, useNativeDriver: false })
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [isSelected, isActive, glowAnim]);

  useEffect(() => {
    pan.setValue({ x: node.x || 0, y: node.y || 0 });
  }, [node.x, node.y, pan]);

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 2 || Math.abs(gs.dy) > 2,
    onPanResponderGrant: () => {
      pan.extractOffset();
      onDragStart();
    },
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderRelease: () => {
      pan.flattenOffset();
      onDragEnd();
      onFinalizePosition(node.id, valRef.current.x, valRef.current.y);
    },
  })).current;

  const nodeColor = CATEGORY_COLORS[node.type] || '#6366f1';
  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#334155', isActive ? '#10b981' : nodeColor]
  });

  return (
    <Animated.View 
      style={[
        styles.node, 
        { 
          position: 'absolute', 
          left: pan.x, 
          top: pan.y, 
          borderLeftColor: nodeColor, 
          borderColor: (isSelected || isActive) ? borderColor : '#334155', 
          borderWidth: (isSelected || isActive) ? 2 : 1 
        }
      ]} 
      {...panResponder.panHandlers}
    >
      <View style={styles.nodeHeader}>
        <Ionicons name={(CATEGORY_ICONS[node.type] as any) || 'help-outline'} size={20} color={nodeColor} />
        <View style={styles.nodeActions}>
          <TouchableOpacity onPress={onRun} style={styles.nodeMiniBtn}><Ionicons name="play" size={12} color="#fff" /></TouchableOpacity>
          <TouchableOpacity onPress={onConfig} style={styles.nodeMiniBtn}><Ionicons name="settings" size={12} color="#fff" /></TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.nodeMiniBtn}><Ionicons name="close" size={12} color="#ef4444" /></TouchableOpacity>
        </View>
      </View>
      <View>
        <Text style={styles.nodeTitle} numberOfLines={1}>{node.title || 'Untitled'}</Text>
        <Text style={styles.nodeType}>{node.type || 'Unknown'}</Text>
      </View>
      {priority !== undefined && <View style={styles.priorityBadge}><Text style={styles.priorityText}>P{priority}</Text></View>}
      <TouchableOpacity style={styles.connectPlusBtn} onPress={onPress}>
        <Ionicons name="add" size={14} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
});

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CodeStudio() {
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = useState<ViewMode>('canvas');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);
  const [isConnectionModalVisible, setIsConnectionModalVisible] = useState(false);
  const [subAgents, setSubAgents] = useState<SubAgent[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [scale, setScale] = useState(1.0);
  const isDraggingRef = useRef(false);
  const { settings } = useAIProvider();
  const { sendMessage } = useBrain();

  // Canvas Panning State
  const canvasPan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const canvasPanResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => !isDraggingRef.current,
    onMoveShouldSetPanResponder: (_, gs) => !isDraggingRef.current && (Math.abs(gs.dx) > 2 || Math.abs(gs.dy) > 2),
    onPanResponderGrant: () => {
        canvasPan.extractOffset();
    },
    onPanResponderMove: Animated.event([null, { dx: canvasPan.x, dy: canvasPan.y }], { useNativeDriver: false }),
    onPanResponderRelease: () => {
        canvasPan.flattenOffset();
    },
  })).current;

  // Save Debounce
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const debouncedSave = useCallback((newNodes: Node[], newConnections: Connection[]) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      AsyncStorage.setItem('@code_studio_workspace', JSON.stringify({ nodes: newNodes, connections: newConnections }));
    }, 500);
  }, []);

  // Wizard State
  const [isWizardVisible, setIsWizardVisible] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newAgentConfig, setNewAgentConfig] = useState<Partial<SubAgent>>({
    name: '', description: '', agentProvider: 'groq', apiKey: '', skills: [], tools: [], systemPrompt: '', priority: 5,
  });

  // Sandbox State
  const [isSandboxVisible, setIsSandboxVisible] = useState(false);
  const [sandboxAgent, setSandboxAgent] = useState<SubAgent | null>(null);
  const [sandboxMessage, setSandboxMessage] = useState('');
  const [sandboxResponse, setSandboxResponse] = useState('');
  const [isSandboxThinking, setIsSandboxThinking] = useState(false);

  // Skill Editor & Logs
  const [isSkillEditorVisible, setIsSkillEditorVisible] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Partial<Skill>>({ id: '', name: '', category: 'custom', systemPrompt: '', triggers: [] });
  const [isLogsVisible, setIsLogsVisible] = useState(false);
  const [currentLogs, setCurrentLogs] = useState<AgentLog[]>([]);

  const flashAnim = useRef(new Animated.Value(0)).current;

  const initWorkspace = useCallback(async () => {
    try {
      if (keyManager && keyManager.syncKeysFromContext) {
        await keyManager.syncKeysFromContext(settings);
      }
      const [sa, sk, saved] = await Promise.all([
        getSubAgents(),
        getAllSkills(),
        AsyncStorage.getItem('@code_studio_workspace')
      ]);
      setSubAgents(sa || []);
      setAllSkills(sk || []);
      if (saved) {
        const parsed = JSON.parse(saved);
        setNodes(parsed.nodes || []);
        setConnections(parsed.connections || []);
      }
    } catch (e) {
      console.error('Failed to load workspace', e);
    }
  }, [settings]);

  useFocusEffect(
    useCallback(() => {
      initWorkspace();
    }, [initWorkspace])
  );

  const handleCreateAgent = useCallback(async () => {
    try {
      if (!newAgentConfig.name) return Alert.alert('Eroare', 'Numele este obligatoriu.');
      const agent = await createSubAgent(newAgentConfig);
      const newNode: Node = {
        id: agent.id, type: 'Agent', title: agent.name, x: 150, y: 150,
        config: { agentId: agent.id, provider: agent.agentProvider },
      };
      const updatedNodes = [...nodes.filter(n => n.id !== agent.id), newNode];
      setNodes(updatedNodes);
      debouncedSave(updatedNodes, connections);
      const sa = await getSubAgents();
      setSubAgents(sa);
      setIsWizardVisible(false);
      setWizardStep(1);
    } catch (e) { Alert.alert('Eroare', 'Nu s-a putut crea agentul.'); }
  }, [newAgentConfig, nodes, connections, debouncedSave]);

  const finalizeNodePosition = useCallback((id: string, x: number, y: number) => {
    setNodes(currentNodes => {
      const updated = currentNodes.map(n => n.id === id ? { ...n, x, y } : n);
      debouncedSave(updated, connections);
      return updated;
    });
  }, [connections, debouncedSave]);

  const handleDeleteConnection = useCallback((conn: Connection) => {
    const updated = connections.filter(c => !(c.fromId === conn.fromId && c.toId === conn.toId));
    setConnections(updated);
    debouncedSave(nodes, updated);
  }, [connections, nodes, debouncedSave]);

  const renderCanvas = () => (
    <View style={styles.canvasContainer} {...canvasPanResponder.panHandlers}>
      <Animated.View 
        style={[
            styles.canvas, 
            { 
                width: CANVAS_SIZE, 
                height: CANVAS_SIZE,
                transform: [
                    { scale },
                    { translateX: canvasPan.x },
                    { translateY: canvasPan.y }
                ],
                transformOrigin: ['0%', '0%', 0]
            }
        ]}
      >
        <Svg style={StyleSheet.absoluteFill}>
          <Defs>
            {(connections || []).map((conn, i) => {
              const fromNode = (nodes || []).find(n => n && n.id === conn.fromId);
              const toNode = (nodes || []).find(n => n && n.id === conn.toId);
              if (!fromNode || !toNode) return null;
              return (
                <LinearGradient key={`grad-${i}`} id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor={CATEGORY_COLORS[fromNode.type] || '#6366f1'} />
                  <Stop offset="100%" stopColor={CATEGORY_COLORS[toNode.type] || '#6366f1'} />
                </LinearGradient>
              );
            })}
          </Defs>
          {renderGrid()}
          <ConnectionLines connections={connections} nodes={nodes} deleteConnection={handleDeleteConnection} />
        </Svg>
        {(nodes || []).map((node) => (
          node && <DraggableNode 
            key={node.id} node={node} onFinalizePosition={finalizeNodePosition}
            onPress={() => { setConnectingFromId(node.id); setIsConnectionModalVisible(true); }}
            onConfig={() => {
              const agent = (subAgents || []).find(sa => sa && (sa.id === node.id || sa.id === node.config?.agentId));
              if (agent) { setNewAgentConfig(agent); setIsWizardVisible(true); setWizardStep(1); }
              else if (node.type === 'Skill') {
                const skill = (allSkills || []).find(s => s && (s.id === node.id || s.id === node.config?.skillId));
                if (skill) { setEditingSkill(skill); setIsSkillEditorVisible(true); }
                else setEditingNode(node);
              } else setEditingNode(node);
            }}
            onRun={() => {
              const agent = (subAgents || []).find(sa => sa && (sa.id === node.id || sa.id === node.config?.agentId));
              if (agent) { setSandboxAgent(agent); setIsSandboxVisible(true); }
            }}
            onDelete={() => {
              Alert.alert('Sterge', 'Sigur vrei sa stergi acest nod?', [
                { text: 'Anuleaza' },
                { text: 'Sterge', onPress: () => {
                  const updatedNodes = nodes.filter(n => n && n.id !== node.id);
                  const updatedConnections = connections.filter(c => c && c.fromId !== node.id && c.toId !== node.id);
                  setNodes(updatedNodes);
                  setConnections(updatedConnections);
                  debouncedSave(updatedNodes, updatedConnections);
                }}
              ]);
            }}
            isSelected={connectingFromId === node.id}
            onDragStart={() => { isDraggingRef.current = true; }}
            onDragEnd={() => { isDraggingRef.current = false; }}
            isActive={(subAgents || []).some(sa => sa && sa.isActive && (sa.id === node.id || sa.id === node.config?.agentId))}
            priority={(subAgents || []).find(sa => sa && (sa.id === node.id || sa.id === node.config?.agentId))?.priority}
          />
        ))}
      </Animated.View>

      {/* Zoom Controls */}
      <View style={[styles.zoomControls, { bottom: 90 + insets.bottom }]}>
        <TouchableOpacity style={styles.zoomBtn} onPress={() => setScale(Math.min(scale + 0.1, 2.0))}><Ionicons name="add" size={20} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.zoomLevel} onPress={() => setScale(1.0)}><Text style={styles.zoomLevelText}>{Math.round(scale * 100)}%</Text></TouchableOpacity>
        <TouchableOpacity style={styles.zoomBtn} onPress={() => setScale(Math.max(scale - 0.1, 0.3))}><Ionicons name="remove" size={20} color="#fff" /></TouchableOpacity>
      </View>
    </View>
  );

  const renderGrid = () => {
    const dots = [];
    const step = 50;
    for (let x = 0; x < 2000; x += step) {
      for (let y = 0; y < 2000; y += step) {
        dots.push(<Circle key={`dot-${x}-${y}`} cx={x} cy={y} r="1" fill="rgba(255,255,255,0.1)" />);
      }
    }
    return dots;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.tabSwitcher}>
          <TouchableOpacity style={[styles.tabBtn, viewMode === 'canvas' && styles.tabBtnActive]} onPress={() => setViewMode('canvas')}><Text style={[styles.tabBtnText, viewMode === 'canvas' && styles.tabBtnTextActive]}>Canvas</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, viewMode === 'dashboard' && styles.tabBtnActive]} onPress={() => setViewMode('dashboard')}><Text style={[styles.tabBtnText, viewMode === 'dashboard' && styles.tabBtnTextActive]}>Dashboard</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.templatesBtn} onPress={() => setIsAddModalVisible(true)}><Ionicons name="layers-outline" size={20} color="#fff" /><Text style={styles.templatesBtnText}>Workspace</Text></TouchableOpacity>
      </View>

      {viewMode === 'canvas' ? renderCanvas() : (
        <View style={styles.dashboard}>
           <FlatList 
             data={subAgents || []} 
             renderItem={({ item }) => (
               <View style={styles.agentCard}>
                 <View style={styles.agentCardHeader}>
                    <Text style={styles.agentCardName}>{item.name}</Text>
                    <Switch value={item.isActive} onValueChange={(v) => toggleSubAgent(item.id, v).then(initWorkspace)} />
                 </View>
                 <Text style={styles.agentCardMeta}>{item.agentProvider.toUpperCase()} • P{item.priority}</Text>
               </View>
             )}
             ListEmptyComponent={<Text style={styles.emptyText}>Nu ai agenți creati.</Text>}
             keyExtractor={item => item.id}
           />
        </View>
      )}

      <TouchableOpacity style={[styles.fab, { bottom: 80 + insets.bottom }]} onPress={() => { setIsWizardVisible(true); setWizardStep(1); }}><Ionicons name="add" size={32} color="#fff" /></TouchableOpacity>
      <Animated.View style={[styles.flashOverlay, { opacity: flashAnim }]} pointerEvents="none" />

      {/* Modals with correct SafeAreaView */}
      <Modal visible={isAddModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adaugă în Workspace</Text>
            <View style={styles.nodeTypeGrid}>
              {['Agent', 'Skill', 'Tool', 'Output'].map(type => (
                <TouchableOpacity key={type} style={[styles.typeBtn, { borderLeftColor: CATEGORY_COLORS[type] || '#ccc' }]} onPress={() => {
                    const newNode: Node = {
                        id: Math.random().toString(36).substr(2, 9),
                        type: type as NodeType,
                        title: `New ${type}`,
                        x: 100,
                        y: 200,
                        config: {},
                    };
                    const updatedNodes = [...(nodes || []), newNode];
                    setNodes(updatedNodes);
                    debouncedSave(updatedNodes, connections);
                    setIsAddModalVisible(false);
                }}>
                  <Ionicons name={CATEGORY_ICONS[type] as any || 'help-outline'} size={24} color={CATEGORY_COLORS[type] || '#ccc'} /><Text style={styles.typeBtnText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsAddModalVisible(false)}><Text style={styles.closeBtnText}>Închide</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={isConnectionModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Conectează la...</Text>
            <FlatList
              data={(nodes || []).filter(n => n && n.id !== connectingFromId && !((connections || []).some(c => c && c.fromId === connectingFromId && c.toId === n.id)))}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.connectionItem} onPress={() => {
                    if (!connectingFromId) return;
                    const newConnection: Connection = { fromId: connectingFromId, toId: item.id };
                    const updatedConnections = [...(connections || []), newConnection];
                    setConnections(updatedConnections);
                    debouncedSave(nodes, updatedConnections);
                    setConnectingFromId(null);
                    setIsConnectionModalVisible(false);
                }}>
                   <Ionicons name={CATEGORY_ICONS[item.type] as any || 'help-outline'} size={20} color={CATEGORY_COLORS[item.type] || '#ccc'} />
                   <Text style={styles.connectionItemText}>{item.title}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>Niciun nod disponibil.</Text>}
            />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsConnectionModalVisible(false)}><Text style={styles.closeBtnText}>Anulează</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={isWizardVisible} transparent={false} animationType="slide">
        <SafeAreaView style={styles.fullscreenModal} edges={['top', 'bottom']}>
          <View style={styles.wizardContent}>
            <View style={styles.wizardHeader}><Text style={styles.wizardTitle}>{newAgentConfig.id ? 'Editare Agent' : 'Agent Wizard'}</Text><Text style={styles.wizardStep}>Pas {wizardStep}/5</Text></View>
            {wizardStep === 1 && <View style={styles.wizardBody}><Text style={styles.inputLabel}>Nume</Text><TextInput style={styles.input} value={newAgentConfig.name} onChangeText={text => setNewAgentConfig({...newAgentConfig, name: text})} /><Text style={styles.inputLabel}>Descriere</Text><TextInput style={[styles.input, { height: 80 }]} value={newAgentConfig.description} onChangeText={text => setNewAgentConfig({...newAgentConfig, description: text})} multiline /></View>}
            {wizardStep === 2 && <View style={styles.wizardBody}><Text style={styles.inputLabel}>Provider</Text><View style={styles.row}>{['groq', 'openrouter'].map(p => (<TouchableOpacity key={p} style={[styles.providerTab, newAgentConfig.agentProvider === p && styles.providerTabActive]} onPress={() => setNewAgentConfig({...newAgentConfig, agentProvider: p as any})}><Text style={styles.providerTabText}>{p.toUpperCase()}</Text></TouchableOpacity>))}</View></View>}
            {wizardStep === 5 && <TouchableOpacity style={styles.finalizeBtn} onPress={handleCreateAgent}><Text style={styles.finalizeBtnText}>Salvează Agent</Text></TouchableOpacity>}
            <View style={styles.wizardFooter}><TouchableOpacity onPress={() => wizardStep > 1 && setWizardStep(wizardStep - 1)} disabled={wizardStep === 1}><Text style={styles.wizardBtnText}>Inapoi</Text></TouchableOpacity><TouchableOpacity onPress={() => setIsWizardVisible(false)}><Text style={styles.closeWizardText}>Anulează</Text></TouchableOpacity>{wizardStep < 5 && <TouchableOpacity onPress={() => setWizardStep(wizardStep + 1)}><Text style={styles.wizardBtnText}>Inainte</Text></TouchableOpacity>}</View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Toolbar */}
      <View style={[styles.toolbar, { height: 70 + insets.bottom, paddingBottom: insets.bottom }]}>
         <TouchableOpacity style={styles.toolbarBtn} onPress={() => setViewMode('canvas')}>
            <Ionicons name="apps-outline" size={24} color={viewMode === 'canvas' ? '#6366f1' : '#94a3b8'} />
            <Text style={[styles.toolbarText, viewMode === 'canvas' && { color: '#6366f1' }]}>Canvas</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.toolbarBtn} onPress={() => setViewMode('dashboard')}>
            <Ionicons name="list-outline" size={24} color={viewMode === 'dashboard' ? '#6366f1' : '#94a3b8'} />
            <Text style={[styles.toolbarText, viewMode === 'dashboard' && { color: '#6366f1' }]}>Dashboard</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.toolbarBtn} onPress={() => { setIsWizardVisible(true); setWizardStep(1); }}>
            <Ionicons name="color-wand-outline" size={24} color="#94a3b8" />
            <Text style={styles.toolbarText}>Wizard</Text>
         </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { height: 100, backgroundColor: '#1e293b', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#334155' },
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
  agentCard: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 10 },
  agentCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  agentCardName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  agentCardMeta: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  zoomControls: { position: 'absolute', left: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 20, padding: 5, shadowColor: '#000', shadowOpacity: 0.3, elevation: 5, zIndex: 1001 },
  zoomBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center', marginHorizontal: 2 },
  zoomLevel: { paddingHorizontal: 10 },
  zoomLevelText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  fab: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', elevation: 8, zIndex: 1000 },
  toolbar: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#1e293b', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#334155', zIndex: 999 },
  toolbarBtn: { alignItems: 'center' },
  toolbarText: { color: '#94a3b8', fontSize: 10, marginTop: 4, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1e293b', borderRadius: 20, padding: 20, maxHeight: '80%' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  connectionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', padding: 14, borderRadius: 10, marginBottom: 10 },
  connectionItemText: { color: '#fff', marginLeft: 12, fontWeight: 'bold' },
  nodeTypeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  typeBtn: { width: '48%', backgroundColor: '#0f172a', padding: 14, borderRadius: 10, borderLeftWidth: 4, marginBottom: 10, alignItems: 'center' },
  typeBtnText: { color: '#fff', marginTop: 6, fontWeight: 'bold', fontSize: 12 },
  closeBtn: { marginTop: 16, alignItems: 'center' },
  closeBtnText: { color: '#94a3b8', fontWeight: 'bold', fontSize: 13 },
  fullscreenModal: { flex: 1, backgroundColor: '#0f172a' },
  wizardContent: { flex: 1, padding: 20 },
  wizardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  wizardTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  wizardStep: { color: '#6366f1', fontSize: 14, fontWeight: 'bold' },
  wizardBody: { flex: 1 },
  inputLabel: { color: '#94a3b8', fontSize: 14, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#1e293b', borderRadius: 12, padding: 14, color: '#fff', borderWidth: 1, borderColor: '#334155', fontSize: 15 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  providerTab: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#1e293b', marginRight: 10, marginBottom: 10 },
  providerTabActive: { backgroundColor: '#6366f1' },
  providerTabText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  finalizeBtn: { backgroundColor: '#10b981', padding: 18, borderRadius: 14, alignItems: 'center' },
  finalizeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  wizardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  wizardBtnText: { color: '#6366f1', fontWeight: 'bold', fontSize: 16 },
  closeWizardText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 },
  flashOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#10b981', zIndex: 2000 },
  emptyText: { color: '#475569', textAlign: 'center', marginTop: 40 },
});
