import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import api from '../../services/api';

const CATEGORIES = [
  { label: 'Umum', value: 'umum' },
  { label: 'Pertanyaan', value: 'pertanyaan' },
  { label: 'Saran', value: 'saran' },
];

const CATEGORY_COLORS: Record<string, string> = {
  umum: '#2196F3',
  pertanyaan: '#FF9800',
  saran: '#4CAF50',
};

export default function CreateForumPostScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('umum');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Peringatan', 'Judul dan isi diskusi wajib diisi');
      return;
    }

    setLoading(true);
    try {
      await api.post('/forum', { title: title.trim(), content: content.trim(), category });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Gagal membuat diskusi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>Judul Diskusi</Text>
        <TextInput
          mode="outlined"
          placeholder="Masukkan judul diskusi..."
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          maxLength={200}
          outlineColor="#ddd"
          activeOutlineColor="#6200ee"
        />

        <Text style={styles.sectionLabel}>Isi Diskusi</Text>
        <TextInput
          mode="outlined"
          placeholder="Tulis isi diskusi di sini..."
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={6}
          style={[styles.input, styles.contentInput]}
          outlineColor="#ddd"
          activeOutlineColor="#6200ee"
        />

        <Text style={styles.sectionLabel}>Kategori</Text>
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => {
            const selected = category === cat.value;
            const color = CATEGORY_COLORS[cat.value];
            return (
              <TouchableOpacity
                key={cat.value}
                onPress={() => setCategory(cat.value)}
                style={[
                  styles.categoryBtn,
                  selected
                    ? { backgroundColor: color, borderColor: color }
                    : { backgroundColor: '#fff', borderColor: '#ddd' },
                ]}
              >
                <Text style={[styles.categoryBtnText, selected && { color: '#fff' }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={loading}
          style={styles.submitBtn}
          contentStyle={styles.submitBtnContent}
          buttonColor="#6200ee"
        >
          {loading ? <ActivityIndicator size="small" color="#fff" /> : 'Posting Diskusi'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
    marginTop: 12,
  },
  input: { backgroundColor: '#fff', marginBottom: 4 },
  contentInput: { minHeight: 140 },
  categoryRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  categoryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  categoryBtnText: { fontSize: 14, fontWeight: '600', color: '#555' },
  submitBtn: { marginTop: 8, borderRadius: 8 },
  submitBtnContent: { height: 48 },
});
