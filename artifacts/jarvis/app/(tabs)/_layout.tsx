
import { Tabs } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import JarvisIcon from "@/components/JarvisIcon";
import StudioIcon from "@/components/StudioIcon";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarStyle: { 
        backgroundColor: '#111827',
        borderTopColor: '#1e293b',
        height: 72,
        paddingBottom: 16,
      },
      tabBarActiveTintColor: '#6366f1',
      tabBarInactiveTintColor: '#94a3b8',
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: "Chat",
          tabBarIcon: ({ focused, color, size }) => (
            <JarvisIcon focused={focused} color={color} size={size} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="dashboard" 
        options={{ 
          title: "Stats",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="code-studio" 
        options={{ 
          title: "Studio",
          tabBarIcon: ({ focused, color, size }) => (
            <StudioIcon focused={focused} color={color} size={size} />
          ),
        }} 
      />
    </Tabs>
  );
}
