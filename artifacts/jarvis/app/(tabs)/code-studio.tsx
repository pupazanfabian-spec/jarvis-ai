
import React, { useState, useEffect, useCallback } from 'react';
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

  useEffect(() => {
    if (isAddModalVisible && selectedCategory) {
      addNode();
    }
  }, [isAddModalVisible, selectedCategory]);

  // Initial Presets
  const initWorkspace = async () => {
    try {
      const saved = await AsyncStorage.getItem('@code_studio_workspace');
      if (saved) {
        const parsed = JSON.parse(saved);
        setNodes(parsed.nodes || []);
        setConnections(parsed.connections || []);
      } else {
        const initialNodes: Node[] = [
          { id: '1', type: 'Agent', title: 'Groq Agent', x: 50, y: 150, config: { apiKey: '' } },
          { id: '2', type: 'Skill', title: 'React Native', x: 250, y: 150, config: { prompt: '' } },
          { id: '3', type: 'Tool', title: 'Web Search', x: 450, y: 150, config: {} },
          { id: '4', type: 'Output', title: 'Chat Display', x: 650, y: 150, config: {} },
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
  };

  useEffect(() => {
    initWorkspace();
  }, []);

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
    const newNode: Node = {
      id: Math.random().toString(36).substr(2, 9),
      type: nodeTypeToCreate,
      title: `${nodeTypeToCreate} Node`,
      x: 100 + nodes.length * 20,
      y: 200 + (nodes.length % 5) * 50,
      config: {},
    };
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    saveWorkspace(updatedNodes, connections);
    setIsAddModalVisible(false);
    setSelectedCategory(null); // Reset after adding
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
      // Start a new connection
      setConnectingFrom(nodeId);
    } else if (connectingFrom === nodeId) {
      // Cancel connection if tapping the same node again
      setConnectingFrom(null);
    } else {
      // Complete a connection
      const newConnection: Connection = { fromId: connectingFrom, toId: nodeId };
      const connectionExists = connections.some(
        (conn) => (conn.fromId === newConnection.fromId && conn.toId === newConnection.toId) ||
                  (conn.fromId === newConnection.toId && conn.toId === newConnection.fromId)
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

    // Simple sequential execution for demonstration
    // In a real scenario, you might want a more sophisticated execution order
    connections.forEach((connection) => {
      const fromNode = nodes.find((n) => n.id === connection.fromId);
      const toNode = nodes.find((n) => n.id === connection.toId);

      if (fromNode && toNode) {
        // Construct message based on fromNode config
        // This is a placeholder; the actual message structure will depend on your BrainContext API
        const message = {
          sender: fromNode.title, // Or fromNode.type
          type: fromNode.type, // e.g., 'Agent', 'Skill'
          payload: fromNode.config, // The configuration data
          // You might want to include the target node info as well
          // target: toNode.title,
        };

        // Assuming BrainContext is available and has a sendMessage function
        // For now, we'll just log it as BrainContext is not directly available here
        console.log('Sending message to BrainContext:', message);
        // Example of how it might be called if BrainContext was imported and available:
        // BrainContext.sendMessage(message);
      }
    });
    Alert.alert('Flux Rulat', 'Fluxul de lucru a fost procesat (logat în consolă).');
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
            stroke="#6366f1"
            strokeWidth="3"
            strokeOpacity="0.6"
            fill="none"
          />
          <Circle cx={x1} cy={y1} r="5" fill="#6366f1" />
          <Circle cx={x2} cy={y2} r="5" fill="#6366f1" />
        </React.Fragment>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎯 Jarvis Code Studio</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={runWorkflow}>
            <Ionicons name="play-outline" size={20} color="#10b981" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Canvas */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ height: CANVAS_SIZE }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ width: CANVAS_SIZE }}
        >
          <View style={styles.canvas}>
            <Svg style={StyleSheet.absoluteFill}>
              {renderConnections()}
            </Svg>
            {nodes.map((node) => (
              <TouchableOpacity
                key={node.id}
                style={[
                  styles.node,
                  {
                    left: node.x,
                    top: node.y,
                    borderLeftColor: CATEGORY_COLORS[node.type],
                    borderColor: connectingFrom === node.id ? '#ffffff' : '#334155', // Highlight if selected for connection
                    borderWidth: connectingFrom === node.id ? 2 : 1,
                  },
                ]}
                onPress={() => handleConnect(node.id)}
                onLongPress={() => deleteNode(node.id)}
                activeOpacity={0.7}
              >
                <View style={styles.nodeHeader}>
                  <Ionicons name={CATEGORY_ICONS[node.type] as any} size={18} color={CATEGORY_COLORS[node.type]} />
                  <View style={styles.statusDot} />
                </View>
                <Text style={styles.nodeTitle} numberOfLines={1}>{node.title}</Text>
                <Text style={styles.nodeSubtitle}>{node.type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.floatingAddButton} 
        onPress={() => { setSelectedCategory(null); setIsAddModalVisible(true); }}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Toolbar */}
      <View style={styles.toolbar}>
        <ToolbarItem icon="hardware-chip" label="Agents" color={CATEGORY_COLORS.Agent} onPress={() => { setSelectedCategory('Agent'); setIsAddModalVisible(true); }} />
        <ToolbarItem icon="book" label="Skills" color={CATEGORY_COLORS.Skill} onPress={() => { setSelectedCategory('Skill'); setIsAddModalVisible(true); }} />
        <ToolbarItem icon="hammer" label="Tools" color={CATEGORY_COLORS.Tool} onPress={() => { setSelectedCategory('Tool'); setIsAddModalVisible(true); }} />
        <ToolbarItem icon="paper-plane" label="Output" color={CATEGORY_COLORS.Output} onPress={() => { setSelectedCategory('Output'); setIsAddModalVisible(true); }} />
      </View>

      {/* Add Node Modal */}
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

      {/* Node Config Modal */}
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
                  <Text style={styles.inputLabel}>API Key</Text>
                  <TextInput
                    style={styles.input}
                    value={editingNode.config.apiKey}
                    onChangeText={(text) => setEditingNode({ 
                      ...editingNode, 
                      config: { ...editingNode.config, apiKey: text } 
                    })}
                    placeholder="Introdu API Key"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                  />
                </>
              )}

              {editingNode.type === 'Skill' && (
                <>
                  <Text style={styles.inputLabel}>Prompt Editor</Text>
                  <TextInput
                    style={[styles.input, { height: 100 }]}
                    value={editingNode.config.prompt}
                    onChangeText={(text) => setEditingNode({ 
                      ...editingNode, 
                      config: { ...editingNode.config, prompt: text } 
                    })}
                    placeholder="Introdu Skill Prompt"
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
                  <Text style={styles.footerButtonText}>Șterge</Text>
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
    marginLeft: 16,
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
  canvasScroll: {
    flex: 1,
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: '#0f172a',
  },
  node: {
    position: 'absolute',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
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
    borderWidth: 1,
    borderColor: '#1e293b',
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
