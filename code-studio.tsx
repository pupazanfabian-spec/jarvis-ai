import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const CodeStudioScreen = () => {
  const [activeTab, setActiveTab] = useState('agents');

  const tabs = [
    { id: 'agents', title: 'Agents', color: '#6366f1' },
    { id: 'skills', title: 'Skills', color: '#6366f1' },
    { id: 'tools', title: 'Tools', color: '#6366f1' },
    { id: 'projects', title: 'Projects', color: '#6366f1' }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Code Studio</Text>
        <View style={styles.tabBar}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && { borderBottomColor: tab.color }
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={styles.tabText}>{tab.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.content}>
        {activeTab === 'agents' && <AgentsTab />}
        {activeTab === 'skills' && <SkillsTab />}
        {activeTab === 'tools' && <ToolsTab />}
        {activeTab === 'projects' && <ProjectsTab />}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    padding: 16
  },
  header: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold'
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1e212d'
  },
  tabText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    padding: 16
  }
});

const AgentsTab = () => (
  <View style={styles.content}>
    <Text>Agents Tab Content</Text>
  </View>
);

const SkillsTab = () => (
  <View style={styles.content}>
    <Text>Skills Tab Content</Text>
  </View>
);

const ToolsTab = () => (
  <View style={styles.content}>
    <Text>Tools Tab Content</Text>
  </View>
);

const ProjectsTab = () => (
  <View style={styles.content}>
    <Text>Projects Tab Content</Text>
  </View>
};

export default CodeStudioScreen;
