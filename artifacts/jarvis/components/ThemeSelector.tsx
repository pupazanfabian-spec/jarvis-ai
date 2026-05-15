import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors, { THEMES, saveTheme, ThemeName, useTheme } from '@/constants/colors';

const { colors } = Colors;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ThemeSelector({ visible, onClose }: Props) {
  const { theme } = useTheme();

  const handleSelectTheme = async (name: ThemeName) => {
    await saveTheme(name);
    Alert.alert('Tema schimbată', 'Restartează aplicația pentru a aplica complet modificările.');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Selectează HUD</Text>
          <TouchableOpacity onPress={onClose}><Feather name="x" size={24} color={colors.textSecondary} /></TouchableOpacity>
        </View>
        <View style={styles.grid}>
          {(Object.keys(THEMES) as ThemeName[]).map((name) => (
            <TouchableOpacity 
              key={name} 
              style={[styles.card, theme === name && styles.activeCard]} 
              onPress={() => handleSelectTheme(name)}
            >
              <View style={[styles.preview, { backgroundColor: THEMES[name].background }]}>
                <View style={[styles.ring, { borderColor: THEMES[name].primary }]} />
              </View>
              <Text style={styles.name}>{name.toUpperCase()}</Text>
              <View style={styles.chips}>
                <View style={[styles.chip, { backgroundColor: THEMES[name].primary }]} />
                <View style={[styles.chip, { backgroundColor: THEMES[name].accent }]} />
                <View style={[styles.chip, { backgroundColor: THEMES[name].textMuted }]} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontFamily: 'Inter_700Bold', color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', padding: 12, borderRadius: 12, backgroundColor: colors.surfaceElevated, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  activeCard: { borderColor: colors.primary },
  preview: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  ring: { width: 40, height: 40, borderRadius: 20, borderWidth: 3 },
  name: { color: colors.text, fontFamily: 'Inter_600SemiBold', marginBottom: 8 },
  chips: { flexDirection: 'row', gap: 4 },
  chip: { width: 12, height: 12, borderRadius: 6 },
});
