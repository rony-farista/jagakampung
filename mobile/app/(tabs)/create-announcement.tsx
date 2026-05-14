import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, TextInput, FAB, Dialog, Portal, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function CreateAnnouncementScreen() {
  const { user } = useAuth();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', isPinned: false });

  const handleSave = async () => {
    if (!form.title || !form.content) {
      Alert.alert('Error', 'Judul dan isi pengumuman wajib diisi');
      return;
    }
    setSaving(true);
    try {
      await api.post('/announcements', form);
      setDialogVisible(false);
      setForm({ title: '', content: '', isPinned: false });
      Alert.alert('Berhasil', 'Pengumuman berhasil dipublikasikan');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  if (user?.role === 'USER') {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#999' }}>Hanya Admin/Bendahara yang dapat membuat pengumuman</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}
          style={{ maxHeight: '80%' }}>
          <Dialog.Title>Buat Pengumuman</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              <View style={{ padding: 8 }}>
                <TextInput label="Judul *" value={form.title}
                  onChangeText={(v) => setForm(p => ({ ...p, title: v }))}
                  mode="outlined" style={styles.input} />
                <TextInput label="Isi Pengumuman *" value={form.content}
                  onChangeText={(v) => setForm(p => ({ ...p, content: v }))}
                  mode="outlined" multiline numberOfLines={5} style={styles.input} />
                <Button
                  mode={form.isPinned ? 'contained' : 'outlined'}
                  icon={form.isPinned ? 'pin' : 'pin-outline'}
                  onPress={() => setForm(p => ({ ...p, isPinned: !p.isPinned }))}>
                  {form.isPinned ? '📌 Dipinned' : 'Pin Pengumuman'}
                </Button>
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Batal</Button>
            <Button onPress={handleSave} loading={saving} mode="contained">Publikasikan</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <FAB icon="plus" label="Buat Pengumuman" style={styles.fab} onPress={() => setDialogVisible(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  input: { marginBottom: 12 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
