
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
import Svg, { Path, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_SIZE = 2000;
const NODE_WIDTH = 160;
const NODE_HEIGHT = 80;

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

export default function CodeStudio() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<NodeType | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  
  // For Dragging feedback
  const [isDragging, setIsDragging] = useState(false);

  // Initial Presets
  const initWorkspace = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem('@code_studio_workspace');
      if (saved) {
        const parsed = JSON.parse(saved);
        setNodes(parsed.nodes || []);
        setConnections(parsed.connections || []);
      } else {
        const initialNodes: Node[] = [
          { id: '1', type: 'Agent', title: 'Groq Agent', x: 100, y: 150, config: { apiKey: '' } },
          { id: '2', type: 'Skill', title: 'React Native UI', x: 300, y: 150, config: { prompt: 'Esti expert React Native + Expo. Folosesti hooks, TypeScript, si optimizezi performanta componentelor mobile.' } },
          { id: '3', type: 'Tool', title: 'Web Search', x: 500, y: 150, config: { engine: 'DuckDuckGo' } },
          { id: '4', type: 'Output', title: 'Chat Display', x: 700, y: 150, config: { destination: 'Chat Display' } },
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
  }, []);

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

  const addNode = (type?: NodeType) => {
    const nodeTypeToCreate = type || selectedCategory;
    if (!nodeTypeToCreate) {
      Alert.alert('Eroare', 'Nu s-a putut determina tipul nodului.');
      return;
    }

    let defaultTitle = `${nodeTypeToCreate} Node`;
    let defaultConfig = {};

    if (nodeTypeToCreate === 'Skill') {
       defaultTitle = 'New Skill';
       defaultConfig = { prompt: 'Esti un asistent specializat. Ajuta utilizatorul cu expertiza ta.' };
    } else if (nodeTypeToCreate === 'Tool') {
       defaultTitle = 'Web Search';
       defaultConfig = { engine: 'DuckDuckGo', maxResults: 5 };
    } else if (nodeTypeToCreate === 'Output') {
       defaultTitle = 'Chat Display';
       defaultConfig = { destination: 'Chat Display' };
    }

    const newNode: Node = {
      id: Math.random().toString(36).substr(2, 9),
      type: nodeTypeToCreate,
      title: defaultTitle,
      x: 100 + nodes.length * 20,
      y: 100 + (nodes.length % 8) * 60,
      config: defaultConfig,
    };
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    saveWorkspace(updatedNodes, connections);
    setIsAddModalVisible(false);
    setSelectedCategory(null);
  };

  const updateNodePosition = (id: string, x: number, y: number) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
  };

  const finalizeNodePosition = () => {
    setNodes(currentNodes => {
      saveWorkspace(currentNodes, connections);
      return currentNodes;
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

  const runWorkflow = () => {
    if (connections.length === 0) {
      Alert.alert('Info', 'Nu există conexiuni pentru a rula fluxul.');
      return;
    }
    Alert.alert('Flux Rulat', 'Fluxul de lucru a fost procesat de Jarvis.');
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

      return (
        <React.Fragment key={`conn-${index}`}>
          <Path
            d={path}
            stroke={CATEGORY_COLORS[fromNode.type]}
            strokeWidth="3"
            strokeOpacity="0.6"
            fill="none"
          />
          <Circle cx={x1} cy={y1} r="4" fill={CATEGORY_COLORS[fromNode.type]} />
          <Circle cx={x2} cy={y2} r="4" fill={CATEGORY_COLORS[fromNode.type]} />
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
            <Ionicons name="refresh-outline" size={20} color="#6366f1" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={runWorkflow}>
            <Ionicons name="play" size={20} color="#10b981" />
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
              {renderConnections()}
            </Svg>
            {nodes.map((node) => (
              <DraggableNode 
                key={node.id} 
                node={node} 
                onUpdatePosition={(x, y) => updateNodePosition(node.id, x, y)}
                onFinalizePosition={finalizeNodePosition}
                onPress={() => handleConnect(node.id)}
                onLongPress={() => setEditingNode(node)}
                isSelected={connectingFrom === node.id}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
              />
            ))}
          </View>
        </ScrollView>
      </ScrollView>

      <TouchableOpacity 
        style={styles.floatingAddButton} 
        onPress={() => { setSelectedCategory(null); setIsAddModalVisible(true); }}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <View style={styles.toolbar}>
        <ToolbarItem icon="hardware-chip" label="Agents" color={CATEGORY_COLORS.Agent} onPress={() => { setSelectedCategory('Agent'); setIsAddModalVisible(true); }} />
        <ToolbarItem icon="book" label="Skills" color={CATEGORY_COLORS.Skill} onPress={() => { setSelectedCategory('Skill'); setIsAddModalVisible(true); }} />
        <ToolbarItem icon="hammer" label="Tools" color={CATEGORY_COLORS.Tool} onPress={() => { setSelectedCategory('Tool'); setIsAddModalVisible(true); }} />
        <ToolbarItem icon="paper-plane" label="Output" color={CATEGORY_COLORS.Output} onPress={() => { setSelectedCategory('Output'); setIsAddModalVisible(true); }} />
      </View>

      {/* Modals remain mostly the same but with updated logic if needed */}
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
                  <Text style={styles.inputLabel}>API Key / Provider</Text>
                  <TextInput
                    style={styles.input}
                    value={editingNode.config.apiKey}
                    onChangeText={(text) => setEditingNode({ 
                      ...editingNode, 
                      config: { ...editingNode.config, apiKey: text } 
                    })}
                    placeholder="Auto-detectat din setări"
                    placeholderTextColor="#94a3b8"
                  />
                </>
              )}

              {editingNode.type === 'Skill' && (
                <>
                  <Text style={styles.inputLabel}>Prompt System</Text>
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

interface DraggableNodeProps {
  node: Node;
  onUpdatePosition: (x: number, y: number) => void;
  onFinalizePosition: () => void;
  onPress: () => void;
  onLongPress: () => void;
  isSelected: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}

function DraggableNode({ node, onUpdatePosition, onFinalizePosition, onPress, onLongPress, isSelected, onDragStart, onDragEnd }: DraggableNodeProps) {
  const pan = useRef(new Animated.ValueXY({ x: node.x, y: node.y })).current;

  // Sincronizare pozitie cand se incarca din extern
  useEffect(() => {
    pan.setValue({ x: node.x, y: node.y });
  }, [node.x, node.y]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        onDragStart();
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (evt, gestureState) => {
        const newX = (pan.x as any)._offset + gestureState.dx;
        const newY = (pan.y as any)._offset + gestureState.dy;
        onUpdatePosition(newX, newY);
        return Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(evt, gestureState);
      },
      onPanResponderRelease: () => {
        onDragEnd();
        pan.flattenOffset();
        onFinalizePosition();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.node,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y }
          ],
          borderLeftColor: CATEGORY_COLORS[node.type],
          borderColor: isSelected ? '#ffffff' : '#334155',
          borderWidth: isSelected ? 2 : 1,
          position: 'absolute',
          left: 0,
          top: 0,
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
          <Ionicons name={CATEGORY_ICONS[node.type] as any} size={18} color={CATEGORY_COLORS[node.type]} />
          <View style={styles.statusDot} />
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
        <Ionicons name={`${icon}-outline` as any} size={22} color={color} />
      </View>
      <Text style={styles.toolbarLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    height: 60,
    backgroundColor: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 10,
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: '#0f172a',
  },
  node: {
    width: NODE_WIDTH,
    padding: 12,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  nodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  nodeTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  nodeSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  toolbar: {
    height: 80,
    backgroundColor: '#111827',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingBottom: 10,
  },
  toolbarItem: {
    alignItems: 'center',
  },
  toolbarIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  toolbarLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 22,
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
    borderRadius: 20,
    borderLeftWidth: 4,
    marginBottom: 16,
    alignItems: 'center',
  },
  addNodeText: {
    color: '#fff',
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 14,
  },
  closeButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 10,
  },
  closeButtonText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '500',
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  footerButton: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  saveButton: {
    backgroundColor: '#6366f1',
  },
  footerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

