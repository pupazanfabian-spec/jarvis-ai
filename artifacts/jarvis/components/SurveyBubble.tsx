import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
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
  isPermissionOnly?: boolean;
  type?: 'survey' | 'agent_proposal';
  proposalData?: {
    name: string;
    skills: string[];
    reason: string;
    complexity: number;
  };
  onConfirmProposal?: () => void;
}

export default function SurveyBubble({ 
  onSelect, 
  isPermissionOnly = true, 
  type = 'survey',
  proposalData,
  onConfirmProposal
}: Props) {
  const [showOptions, setShowOptions] = useState(!isPermissionOnly);
  const [dismissed, setDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (dismissed) return null;

  const handleNo = () => {
    setDismissed(true);
  };

  const handleYes = () => {
    setShowOptions(true);
  };

  // ─── AGENT PROPOSAL UI ───────────────────────────────────────────────────

  if (type === 'agent_proposal' && proposalData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Feather name="cpu" size={18} color={colors.primary} />
          <Text style={styles.title}>Propunere: Creează Agent Nou</Text>
        </View>
        
        <Text style={styles.proposalText}>
          Vrei să creez un agent specialist numit "**{proposalData.name}**"?
        </Text>

        {showDetails && (
          <View style={styles.detailsBox}>
            <Text style={styles.detailLabel}>Motiv: <Text style={styles.detailValue}>{proposalData.reason}</Text></Text>
            <Text style={styles.detailLabel}>Skills: <Text style={styles.detailValue}>{proposalData.skills.join(', ')}</Text></Text>
            <Text style={styles.detailLabel}>Complexitate detectată: <Text style={styles.detailValue}>{proposalData.complexity}/8</Text></Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
          style={[styles.actionBtn, styles.yesBtn]}
          onPress={() => {
              onConfirmProposal?.();
              setDismissed(true);
              Alert.alert('Succes', '✓ Agent creat. Îl găsești în Studio → Canvas.');
          }}
          activeOpacity={0.7}
          >
          <Text style={styles.yesBtnText}>Da, creează</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.detailsBtn]}
            onPress={() => setShowDetails(!showDetails)}
            activeOpacity={0.7}
          >
            <Text style={styles.detailsBtnText}>{showDetails ? 'Ascunde' : 'Detalii'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.noBtn]}
            onPress={handleNo}
            activeOpacity={0.7}
          >
            <Text style={styles.noBtnText}>Nu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── STANDARD SURVEY UI ──────────────────────────────────────────────────
  if (!showOptions) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Feather name="help-circle" size={18} color={colors.primary} />
          <Text style={styles.title}>Pot să îți pun câteva întrebări pentru a răspunde mai bine?</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.yesBtn]}
            onPress={handleYes}
            activeOpacity={0.7}
          >
            <Text style={styles.yesBtnText}>Da, începe</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.noBtn]}
            onPress={handleNo}
            activeOpacity={0.7}
          >
            <Text style={styles.noBtnText}>Nu, mersi</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cum te pot ajuta mai departe?</Text>
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
    borderRadius: 20,
    padding: 16,
    marginVertical: 10,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'flex-start',
    maxWidth: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    flex: 1,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yesBtn: {
    backgroundColor: colors.primary,
  },
  noBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  yesBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  noBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  proposalText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    marginBottom: 16,
    lineHeight: 20,
  },
  detailsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 4,
  },
  detailLabel: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  detailValue: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
  },
  detailsBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailsBtnText: {
    color: colors.text,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
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
    backgroundColor: 'rgba(255,255,255,0.02)',
    minHeight: 48,
  },
  buttonText: {
    marginLeft: 12,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
});
