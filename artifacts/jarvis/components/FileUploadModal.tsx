
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { readAsStringAsync } from 'expo-file-system/legacy';
import Colors from '@/constants/colors';
import { LearnedDocument } from '@/engine/brain';

const { colors } = Colors;

interface Props {
  visible: boolean;
  documents: LearnedDocument[];
  onClose: () => void;
  onAddDocument: (name: string, content: string) => Promise<void>;
  onRemoveDocument: (id: string) => void;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function FileUploadModal({
  visible, documents, onClose, onAddDocument, onRemoveDocument,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const pickFile = async () => {
    try {
      setStatus('');
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'text/markdown', 'text/csv', 'application/json', '*/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];
      const name = asset.name || 'Document';
      const uri = asset.uri;

      setLoading(true);
      setStatus('Citesc fișierul...');

      let content = '';

      if (Platform.OS === 'web') {
        // Web: citim via fetch
        const response = await fetch(uri);
        content = await response.text();
      } else {
        // Native: citim via FileSystem
        content = await readAsStringAsync(uri);
      }

      if (!content || content.trim().length === 0) {
        setStatus('Fișierul este gol!');
        setLoading(false);
        return;
      }

      if (content.length > 50000) {
        content = content.slice(0, 50000);
        setStatus('Fișier mare — am luat primele 50.000 caractere.');
      }

      setStatus('Jarvis studiază documentul...');
      await onAddDocument(name, content);
      setStatus('');
      setLoading(false);
    } catch (err: unknown) {
      setLoading(false);
      setStatus('Eroare la citirea fișierului. Încearcă un fișier .txt');
    }
  };

  const confirmRemove = (doc: LearnedDocument) => {
    Alert.alert(
      'Șterge document',
      `Ștergi "${doc.name}" din memoria mea?`,
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: () => onRemoveDocument(doc.id),
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Documente studiate</Text>
            <Text style={styles.subtitle}>{documents.length} fișier{documents.length !== 1 ? 'e' : ''} în memorie</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Upload button */}
        <TouchableOpacity
          style={[styles.uploadBtn, loading && styles.uploadBtnDisabled]}
          onPress={pickFile}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Feather name="upload" size={20} color="#fff" />
          )}
          <Text style={styles.uploadText}>
            {loading ? status || 'Se procesează...' : 'Alege un fișier (.txt, .md, .csv, .json)'}
          </Text>
        </TouchableOpacity>

        {status !== '' && !loading && (
          <Text style={styles.statusText}>{status}</Text>
        )}

        {/* Info box */}
        <View style={styles.infoBox}>
          <Feather name="info" size={14} color={colors.primary} />
          <Text style={styles.infoText}>
            Jarvis citește fișierele text și le reține complet. Poți întreba orice despre conținutul lor!
          </Text>
        </View>

        {/* Lista documente */}
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {documents.length === 0 ? (
            <View style={styles.empty}>
              <Feather name="file-text" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Niciun document</Text>
              <Text style={styles.emptyText}>
                Trimite-mi fișiere text și voi putea răspunde la întrebări despre ele.
              </Text>
            </View>
          ) : (
            documents.map(doc => (
              <View key={doc.id} style={styles.docCard}>
                <View style={styles.docIcon}>
                  <Feather name="file-text" size={20} color={colors.primary} />
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                  <Text style={styles.docMeta}>
                    {doc.wordCount.toLocaleString()} cuvinte • {formatDate(doc.addedAt)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => confirmRemove(doc)}
                  style={styles.deleteBtn}
                >
                  <Feather name="trash-2" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
    marginTop: 2,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 16,
    margin: 16,
    gap: 10,
  },
  uploadBtnDisabled: {
    opacity: 0.6,
  },
  uploadText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  statusText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: -8,
    marginBottom: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.glow,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.2)',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.glow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.2)',
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text,
  },
  docMeta: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
  },
});
