import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/colors';

const { colors } = Colors;

interface SurveyOption {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  message: string;
}

const OPTIONS: SurveyOption[] = [
  { label: 'Caută online', icon: 'search', color: colors.accent, message: 'Caută online despre asta' },
  { label: 'Explică conceptul', icon: 'book-open', color: colors.primary, message: 'Explică-mi conceptul mai în detaliu' },
  { label: 'Exemple practice', icon: 'zap', color: colors.success, message: 'Dă-mi câteva exemple practice' },
  { label: 'Altceva', icon: 'help-circle', color: colors.textSecondary, message: 'Vreau să te întreb altceva mai specific' },
];

interface Props {
  onSelect: (message: string) => void;
}

export default function SurveyBubble({ onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nu sunt sigur ce vrei să spui. Ce ai nevoie?</Text>
      <View style={styles.optionsContainer}>
        {OPTIONS.map((opt, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.button, { borderColor: opt.color + '44' }]}
            onPress={() => onSelect(opt.message)}
            activeOpacity={0.7}
          >
            <Feather name={opt.icon} size={18} color={opt.color} />
            <Text style={[styles.buttonText, { color: opt.color }]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    minHeight: 48,
  },
  buttonText: {
    marginLeft: 12,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
});
