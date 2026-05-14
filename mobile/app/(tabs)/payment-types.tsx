import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, FlatList } from 'react-native';
import { Text, Card, Button, TextInput, FAB, Dialog, Portal, Chip, ActivityIndicator } from 'react-native-paper';
import api from '../../services/api';
import { PaymentType } from '../../types';

export default function PaymentTypeManagement() {
  const [types, setTypes] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', amount: '', frequency: 'monthly' });

  const FREQUENCIES = [
    { value: 'monthly', label: '📅 Bulanan' },
    { value: 'yearly', label: '📆 Tahunan' },
    { value: 'once', label: '1️⃣ Sekali' },
  ];

  const fetchTypes = async () => {
    try {
      const { data } = await api.get('/payment-types');
      setTypes(data.paymentTypes);
    } catch (e) {
      Alert.alert('Error', 'Gagal memuat jenis iuran');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTypes(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', amount: '', frequency: 'monthly' });
    setDialogVisible(true);
  };

  const openEdit = (item: PaymentType) => {
    setEditingId(item.id);
    setForm({ name: item.name, amount: item.amount.toString(), frequency: item.frequency });
    setDialogVisible(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.amount) {
      Alert.alert('Error', 'Nama dan nominal wajib diisi');
      return;
    }
    setSaving(true);
    try {
      const payload = { name: form.name, amount: parseFloat(form.amount), frequency: form.frequency };
      if (editingId) {
        await api.put(`/payment-types/${editingId}`, payload);
      } else {
        await api.post('/payment-types', payload);
      }
      setDialogVisible(false);
      fetchTypes();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert('Hapus', `Hapus jenis iuran "${name}"?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/payment-types/${id}`);
          fetchTypes();
        } catch (e: any) {
          Alert.alert('Error', e.response?.data?.message || 'Gagal menghapus');
        }
      }},
    ]);
  };

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={types}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Belum ada jenis iuran</Text>}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.name}</Text>
                  <Text variant="headlineSmall" style={{ color: '#4CAF50', marginTop: 4 }}>
                    {formatRupiah(Number(item.amount))}
                  </Text>
                  <Text variant="bodySmall" style={{ color: '#888', marginTop: 2 }}>
                    {FREQUENCIES.find(f => f.value === item.frequency)?.label}
                  </Text>
                </View>
                <View style={{ gap: 6, alignItems: 'flex-end' }}>
                  <Chip
                    style={{ backgroundColor: item.isActive ? '#E8F5E9' : '#FFEBEE' }}
                    textStyle={{ color: item.isActive ? '#2E7D32' : '#C62828', fontSize: 11 }}>
                    {item.isActive ? 'Aktif' : 'Nonaktif'}
                  </Chip>
                  <Button compact mode="outlined" onPress={() => openEdit(item)}>Edit</Button>
                  <Button compact mode="outlined" textColor="#F44336" onPress={() => handleDelete(item.id, item.name)}>Hapus</Button>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>{editingId ? 'Edit Jenis Iuran' : 'Tambah Jenis Iuran'}</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Nama Iuran *" value={form.name}
              onChangeText={(v) => setForm(p => ({ ...p, name: v }))} mode="outlined" style={styles.input} />
            <TextInput label="Nominal (Rp) *" value={form.amount}
              onChangeText={(v) => setForm(p => ({ ...p, amount: v }))}
              mode="outlined" keyboardType="numeric" style={styles.input} />
            <Text variant="bodyMedium" style={{ marginBottom: 8 }}>Frekuensi:</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {FREQUENCIES.map(f => (
                <Chip key={f.value} selected={form.frequency === f.value}
                  onPress={() => setForm(p => ({ ...p, frequency: f.value }))}>
                  {f.label}
                </Chip>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Batal</Button>
            <Button onPress={handleSave} loading={saving} mode="contained">Simpan</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB icon="plus" label="Jenis Iuran" style={styles.fab} onPress={openCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 12, gap: 8, paddingBottom: 88 },
  card: { elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  input: { marginBottom: 12 },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
