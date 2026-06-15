import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import api from '../../services/api';

export default function CreateForumPostScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('umum');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Judul dan isi diskusi wajib diisi');
      return;
    }
    setLoading(true);
    try {
      await api.post('/forum', { title: title.trim(), content: content.trim(), category });
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Gagal membuat diskusi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="titleMedium" style={styles.sectionLabel}>Kategori</Text>
      <SegmentedButtons
        value={category}
        onValueChange={setCategory}
        buttons={[
          { value: 'umum', label: 'Umum' },
          { value: 'pertanyaan', label: 'Pertanyaan' },
          { value: 'saran', label: 'Saran' },
        ]}
        style={styles.segmented}
      />

      <TextInput
        mode="outlined"
        label="Judul"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        maxLength={200}
      />

      <TextInput
        mode="outlined"
        label="Isi Diskusi"
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={8}
        style={[styles.input, styles.contentInput]}
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={styles.submitBtn}
        contentStyle={{ height: 48 }}
      >
        Buat Diskusi
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16 },
  sectionLabel: { marginBottom: 8, color: '#333' },
  segmented: { marginBottom: 16 },
  input: { marginBottom: 16, backgroundColor: '#fff' },
  contentInput: { minHeight: 160 },
  submitBtn: { backgroundColor: '#6200ee', marginTop: 8 },
});
