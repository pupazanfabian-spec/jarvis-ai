
import { Tabs } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarStyle: { 
        backgroundColor: '#111827',
        borderTopColor: '#1e293b',
        height: 60,
        paddingBottom: 8,
      },
      tabBarActiveTintColor: '#6366f1',
      tabBarInactiveTintColor: '#94a3b8',
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="code-studio" 
        options={{ 
          title: "Studio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="code-slash-outline" size={size} color={color} />
          ),
        }} 
      />
    </Tabs>
  );
}
