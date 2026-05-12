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
  FlatList,
  Switch,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [viewMode, setViewMode] = useState<ViewMode>('canvas');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<NodeType | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [subAgents, setSubAgents] = useState<SubAgent[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const { settings } = useAIProvider();
  const { sendMessage } = useBrain();

  // Wizard State
  const [isWizardVisible, setIsWizardVisible] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newAgentConfig, setNewAgentConfig] = useState<Partial<SubAgent>>({
    name: '',
    description: '',
    agentProvider: 'groq',
    apiKey: '',
    skills: [],
    tools: [],
    systemPrompt: '',
    priority: 5,
  });

  // Sandbox State
  const [isSandboxVisible, setIsSandboxVisible] = useState(false);
  const [sandboxAgent, setSandboxAgent] = useState<SubAgent | null>(null);
  const [sandboxMessage, setSandboxMessage] = useState('');
  const [sandboxResponse, setSandboxResponse] = useState('');
  const [isSandboxThinking, setIsSandboxThinking] = useState(false);
  const [sandboxStats, setSandboxStats] = useState({ time: 0, skill: '' });

  // Skill Editor State
  const [isSkillEditorVisible, setIsSkillEditorVisible] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Partial<Skill>>({
    id: '',
    name: '',
    category: 'custom',
    systemPrompt: '',
    triggers: [],
  });

  // Logs State
  const [isLogsVisible, setIsLogsVisible] = useState(false);
  const [currentLogs, setCurrentLogs] = useState<AgentLog[]>([]);

  // Dragging State
  const [isDragging, setIsDragging] = useState(false);

  const initWorkspace = useCallback(async () => {
    try {
      await keyManager.syncKeysFromContext(settings);
      const sa = await getSubAgents();
      setSubAgents(sa);
      const sk = await getAllSkills();
      setAllSkills(sk);

      const saved = await AsyncStorage.getItem('@code_studio_workspace');
      if (saved) {
        const parsed = JSON.parse(saved);
        setNodes(parsed.nodes || []);
        setConnections(parsed.connections || []);
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

  const refreshSkills = async () => {
    const sk = await getAllSkills();
    setAllSkills(sk);
  };

  const handleCreateAgent = async () => {
    try {
      if (!newAgentConfig.name) return Alert.alert('Eroare', 'Numele este obligatoriu.');
      const agent = await createSubAgent(newAgentConfig);
      
      const newNode: Node = {
        id: agent.id,
        type: 'Agent',
        title: agent.name,
        x: 150,
        y: 150,
        config: { agentId: agent.id, provider: agent.agentProvider },
      };
      
      const updatedNodes = [...nodes.filter(n => n.id !== agent.id), newNode];
      setNodes(updatedNodes);
      saveWorkspace(updatedNodes, connections);
      
      await refreshSubAgents();
      setIsWizardVisible(false);
      setWizardStep(1);
      setNewAgentConfig({ name: '', description: '', agentProvider: 'groq', apiKey: '', skills: [], tools: [], systemPrompt: '', priority: 5 });
    } catch (e) {
      Alert.alert('Eroare', 'Nu s-a putut crea agentul.');
    }
  };

  const handleSaveSkill = async () => {
    if (!editingSkill.name || !editingSkill.systemPrompt) return Alert.alert('Eroare', 'Numele si prompt-ul sunt obligatorii.');
    const skill: Skill = {
      id: editingSkill.id || `skill_custom_${Date.now()}`,
      name: editingSkill.name,
      category: editingSkill.category || 'custom',
      systemPrompt: editingSkill.systemPrompt,
      triggers: editingSkill.triggers || [],
      examples: editingSkill.examples || [],
    };
    await saveSkill(skill);
    await refreshSkills();
    setIsSkillEditorVisible(false);
    Alert.alert('Succes', `Skill-ul "${skill.name}" a fost salvat.`);
  };

  const handleTestAgent = async () => {
    if (!sandboxAgent || !sandboxMessage) return;
    setIsSandboxThinking(true);
    setSandboxResponse('');
    const start = Date.now();
    try {
      const resp = await callSubAgent(sandboxAgent.id, sandboxMessage);
      setSandboxResponse(resp);
      setSandboxStats({ time: Date.now() - start, skill: sandboxAgent.skills[0] || 'General' });
    } catch (e: any) {
      setSandboxResponse(`Eroare: ${e.message}`);
    } finally {
      setIsSandboxThinking(false);
    }
  };

  const addNode = (type: NodeType) => {
    const newNode: Node = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: `New ${type}`,
      x: 100 + nodes.length * 30,
      y: 200,
      config: {},
    };
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    saveWorkspace(updatedNodes, connections);
    setIsAddModalVisible(false);
  };

  const finalizeNodePosition = (id: string, x: number, y: number) => {
    setNodes(currentNodes => {
      const updated = currentNodes.map(n => n.id === id ? { ...n, x, y } : n);
      saveWorkspace(updated, connections);
      return updated;
    });
  };

  const handleConnect = (nodeId: string) => {
    if (connectingFrom === null) {
      setConnectingFrom(nodeId);
    } else if (connectingFrom === nodeId) {
      setConnectingFrom(null);
    } else {
      const newConnection: Connection = { fromId: connectingFrom, toId: nodeId };
      if (!connections.some(c => c.fromId === newConnection.fromId && c.toId === newConnection.toId)) {
        const updatedConnections = [...connections, newConnection];
        setConnections(updatedConnections);
        saveWorkspace(nodes, updatedConnections);
      }
      setConnectingFrom(null);
    }
  };

  const renderCanvas = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={!isDragging} contentContainerStyle={{ height: CANVAS_SIZE }}>
      <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={!isDragging} contentContainerStyle={{ width: CANVAS_SIZE }}>
        <View style={styles.canvas}>
          <Svg style={StyleSheet.absoluteFill}>{renderGrid()}{renderConnections()}</Svg>
          {nodes.map((node) => (
            <NodeCard 
              key={node.id} 
              node={node} 
              onFinalizePosition={finalizeNodePosition}
              onPress={() => handleConnect(node.id)}
              onConfig={() => {
                const agent = subAgents.find(sa => sa.id === node.id || sa.id === node.config?.agentId);
                if (agent) {
                  setNewAgentConfig(agent);
                  setIsWizardVisible(true);
                  setWizardStep(1);
                } else if (node.type === 'Skill') {
                   const skill = allSkills.find(s => s.id === node.id || s.id === node.config?.skillId);
                   if (skill) {
                      setEditingSkill(skill);
                      setIsSkillEditorVisible(true);
                   } else {
                      setEditingNode(node);
                   }
                } else {
                  setEditingNode(node);
                }
              }}
              onRun={() => {
                const agent = subAgents.find(sa => sa.id === node.id || sa.id === node.config?.agentId);
                if (agent) {
                  setSandboxAgent(agent);
                  setIsSandboxVisible(true);
                }
              }}
              onDelete={() => {
                Alert.alert('Sterge', 'Sigur vrei sa stergi acest nod?', [
                  { text: 'Anuleaza' },
                  { text: 'Sterge', onPress: () => {
                    const updatedNodes = nodes.filter(n => n.id !== node.id);
                    const updatedConnections = connections.filter(c => c.fromId !== node.id && c.toId !== node.id);
                    setNodes(updatedNodes);
                    setConnections(updatedConnections);
                    saveWorkspace(updatedNodes, updatedConnections);
                  }}
                ]);
              }}
              isSelected={connectingFrom === node.id}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
              isActive={subAgents.some(sa => sa.isActive && (sa.id === node.id || sa.id === node.config?.agentId))}
              priority={subAgents.find(sa => sa.id === node.id || sa.id === node.config?.agentId)?.priority}
            />
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );

  const renderDashboard = () => (
    <View style={styles.dashboard}>
      <View style={styles.dashboardHeader}>
        <Text style={styles.dashboardTitle}>Sub-Agenți</Text>
        <TouchableOpacity style={styles.addSkillBtn} onPress={() => { setEditingSkill({id:'', name:'', category:'custom', systemPrompt:'', triggers:[]}); setIsSkillEditorVisible(true); }}>
          <Text style={styles.addSkillBtnText}>+ Skill Nou</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={subAgents}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.agentCard}>
            <View style={styles.agentCardHeader}>
              <View>
                <Text style={styles.agentCardName}>{item.name}</Text>
                <Text style={styles.agentCardMeta}>{item.agentProvider.toUpperCase()} • P{item.priority}</Text>
              </View>
              <Switch 
                value={item.isActive} 
                onValueChange={async (val) => { await toggleSubAgent(item.id, val); refreshSubAgents(); }} 
                trackColor={{ false: '#334155', true: '#10b981' }}
              />
            </View>
            <View style={styles.skillChips}>
              {item.skills.map(s => (
                <View key={s} style={styles.skillChipSmall}><Text style={styles.skillChipTextSmall}>{s.replace('skill_', '')}</Text></View>
              ))}
            </View>
            <View style={styles.agentCardActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => { setSandboxAgent(item); setIsSandboxVisible(true); }}>
                <Ionicons name="play" size={16} color="#fff" /><Text style={styles.actionBtnText}>Test</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => { setNewAgentConfig(item); setIsWizardVisible(true); setWizardStep(1); }}>
                <Ionicons name="create-outline" size={16} color="#fff" /><Text style={styles.actionBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={async () => {
                const logs = await getAgentLogs(item.id);
                setCurrentLogs(logs);
                setIsLogsVisible(true);
              }}>
                <Ionicons name="list" size={16} color="#fff" /><Text style={styles.actionBtnText}>Logs</Text>
              </TouchableOpacity>
              <View style={styles.priorityControls}>
                 <TouchableOpacity onPress={() => { updateAgentPriority(item.id, (item.priority || 5) + 1); refreshSubAgents(); }}><Ionicons name="chevron-up" size={18} color="#6366f1" /></TouchableOpacity>
                 <TouchableOpacity onPress={() => { updateAgentPriority(item.id, (item.priority || 5) - 1); refreshSubAgents(); }}><Ionicons name="chevron-down" size={18} color="#6366f1" /></TouchableOpacity>
              </View>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ef4444', marginLeft: 'auto' }]} onPress={() => {
                 Alert.alert('Sterge', 'Stergi agentul definitiv?', [{ text: 'Nu' }, { text: 'Da', onPress: async () => { await deleteSA(item.id); refreshSubAgents(); } }]);
              }}>
                <Ionicons name="trash" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>Nu ai niciun agent creat.</Text></View>}
      />
    </View>
  );

  const renderGrid = () => {
    const dots = [];
    const step = 50;
    for (let x = 0; x < CANVAS_SIZE; x += step) {
      for (let y = 0; y < CANVAS_SIZE; y += step) {
        dots.push(<Circle key={`dot-${x}-${y}`} cx={x} cy={y} r="1" fill="rgba(255,255,255,0.05)" />);
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
      const path = `M ${x1} ${y1} C ${x1 + (x2 - x1) / 2} ${y1}, ${x1 + (x2 - x1) / 2} ${y2}, ${x2} ${y2}`;
      return <Path key={`conn-${index}`} d={path} stroke={CATEGORY_COLORS[fromNode.type]} strokeWidth="2" fill="none" opacity={0.6} />;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabSwitcher}>
          <TouchableOpacity style={[styles.tabBtn, viewMode === 'canvas' && styles.tabBtnActive]} onPress={() => setViewMode('canvas')}><Text style={[styles.tabBtnText, viewMode === 'canvas' && styles.tabBtnTextActive]}>Canvas</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, viewMode === 'dashboard' && styles.tabBtnActive]} onPress={() => setViewMode('dashboard')}><Text style={[styles.tabBtnText, viewMode === 'dashboard' && styles.tabBtnTextActive]}>Dashboard</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.templatesBtn} onPress={() => setIsAddModalVisible(true)}><Ionicons name="layers-outline" size={20} color="#fff" /><Text style={styles.templatesBtnText}>Workspace</Text></TouchableOpacity>
      </View>

      {viewMode === 'canvas' ? renderCanvas() : renderDashboard()}

      <TouchableOpacity style={styles.fab} onPress={() => { setIsWizardVisible(true); setWizardStep(1); }}><Ionicons name="add" size={32} color="#fff" /></TouchableOpacity>

      {/* Node Add Modal */}
      <Modal visible={isAddModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adaugă în Workspace</Text>
            <View style={styles.nodeTypeGrid}>
              {(['Agent', 'Skill', 'Tool', 'Output'] as NodeType[]).map(type => (
                <TouchableOpacity key={type} style={[styles.typeBtn, { borderLeftColor: CATEGORY_COLORS[type] }]} onPress={() => addNode(type)}>
                  <Ionicons name={CATEGORY_ICONS[type] as any} size={24} color={CATEGORY_COLORS[type]} /><Text style={styles.typeBtnText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.sectionLabel}>Șabloane Agenți</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateScroll}>
              {AGENT_TEMPLATES.map(tpl => (
                <TouchableOpacity key={tpl.id} style={styles.templateCard} onPress={async () => {
                  const agent = await createSubAgent(tpl);
                  const newNode: Node = { id: agent.id, type: 'Agent', title: agent.name, x: 150, y: 200, config: { agentId: agent.id } };
                  setNodes([...nodes, newNode]);
                  await refreshSubAgents();
                  setIsAddModalVisible(false);
                }}><Text style={styles.templateName}>{tpl.name}</Text><Text style={styles.templateDesc} numberOfLines={2}>{tpl.description}</Text></TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsAddModalVisible(false)}><Text style={styles.closeBtnText}>Închide</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Agent Wizard */}
      <Modal visible={isWizardVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.wizardContent}>
            <View style={styles.wizardHeader}><Text style={styles.wizardTitle}>{newAgentConfig.id ? 'Editare Agent' : 'Agent Wizard'}</Text><Text style={styles.wizardStep}>Pas {wizardStep}/5</Text></View>
            {wizardStep === 1 && <View style={styles.wizardBody}><Text style={styles.inputLabel}>Nume</Text><TextInput style={styles.input} value={newAgentConfig.name} onChangeText={text => setNewAgentConfig({...newAgentConfig, name: text})} /><Text style={styles.inputLabel}>Descriere</Text><TextInput style={[styles.input, { height: 80 }]} value={newAgentConfig.description} onChangeText={text => setNewAgentConfig({...newAgentConfig, description: text})} multiline /></View>}
            {wizardStep === 2 && <View style={styles.wizardBody}><Text style={styles.inputLabel}>Provider</Text><View style={styles.row}>{['groq', 'openrouter'].map(p => (<TouchableOpacity key={p} style={[styles.providerTab, newAgentConfig.agentProvider === p && styles.providerTabActive]} onPress={() => setNewAgentConfig({...newAgentConfig, agentProvider: p as any})}><Text style={styles.providerTabText}>{p.toUpperCase()}</Text></TouchableOpacity>))}</View><Text style={styles.inputLabel}>API Key</Text><TextInput style={styles.input} value={newAgentConfig.apiKey} secureTextEntry onChangeText={text => setNewAgentConfig({...newAgentConfig, apiKey: text})} placeholder="Global key fallback" placeholderTextColor="#475569" /></View>}
            {wizardStep === 3 && <View style={styles.wizardBody}><Text style={styles.inputLabel}>Skills</Text><ScrollView style={{ height: 250 }}>{allSkills.map(s => (<TouchableOpacity key={s.id} style={[styles.selectableItem, newAgentConfig.skills?.includes(s.id) && styles.selectedItem]} onPress={() => { const sk = newAgentConfig.skills || []; setNewAgentConfig({...newAgentConfig, skills: sk.includes(s.id) ? sk.filter(i=>i!==s.id) : [...sk, s.id]}); }}><Ionicons name={newAgentConfig.skills?.includes(s.id) ? "checkbox" : "square-outline"} size={20} color="#6366f1" /><Text style={styles.selectableText}>{s.name}</Text></TouchableOpacity>))}</ScrollView></View>}
            {wizardStep === 4 && <View style={styles.wizardBody}><Text style={styles.inputLabel}>System Prompt</Text><TextInput style={[styles.input, { height: 150 }]} value={newAgentConfig.systemPrompt} onChangeText={text => setNewAgentConfig({...newAgentConfig, systemPrompt: text})} multiline /><Text style={styles.inputLabel}>Prioritate (1-10)</Text><View style={styles.row}>{[1,3,5,8,10].map(p => (<TouchableOpacity key={p} style={[styles.priorityBtn, newAgentConfig.priority === p && styles.priorityBtnActive]} onPress={() => setNewAgentConfig({...newAgentConfig, priority: p})}><Text style={styles.priorityBtnText}>{p}</Text></TouchableOpacity>))}</View></View>}
            {wizardStep === 5 && <View style={styles.wizardBody}><Text style={styles.reviewTitle}>Finalizare</Text><Text style={styles.reviewText}>Nume: {newAgentConfig.name}</Text><Text style={styles.reviewText}>Skills: {newAgentConfig.skills?.length}</Text><Text style={styles.reviewText}>Prioritate: {newAgentConfig.priority}</Text><View style={styles.spacer} /><TouchableOpacity style={styles.finalizeBtn} onPress={handleCreateAgent}><Text style={styles.finalizeBtnText}>Salvează Agent</Text></TouchableOpacity></View>}
            <View style={styles.wizardFooter}><TouchableOpacity onPress={() => wizardStep > 1 && setWizardStep(wizardStep - 1)} disabled={wizardStep === 1}><Text style={styles.wizardBtnText}>Inapoi</Text></TouchableOpacity><TouchableOpacity onPress={() => setIsWizardVisible(false)}><Text style={styles.closeWizardText}>Anulează</Text></TouchableOpacity>{wizardStep < 5 && <TouchableOpacity onPress={() => setWizardStep(wizardStep + 1)}><Text style={styles.wizardBtnText}>Inainte</Text></TouchableOpacity>}</View>
          </View>
        </View>
      </Modal>

      {/* Skill Editor */}
      <Modal visible={isSkillEditorVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.wizardContent}>
            <Text style={styles.modalTitle}>{editingSkill.id ? 'Editare Skill' : 'Skill Nou'}</Text>
            <ScrollView>
              <Text style={styles.inputLabel}>Nume Skill</Text>
              <TextInput style={styles.input} value={editingSkill.name} onChangeText={t => setEditingSkill({...editingSkill, name: t})} />
              <Text style={styles.inputLabel}>System Prompt Expert</Text>
              <TextInput style={[styles.input, { height: 150 }]} value={editingSkill.systemPrompt} onChangeText={t => setEditingSkill({...editingSkill, systemPrompt: t})} multiline />
              <Text style={styles.inputLabel}>Cuvinte Cheie (trigger words)</Text>
              <TextInput style={styles.input} value={editingSkill.triggers?.join(', ')} onChangeText={t => setEditingSkill({...editingSkill, triggers: t.split(',').map(x=>x.trim())})} placeholder="js, react, frontend..." placeholderTextColor="#475569" />
              <Text style={styles.inputLabel}>Categorie</Text>
              <View style={styles.row}>{['coding', 'research', 'writing', 'custom'].map(c => (<TouchableOpacity key={c} style={[styles.providerTab, editingSkill.category === c && styles.providerTabActive]} onPress={() => setEditingSkill({...editingSkill, category: c as any})}><Text style={styles.providerTabText}>{c.toUpperCase()}</Text></TouchableOpacity>))}</View>
              <TouchableOpacity style={styles.finalizeBtn} onPress={handleSaveSkill}><Text style={styles.finalizeBtnText}>Salvează Skill</Text></TouchableOpacity>
              {editingSkill.id && editingSkill.id.startsWith('skill_custom_') && (
                <TouchableOpacity style={[styles.finalizeBtn, { backgroundColor: '#ef4444', marginTop: 10 }]} onPress={async () => { await deleteSkill(editingSkill.id!); await refreshSkills(); setIsSkillEditorVisible(false); }}><Text style={styles.finalizeBtnText}>Șterge Skill</Text></TouchableOpacity>
              )}
              <TouchableOpacity style={styles.closeBtn} onPress={() => setIsSkillEditorVisible(false)}><Text style={styles.closeBtnText}>Anulează</Text></TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sandbox */}
      <Modal visible={isSandboxVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.sandboxContent}>
            <View style={styles.sandboxHeader}><Ionicons name="flask" size={24} color="#6366f1" /><Text style={styles.sandboxTitle}>{sandboxAgent?.name}</Text><TouchableOpacity onPress={() => setIsSandboxVisible(false)}><Ionicons name="close" size={28} color="#94a3b8" /></TouchableOpacity></View>
            <ScrollView style={styles.sandboxOutput}>{sandboxResponse ? <Text style={styles.responseText}>{sandboxResponse}</Text> : <Text style={styles.placeholderText}>Test Sandbox</Text>}{isSandboxThinking && <ActivityIndicator color="#6366f1" />}</ScrollView>
            <View style={styles.sandboxInputRow}><TextInput style={styles.sandboxInput} value={sandboxMessage} onChangeText={setSandboxMessage} placeholder="Test message..." placeholderTextColor="#475569" /><TouchableOpacity style={styles.sendBtn} onPress={handleTestAgent}><Ionicons name="send" size={20} color="#fff" /></TouchableOpacity></View>
            {sandboxResponse && <TouchableOpacity style={styles.pushToChatBtn} onPress={() => { sendMessage(`[Sandbox]: ${sandboxResponse}`); setIsSandboxVisible(false); }}><Text style={styles.pushToChatText}>Trimite la Chat</Text></TouchableOpacity>}
          </View>
        </View>
      </Modal>

      {/* Logs */}
      <Modal visible={isLogsVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.logsContent}>
            <Text style={styles.modalTitle}>Logs</Text>
            <FlatList data={currentLogs} renderItem={({ item }) => (<View style={styles.logItem}><Text style={styles.logTime}>{new Date(item.timestamp).toLocaleTimeString()}</Text><Text style={styles.logMsg}>{item.message}</Text><Text style={styles.logResp} numberOfLines={2}>{item.response}</Text></View>)} />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsLogsVisible(false)}><Text style={styles.closeBtnText}>Inchide</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function NodeCard({ node, onFinalizePosition, onPress, onConfig, onRun, onDelete, isSelected, onDragStart, onDragEnd, isActive, priority }: any) {
  const pan = useRef(new Animated.ValueXY({ x: node.x, y: node.y })).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => { if (isSelected || isActive) { Animated.loop(Animated.sequence([Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: false }), Animated.timing(glowAnim, { toValue: 0, duration: 1000, useNativeDriver: false })])).start(); } else { glowAnim.setValue(0); } }, [isSelected, isActive]);
  useEffect(() => { pan.setValue({ x: node.x, y: node.y }); }, [node.x, node.y]);
  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 2 || Math.abs(gs.dy) > 2,
    onPanResponderGrant: () => { pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value }); pan.setValue({ x: 0, y: 0 }); onDragStart(); },
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderRelease: () => { pan.flattenOffset(); onDragEnd(); onFinalizePosition(node.id, (pan.x as any)._value, (pan.y as any)._value); },
  })).current;
  const borderColor = glowAnim.interpolate({ inputRange: [0, 1], outputRange: ['#334155', isActive ? '#10b981' : CATEGORY_COLORS[node.type]] });
  return (
    <Animated.View style={[styles.node, { position: 'absolute', left: pan.x, top: pan.y, borderLeftColor: CATEGORY_COLORS[node.type], borderColor: (isSelected || isActive) ? borderColor : '#334155', borderWidth: (isSelected || isActive) ? 2 : 1 }]} {...panResponder.panHandlers}>
      <View style={styles.nodeHeader}><Ionicons name={CATEGORY_ICONS[node.type] as any} size={20} color={CATEGORY_COLORS[node.type]} /><View style={styles.nodeActions}><TouchableOpacity onPress={onRun} style={styles.nodeMiniBtn}><Ionicons name="play" size={12} color="#fff" /></TouchableOpacity><TouchableOpacity onPress={onConfig} style={styles.nodeMiniBtn}><Ionicons name="settings" size={12} color="#fff" /></TouchableOpacity><TouchableOpacity onPress={onDelete} style={styles.nodeMiniBtn}><Ionicons name="close" size={12} color="#ef4444" /></TouchableOpacity></View></View>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}><Text style={styles.nodeTitle} numberOfLines={1}>{node.title}</Text><Text style={styles.nodeType}>{node.type}</Text></TouchableOpacity>
      {priority && <View style={styles.priorityBadge}><Text style={styles.priorityText}>P{priority}</Text></View>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { height: 60, backgroundColor: '#1e293b', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#334155' },
  tabSwitcher: { flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 10, padding: 4 },
  tabBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 8 },
  tabBtnActive: { backgroundColor: '#334155' },
  tabBtnText: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold' },
  tabBtnTextActive: { color: '#fff' },
  templatesBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6366f1', padding: 8, borderRadius: 8 },
  templatesBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
  canvas: { width: CANVAS_SIZE, height: CANVAS_SIZE, backgroundColor: '#0f172a' },
  node: { width: NODE_WIDTH, padding: 10, backgroundColor: '#1e293b', borderRadius: 10, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  nodeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  nodeActions: { flexDirection: 'row' },
  nodeMiniBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
  nodeTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  nodeType: { color: '#94a3b8', fontSize: 9, textTransform: 'uppercase' },
  priorityBadge: { position: 'absolute', bottom: -6, right: -6, backgroundColor: '#f59e0b', borderRadius: 6, paddingHorizontal: 4, paddingVertical: 1 },
  priorityText: { color: '#fff', fontSize: 8, fontWeight: 'bold' },
  dashboard: { flex: 1, padding: 16 },
  dashboardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  dashboardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  addSkillBtn: { backgroundColor: '#10b981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addSkillBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  agentCard: { backgroundColor: '#1e293b', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  agentCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  agentCardName: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  agentCardMeta: { color: '#94a3b8', fontSize: 10, marginTop: 2 },
  skillChips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  skillChipSmall: { backgroundColor: '#334155', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, marginRight: 5, marginBottom: 5 },
  skillChipTextSmall: { color: '#fff', fontSize: 9 },
  agentCardActions: { flexDirection: 'row', marginTop: 12, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 10, alignItems: 'center' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#334155', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, marginRight: 6 },
  actionBtnText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 3 },
  priorityControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', borderRadius: 6, padding: 2 },
  fab: { position: 'absolute', bottom: 30, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', elevation: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1e293b', borderRadius: 20, padding: 20, maxHeight: '80%' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  nodeTypeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  typeBtn: { width: '48%', backgroundColor: '#0f172a', padding: 14, borderRadius: 10, borderLeftWidth: 4, marginBottom: 10, alignItems: 'center' },
  typeBtnText: { color: '#fff', marginTop: 6, fontWeight: 'bold', fontSize: 12 },
  sectionLabel: { color: '#94a3b8', fontSize: 13, fontWeight: 'bold', marginTop: 16, marginBottom: 10 },
  templateScroll: { flexDirection: 'row' },
  templateCard: { backgroundColor: '#0f172a', padding: 10, borderRadius: 10, width: 130, marginRight: 8, borderWidth: 1, borderColor: '#334155' },
  templateName: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  templateDesc: { color: '#94a3b8', fontSize: 9, marginTop: 4 },
  closeBtn: { marginTop: 16, alignItems: 'center' },
  closeBtnText: { color: '#94a3b8', fontWeight: 'bold', fontSize: 13 },
  wizardContent: { backgroundColor: '#1e293b', borderRadius: 20, padding: 20, maxHeight: '85%' },
  wizardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  wizardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  wizardStep: { color: '#6366f1', fontSize: 11, fontWeight: 'bold' },
  wizardBody: { flex: 0, marginBottom: 10 },
  inputLabel: { color: '#94a3b8', fontSize: 12, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#0f172a', borderRadius: 10, padding: 10, color: '#fff', borderWidth: 1, borderColor: '#334155', fontSize: 13 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  providerTab: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#0f172a', marginRight: 6, marginBottom: 6 },
  providerTabActive: { backgroundColor: '#6366f1' },
  providerTabText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  selectableItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', padding: 10, borderRadius: 10, marginBottom: 6 },
  selectedItem: { borderColor: '#6366f1', borderWidth: 1 },
  selectableText: { color: '#fff', marginLeft: 8, fontSize: 13 },
  priorityBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  priorityBtnActive: { backgroundColor: '#f59e0b' },
  priorityBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  reviewTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  reviewText: { color: '#94a3b8', fontSize: 13, marginBottom: 4 },
  spacer: { height: 20 },
  finalizeBtn: { backgroundColor: '#10b981', padding: 14, borderRadius: 10, alignItems: 'center' },
  finalizeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  wizardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  wizardBtnText: { color: '#6366f1', fontWeight: 'bold', fontSize: 13 },
  closeWizardText: { color: '#ef4444', fontWeight: 'bold', fontSize: 13 },
  sandboxContent: { backgroundColor: '#1e293b', borderRadius: 20, padding: 20, flex: 0.9 },
  sandboxHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sandboxTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', flex: 1, marginLeft: 10 },
  sandboxOutput: { flex: 1, backgroundColor: '#0f172a', borderRadius: 12, padding: 12, marginBottom: 12 },
  responseText: { color: '#fff', fontSize: 13, lineHeight: 18 },
  placeholderText: { color: '#475569', textAlign: 'center', marginTop: 30, fontSize: 12 },
  sandboxInputRow: { flexDirection: 'row', alignItems: 'center' },
  sandboxInput: { flex: 1, backgroundColor: '#0f172a', borderRadius: 10, padding: 10, color: '#fff', marginRight: 8, fontSize: 13 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
  pushToChatBtn: { marginTop: 12, backgroundColor: '#334155', padding: 10, borderRadius: 10, alignItems: 'center' },
  pushToChatText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  logsContent: { backgroundColor: '#1e293b', borderRadius: 20, padding: 20, maxHeight: '80%' },
  logItem: { padding: 10, backgroundColor: '#0f172a', borderRadius: 10, marginBottom: 8 },
  logTime: { color: '#6366f1', fontSize: 9, marginBottom: 2 },
  logMsg: { color: '#94a3b8', fontSize: 11, fontStyle: 'italic' },
  logResp: { color: '#fff', fontSize: 12, marginTop: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#475569', fontSize: 12 },
});
