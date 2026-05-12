import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  SafeAreaView,
  PanResponder,
  Animated,
} from 'react-native';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as keyManager from '@/engine/code-studio/keyManager';
import { SKILLS } from '@/engine/code-studio/skills';
import { SubAgent, getSubAgents, deleteSubAgent as deleteSA, toggleSubAgent, createSubAgent } from '@/engine/code-studio/subAgentManager';
import { useAIProvider } from '@/context/AIProviderContext';
import { useBrain } from '@/context/BrainContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_SIZE = 2000;
const NODE_WIDTH = 180;
const NODE_HEIGHT = 100;

type NodeType = 'Agent' | 'Skill' | 'Tool' | 'Output';

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

const CATEGORY_COLORS = {
  Agent: '#6366f1',
  Skill: '#10b981',
  Tool: '#f59e0b',
  Output: '#ef4444',
};

const CATEGORY_ICONS = {
  Agent: 'hardware-chip-outline',
  Skill: 'book-outline',
  Tool: 'hammer-outline',
  Output: 'paper-plane-outline',
} as const;

import { SubAgent, getSubAgents, deleteSubAgent as deleteSA, toggleSubAgent } from '@/engine/code-studio/subAgentManager';

export default function CodeStudio() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<NodeType | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [subAgents, setSubAgents] = useState<SubAgent[]>([]);
  const { settings } = useAIProvider();
  const { sendMessage } = useBrain();
  
  // For Dragging feedback
  const [isDragging, setIsDragging] = useState(false);

  // Initial Presets
  const initWorkspace = useCallback(async () => {
    try {
      // Sync keys from context on init
      await keyManager.syncKeysFromContext(settings);
      
      // Load sub agents
      const sa = await getSubAgents();
      setSubAgents(sa);

      const saved = await AsyncStorage.getItem('@code_studio_workspace');
      if (saved) {
        const parsed = JSON.parse(saved);
        setNodes(parsed.nodes || []);
        setConnections(parsed.connections || []);
      } else {
        const initialNodes: Node[] = [
          { id: '1', type: 'Agent', title: 'Groq Agent', x: 100, y: 150, config: { provider: 'Groq', apiKey: '' } },
          { id: '2', type: 'Skill', title: 'React Native UI', x: 350, y: 150, config: { skillId: 'skill_react_native', prompt: 'Esti expert React Native + Expo. Folosesti hooks, TypeScript, si optimizezi performanta componentelor mobile.' } },
          { id: '3', type: 'Tool', title: 'Web Search', x: 600, y: 150, config: { engine: 'DuckDuckGo' } },
          { id: '4', type: 'Output', title: 'Chat Display', x: 850, y: 150, config: { destination: 'Chat Display' } },
        ];
        const initialConnections: Connection[] = [
          { fromId: '1', toId: '2' },
          { fromId: '2', toId: '3' },
          { fromId: '3', toId: '4' },
        ];
        setNodes(initialNodes);
        setConnections(initialConnections);
        saveWorkspace(initialNodes, initialConnections);
      }
    } catch (e) {
      console.error('Failed to load workspace', e);
    }
  }, [settings]);

  useEffect(() => {
    initWorkspace();
  }, [initWorkspace]);

  const saveWorkspace = async (newNodes: Node[], newConnections: Connection[]) => {
    try {
      await AsyncStorage.setItem('@code_studio_workspace', JSON.stringify({ nodes: newNodes, connections: newConnections }));
    } catch (e) {
      console.error('Failed to save workspace', e);
    }
  };

  const refreshSubAgents = async () => {
    const sa = await getSubAgents();
    setSubAgents(sa);
  };

  const addNode = (type?: NodeType) => {
    const nodeTypeToCreate = type || selectedCategory;
    if (!nodeTypeToCreate) {
      Alert.alert('Eroare', 'Nu s-a putut determina tipul nodului.');
      return;
    }

    let defaultTitle = `${nodeTypeToCreate} Node`;
    let defaultConfig = {};

    if (nodeTypeToCreate === 'Agent') {
      defaultTitle = 'AI Agent';
      defaultConfig = { provider: 'Groq', apiKey: '' };
    } else if (nodeTypeToCreate === 'Skill') {
       defaultTitle = 'New Skill';
       defaultConfig = { skillId: '', prompt: 'Esti un asistent specializat. Ajuta utilizatorul cu expertiza ta.' };
    } else if (nodeTypeToCreate === 'Tool') {
       defaultTitle = 'Web Search';
       defaultConfig = { engine: 'DuckDuckGo', maxResults: 5 };
    } else if (nodeTypeToCreate === 'Output') {
       defaultTitle = 'Chat Display';
       defaultConfig = { destination: 'Chat Display' };
    }

    // Ensure gap of at least 20px
    let newX = 100 + nodes.length * 40;
    let newY = 100 + (nodes.length % 8) * 80;
    
    // Simple collision avoidance
    const hasCollision = (x: number, y: number) => {
      return nodes.some(n => Math.abs(n.x - x) < NODE_WIDTH + 20 && Math.abs(n.y - y) < NODE_HEIGHT + 20);
    };

    while (hasCollision(newX, newY)) {
      newX += 50;
      if (newX > CANVAS_SIZE - NODE_WIDTH) {
        newX = 100;
        newY += 100;
      }
    }

    const newNode: Node = {
      id: Math.random().toString(36).substr(2, 9),
      type: nodeTypeToCreate,
      title: defaultTitle,
      x: newX,
      y: newY,
      config: defaultConfig,
    };
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    saveWorkspace(updatedNodes, connections);
    setIsAddModalVisible(false);
    setSelectedCategory(null);
  };

  const finalizeNodePosition = (id: string, x: number, y: number) => {
    setNodes(currentNodes => {
      const updated = currentNodes.map(n => n.id === id ? { ...n, x, y } : n);
      saveWorkspace(updated, connections);
      return updated;
    });
  };

  const deleteNode = (id: string) => {
    Alert.alert('Șterge Nod', 'Sigur vrei să ștergi acest nod?', [
      { text: 'Anulează', style: 'cancel' },
      {
        text: 'Șterge',
        style: 'destructive',
        onPress: () => {
          const updatedNodes = nodes.filter((n) => n.id !== id);
          const updatedConnections = connections.filter((c) => c.fromId !== id && c.toId !== id);
          setNodes(updatedNodes);
          setConnections(updatedConnections);
          saveWorkspace(updatedNodes, updatedConnections);
        },
      },
    ]);
  };

  const updateNodeConfig = (id: string, updates: Partial<Node>) => {
    const updatedNodes = nodes.map((n) => (n.id === id ? { ...n, ...updates } : n));
    setNodes(updatedNodes);
    saveWorkspace(updatedNodes, connections);
    setEditingNode(null);
  };

  const handleConnect = (nodeId: string) => {
    if (connectingFrom === null) {
      setConnectingFrom(nodeId);
    } else if (connectingFrom === nodeId) {
      setConnectingFrom(null);
    } else {
      const newConnection: Connection = { fromId: connectingFrom, toId: nodeId };
      const connectionExists = connections.some(
        (conn) => (conn.fromId === newConnection.fromId && conn.toId === newConnection.toId)
      );
      if (!connectionExists) {
        const updatedConnections = [...connections, newConnection];
        setConnections(updatedConnections);
        saveWorkspace(nodes, updatedConnections);
      }
      setConnectingFrom(null);
    }
  };

  const runWorkflow = async () => {
    if (connections.length === 0) {
      Alert.alert('Info', 'Nu există conexiuni pentru a rula fluxul.');
      return;
    }

    // Identify the chain: Agent -> Skill
    const agentNode = nodes.find(n => n.type === 'Agent');
    if (!agentNode) {
      Alert.alert('Eroare', 'Lipsește un nod de tip Agent.');
      return;
    }

    // Collect skills connected to the agent
    const connectedSkills = connections
      .filter(c => c.fromId === agentNode.id)
      .map(c => nodes.find(n => n.id === c.toId))
      .filter(n => n && n.type === 'Skill');

    // Create a sub-agent from the flow
    try {
      const subAgent = await createSubAgent({
        name: agentNode.title,
        agentProvider: agentNode.config.provider.toLowerCase(),
        apiKey: agentNode.config.apiKey,
        skills: connectedSkills.map(s => s?.config.skillId).filter(Boolean),
        systemPrompt: connectedSkills.map(s => s?.config.prompt).join('\n\n'),
      });

      await refreshSubAgents();
      Alert.alert('Succes', `Sub-Agentul "${subAgent.name}" a fost salvat și este gata de utilizare în chat.`);
    } catch (e) {
      Alert.alert('Eroare', 'Nu s-a putut crea Sub-Agentul.');
    }
  };

  const renderGrid = () => {
    const dots = [];
    const step = 40;
    for (let x = 0; x < CANVAS_SIZE; x += step) {
      for (let y = 0; y < CANVAS_SIZE; y += step) {
        dots.push(
          <Circle key={`dot-${x}-${y}`} cx={x} cy={y} r="1" fill="rgba(255,255,255,0.03)" />
        );
      }
    }
    return dots;
  };

  const renderConnections = () => {
    return connections.map((conn, index) => {
      const fromNode = nodes.find((n) => n.id === conn.fromId);
      const toNode = nodes.find((n) => n.id === conn.toId);

      if (!fromNode || !toNode) return null;

      const x1 = fromNode.x + NODE_WIDTH;
      const y1 = fromNode.y + NODE_HEIGHT / 2;
      const x2 = toNode.x;
      const y2 = toNode.y + NODE_HEIGHT / 2;

      const cx1 = x1 + (x2 - x1) / 2;
      const cy1 = y1;
      const cx2 = x1 + (x2 - x1) / 2;
      const cy2 = y2;

      const path = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
      
      // Calculate arrowhead
      const t = 0.95; // Point near the end for tangent
      const tx = (1-t)**3 * x1 + 3*(1-t)**2*t*cx1 + 3*(1-t)*t**2*cx2 + t**3*x2;
      const ty = (1-t)**3 * y1 + 3*(1-t)**2*t*cy1 + 3*(1-t)*t**2*cx2 + t**3*y2;
      const angle = Math.atan2(y2 - ty, x2 - tx);
      const arrowSize = 8;
      const arrowP1 = `${x2},${y2}`;
      const arrowP2 = `${x2 - arrowSize * Math.cos(angle - Math.PI/6)},${y2 - arrowSize * Math.sin(angle - Math.PI/6)}`;
      const arrowP3 = `${x2 - arrowSize * Math.cos(angle + Math.PI/6)},${y2 - arrowSize * Math.sin(angle + Math.PI/6)}`;

      return (
        <React.Fragment key={`conn-${index}`}>
          <Path
            d={path}
            stroke={CATEGORY_COLORS[fromNode.type]}
            strokeWidth="3"
            strokeOpacity="0.8"
            fill="none"
          />
          <Circle cx={x1} cy={y1} r="4" fill={CATEGORY_COLORS[fromNode.type]} />
          <Polygon
            points={`${arrowP1} ${arrowP2} ${arrowP3}`}
            fill={CATEGORY_COLORS[fromNode.type]}
          />
        </React.Fragment>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎯 Jarvis Code Studio</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={initWorkspace}>
            <Ionicons name="refresh-outline" size={22} color="#6366f1" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={runWorkflow}>
            <Ionicons name="save-outline" size={22} color="#10b981" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={!isDragging}
        contentContainerStyle={{ height: CANVAS_SIZE }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isDragging}
          contentContainerStyle={{ width: CANVAS_SIZE }}
        >
          <View style={styles.canvas}>
            <Svg style={StyleSheet.absoluteFill}>
              {renderGrid()}
              {renderConnections()}
            </Svg>
            {nodes.map((node) => (
              <NodeCard 
                key={node.id} 
                node={node} 
                onFinalizePosition={finalizeNodePosition}
                onPress={() => handleConnect(node.id)}
                onLongPress={() => setEditingNode(node)}
                isSelected={connectingFrom === node.id}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
                isActive={subAgents.some(sa => sa.isActive && (sa.name === node.title || sa.id === node.id))}
              />
            ))}
          </View>
        </ScrollView>
      </ScrollView>

      {/* Sub-Agent List */}
      <View style={styles.saSection}>
        <Text style={styles.saTitle}>Sub-Agenți Activi ({subAgents.filter(s => s.isActive).length})</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.saScroll}>
          {subAgents.map(sa => (
            <View key={sa.id} style={styles.saCard}>
              <View style={styles.saCardHeader}>
                <Ionicons name="robot-outline" size={18} color="#6366f1" />
                <Text style={styles.saCardName} numberOfLines={1}>{sa.name}</Text>
                <TouchableOpacity onPress={async () => { await deleteSA(sa.id); refreshSubAgents(); }}>
                   <Ionicons name="trash-outline" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
              <View style={styles.saCardBody}>
                <Text style={styles.saCardMeta}>{sa.agentProvider.toUpperCase()} • {sa.skills.length} skills</Text>
                <TouchableOpacity 
                  style={[styles.saToggle, sa.isActive && styles.saToggleActive]}
                  onPress={async () => { await toggleSubAgent(sa.id, !sa.isActive); refreshSubAgents(); }}
                >
                  <Text style={styles.saToggleText}>{sa.isActive ? 'Activ' : 'Inactiv'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {subAgents.length === 0 && (
            <Text style={styles.emptySAText}>Nu ai creat niciun sub-agent încă.</Text>
          )}
        </ScrollView>
      </View>

      <TouchableOpacity 
        style={styles.floatingAddButton} 
        onPress={() => { setSelectedCategory(null); setIsAddModalVisible(true); }}
      >
        <Ionicons name="add" size={36} color="#fff" />
      </TouchableOpacity>

      <View style={styles.toolbar}>
        <ToolbarItem icon="hardware-chip" label="Agents" color={CATEGORY_COLORS.Agent} onPress={() => { setSelectedCategory('Agent'); setIsAddModalVisible(true); }} />
        <ToolbarItem icon="book" label="Skills" color={CATEGORY_COLORS.Skill} onPress={() => { setSelectedCategory('Skill'); setIsAddModalVisible(true); }} />
        <ToolbarItem icon="hammer" label="Tools" color={CATEGORY_COLORS.Tool} onPress={() => { setSelectedCategory('Tool'); setIsAddModalVisible(true); }} />
        <ToolbarItem icon="paper-plane" label="Output" color={CATEGORY_COLORS.Output} onPress={() => { setSelectedCategory('Output'); setIsAddModalVisible(true); }} />
      </View>

      {/* Modals */}
      <Modal visible={isAddModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adaugă Nod Nou</Text>
            <View style={styles.nodeGrid}>
              {(['Agent', 'Skill', 'Tool', 'Output'] as NodeType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.addNodeCard, { borderLeftColor: CATEGORY_COLORS[type] }]}
                  onPress={() => addNode(type)}
                >
                  <Ionicons name={CATEGORY_ICONS[type] as any} size={32} color={CATEGORY_COLORS[type]} />
                  <Text style={styles.addNodeText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsAddModalVisible(false)}>
              <Text style={styles.closeButtonText}>Închide</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {editingNode && (
        <Modal visible={!!editingNode} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Configurare {editingNode.type}</Text>
              
              <Text style={styles.inputLabel}>Titlu</Text>
              <TextInput
                style={styles.input}
                value={editingNode.title}
                onChangeText={(text) => setEditingNode({ ...editingNode, title: text })}
                placeholderTextColor="#94a3b8"
              />

              {editingNode.type === 'Agent' && (
                <>
                  <Text style={styles.inputLabel}>Provider</Text>
                  <View style={styles.providerGrid}>
                    {['Groq', 'OpenRouter', 'Gemini', 'OpenAI'].map(p => (
                      <TouchableOpacity 
                        key={p}
                        style={[styles.providerTab, editingNode.config.provider === p && styles.providerTabActive]}
                        onPress={() => setEditingNode({
                          ...editingNode,
                          config: { ...editingNode.config, provider: p }
                        })}
                      >
                        <Text style={[styles.providerTabText, editingNode.config.provider === p && styles.providerTabTextActive]}>{p}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>API Key (opțional)</Text>
                  <TextInput
                    style={styles.input}
                    value={editingNode.config.apiKey}
                    secureTextEntry
                    onChangeText={(text) => setEditingNode({ 
                      ...editingNode, 
                      config: { ...editingNode.config, apiKey: text } 
                    })}
                    placeholder="Folosește cheia globală dacă e gol"
                    placeholderTextColor="#94a3b8"
                  />
                  <TouchableOpacity 
                    style={styles.saveKeyButton}
                    onPress={async () => {
                      if (editingNode.config.apiKey) {
                        const isValid = await keyManager.validateKey(editingNode.config.provider, editingNode.config.apiKey);
                        if (isValid) {
                          await keyManager.addKey(editingNode.config.provider, editingNode.config.apiKey);
                          Alert.alert('Valid', `Cheia pentru ${editingNode.config.provider} este VALIDĂ și a fost salvată.`);
                        } else {
                          Alert.alert('Invalid', `Cheia pentru ${editingNode.config.provider} este INVALIDĂ sau rețeaua e indisponibilă.`);
                        }
                      }
                    }}
                  >
                    <Text style={styles.saveKeyButtonText}>Testează & Salvează Cheia</Text>
                  </TouchableOpacity>
                </>
              )}

              {editingNode.type === 'Skill' && (
                <>
                  <Text style={styles.inputLabel}>Selectează Skill Predefinit</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.skillScroll}>
                    {SKILLS.map(skill => (
                      <TouchableOpacity 
                        key={skill.id}
                        style={[styles.skillChip, editingNode.config.skillId === skill.id && styles.skillChipActive]}
                        onPress={() => setEditingNode({
                          ...editingNode,
                          title: skill.name,
                          config: { ...editingNode.config, skillId: skill.id, prompt: skill.systemPrompt }
                        })}
                      >
                        <Text style={[styles.skillChipText, editingNode.config.skillId === skill.id && styles.skillChipTextActive]}>{skill.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={styles.inputLabel}>Prompt System Personalizat</Text>
                  <TextInput
                    style={[styles.input, { height: 120 }]}
                    value={editingNode.config.prompt}
                    onChangeText={(text) => setEditingNode({ 
                      ...editingNode, 
                      config: { ...editingNode.config, prompt: text } 
                    })}
                    placeholder="Instrucțiuni pentru agent..."
                    placeholderTextColor="#94a3b8"
                    multiline
                  />
                </>
              )}

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={[styles.footerButton, styles.deleteButton]} 
                  onPress={() => {
                    deleteNode(editingNode.id);
                    setEditingNode(null);
                  }}
                >
                  <Text style={[styles.footerButtonText, { color: '#ef4444' }]}>Șterge</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.footerButton, styles.saveButton]} 
                  onPress={() => updateNodeConfig(editingNode.id, editingNode)}
                >
                  <Text style={styles.footerButtonText}>Salvează</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.closeButton} onPress={() => setEditingNode(null)}>
                <Text style={styles.closeButtonText}>Anulează</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

interface NodeCardProps {
  node: Node;
  onFinalizePosition: (id: string, x: number, y: number) => void;
  onPress: () => void;
  onLongPress: () => void;
  isSelected: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  isActive?: boolean;
}

function NodeCard({ node, onFinalizePosition, onPress, onLongPress, isSelected, onDragStart, onDragEnd, isActive }: NodeCardProps) {
  const pan = useRef(new Animated.ValueXY({ x: node.x, y: node.y })).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSelected || isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0, duration: 1000, useNativeDriver: false }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [isSelected, isActive]);

  // Sync pan value if node prop changes (e.g. from init)
  useEffect(() => {
    pan.setValue({ x: node.x, y: node.y });
  }, [node.x, node.y]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value
        });
        pan.setValue({ x: 0, y: 0 });
        onDragStart();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        onDragEnd();
        const finalX = (pan.x as any)._value;
        const finalY = (pan.y as any)._value;
        onFinalizePosition(node.id, finalX, finalY);
      },
      onPanResponderTerminate: () => {
        pan.flattenOffset();
        onDragEnd();
      },
    })
  ).current;

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#334155', isActive ? '#10b981' : CATEGORY_COLORS[node.type]],
  });

  return (
    <Animated.View
      style={[
        styles.node,
        {
          position: 'absolute',
          left: pan.x,
          top: pan.y,
          borderLeftColor: CATEGORY_COLORS[node.type],
          borderColor: (isSelected || isActive) ? borderColor : '#334155',
          borderWidth: (isSelected || isActive) ? 2 : 1,
          zIndex: isSelected ? 10 : 1,
          shadowOpacity: (isSelected || isActive) ? 0.6 : 0.3,
          transform: [{ scale: isSelected ? 1.05 : 1 }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity 
        onPress={onPress} 
        onLongPress={onLongPress} 
        activeOpacity={0.8}
        delayLongPress={500}
      >
        <View style={styles.nodeHeader}>
          <Ionicons name={CATEGORY_ICONS[node.type] as any} size={28} color={CATEGORY_COLORS[node.type]} />
          <View style={[styles.statusDot, { backgroundColor: isActive ? '#10b981' : '#94a3b8' }]} />
        </View>
        <Text style={styles.nodeTitle} numberOfLines={1}>{node.title}</Text>
        <Text style={styles.nodeSubtitle}>{node.type}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function ToolbarItem({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.toolbarItem} onPress={onPress}>
      <View style={[styles.toolbarIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={`${icon}-outline` as any} size={26} color={color} />
      </View>
      <Text style={[styles.toolbarLabel, { color: '#f8fafc' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    height: 64,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    zIndex: 100,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 220,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 50,
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: '#0f172a',
  },
  node: {
    width: NODE_WIDTH,
    padding: 16,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
  },
  nodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  nodeTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  nodeSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    textTransform: 'uppercase',
    marginTop: 4,
    fontWeight: '600',
  },
  toolbar: {
    height: 90,
    backgroundColor: '#111827',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingBottom: 20,
  },
  toolbarItem: {
    alignItems: 'center',
  },
  toolbarIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  toolbarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.9)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  nodeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  addNodeCard: {
    width: '48%',
    backgroundColor: '#0f172a',
    padding: 20,
    borderRadius: 24,
    borderLeftWidth: 5,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 4,
  },
  addNodeText: {
    color: '#fff',
    marginTop: 12,
    fontWeight: 'bold',
    fontSize: 15,
  },
  closeButton: {
    marginTop: 20,
    alignItems: 'center',
    padding: 12,
  },
  closeButtonText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#475569',
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  footerButton: {
    flex: 1,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  footerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  providerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  providerTab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  providerTabActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  providerTabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  providerTabTextActive: {
    color: '#fff',
  },
  saveKeyButton: {
    backgroundColor: '#334155',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  saveKeyButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  skillScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  skillChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#0f172a',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  skillChipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  skillChipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: 'bold',
  },
  skillChipTextActive: {
    color: '#fff',
  },
  saSection: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  saTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 16,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  saScroll: {
    paddingHorizontal: 12,
  },
  saCard: {
    backgroundColor: '#1e293b',
    width: 150,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  saCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  saCardName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginHorizontal: 6,
  },
  saCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  saCardMeta: {
    color: '#64748b',
    fontSize: 10,
  },
  saToggle: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#0f172a',
  },
  saToggleActive: {
    backgroundColor: '#10b981',
  },
  saToggleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptySAText: {
    color: '#475569',
    fontSize: 12,
    fontStyle: 'italic',
    paddingHorizontal: 16,
  },
});
