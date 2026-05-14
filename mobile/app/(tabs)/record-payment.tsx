import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, TextInput, ActivityIndicator, SegmentedButtons, Menu } from 'react-native-paper';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { User, PaymentType } from '../../types';

const MONTHS = [
  { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' }, { value: 4, label: 'April' },
  { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' }, { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' }, { value: 12, label: 'Desember' },
];

export default function RecordPaymentScreen() {
  const router = useRouter();
  const [residents, setResidents] = useState<User[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userMenuVisible, setUserMenuVisible] = useState(false);
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [monthMenuVisible, setMonthMenuVisible] = useState(false);

  const [form, setForm] = useState({
    userId: '',
    userName: '',
    paymentTypeId: '',
    paymentTypeName: '',
    amount: '',
    month: new Date().getMonth() + 1,
    monthName: MONTHS[new Date().getMonth()].label,
    year: new Date().getFullYear().toString(),
    status: 'paid',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, typesRes] = await Promise.all([
          api.get('/users', { params: { role: 'USER', isActive: true } }),
          api.get('/payment-types', { params: { isActive: true } }),
        ]);
        setResidents(usersRes.data.users);
        setPaymentTypes(typesRes.data.paymentTypes);
      } catch (e) {
        Alert.alert('Error', 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectPaymentType = (type: PaymentType) => {
    setForm(p => ({
      ...p,
      paymentTypeId: type.id.toString(),
      paymentTypeName: type.name,
      amount: type.amount.toString(),
    }));
    setTypeMenuVisible(false);
  };

  const handleSave = async () => {
    if (!form.userId || !form.paymentTypeId || !form.amount) {
      Alert.alert('Error', 'Warga, jenis iuran, dan nominal wajib diisi');
      return;
    }
    setSaving(true);
    try {
      await api.post('/payments', {
        userId: parseInt(form.userId),
        paymentTypeId: parseInt(form.paymentTypeId),
        amount: parseFloat(form.amount),
        month: form.month,
        year: parseInt(form.year),
        paymentDate: new Date().toISOString(),
        status: form.status,
        notes: form.notes || undefined,
      });
      Alert.alert('Berhasil', 'Pembayaran berhasil dicatat', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Title title="Catat Pembayaran Iuran" />
        <Card.Content>

          {/* Pilih Warga */}
          <Text variant="labelLarge" style={styles.label}>Warga *</Text>
          <Menu visible={userMenuVisible} onDismiss={() => setUserMenuVisible(false)}
            anchor={
              <Button mode="outlined" onPress={() => setUserMenuVisible(true)} style={styles.select}>
                {form.userName || 'Pilih Warga...'}
              </Button>
            }>
            {residents.map(r => (
              <Menu.Item key={r.id} title={r.name} leadingIcon="account"
                onPress={() => {
                  setForm(p => ({ ...p, userId: r.id.toString(), userName: r.name }));
                  setUserMenuVisible(false);
                }} />
            ))}
          </Menu>

          {/* Pilih Jenis Iuran */}
          <Text variant="labelLarge" style={styles.label}>Jenis Iuran *</Text>
          <Menu visible={typeMenuVisible} onDismiss={() => setTypeMenuVisible(false)}
            anchor={
              <Button mode="outlined" onPress={() => setTypeMenuVisible(true)} style={styles.select}>
                {form.paymentTypeName || 'Pilih Jenis Iuran...'}
              </Button>
            }>
            {paymentTypes.map(t => (
              <Menu.Item key={t.id} title={t.name} description={`Rp ${Number(t.amount).toLocaleString('id-ID')}`}
                onPress={() => selectPaymentType(t)} />
            ))}
          </Menu>

          {/* Nominal */}
          <TextInput label="Nominal (Rp) *" value={form.amount}
            onChangeText={(v) => setForm(p => ({ ...p, amount: v }))}
            mode="outlined" keyboardType="numeric" style={styles.input} />

          {/* Bulan & Tahun */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 2 }}>
              <Text variant="labelLarge" style={styles.label}>Bulan</Text>
              <Menu visible={monthMenuVisible} onDismiss={() => setMonthMenuVisible(false)}
                anchor={
                  <Button mode="outlined" onPress={() => setMonthMenuVisible(true)} style={styles.select}>
                    {form.monthName}
                  </Button>
                }>
                {MONTHS.map(m => (
                  <Menu.Item key={m.value} title={m.label}
                    onPress={() => {
                      setForm(p => ({ ...p, month: m.value, monthName: m.label }));
                      setMonthMenuVisible(false);
                    }} />
                ))}
              </Menu>
            </View>
            <View style={{ flex: 1 }}>
              <TextInput label="Tahun" value={form.year}
                onChangeText={(v) => setForm(p => ({ ...p, year: v }))}
                mode="outlined" keyboardType="numeric" style={styles.input} />
            </View>
          </View>

          {/* Status */}
          <Text variant="labelLarge" style={styles.label}>Status</Text>
          <SegmentedButtons value={form.status}
            onValueChange={(v) => setForm(p => ({ ...p, status: v }))}
            style={{ marginBottom: 12 }}
            buttons={[
              { value: 'paid', label: '✅ Lunas' },
              { value: 'pending', label: '⏳ Belum' },
            ]} />

          {/* Catatan */}
          <TextInput label="Catatan (opsional)" value={form.notes}
            onChangeText={(v) => setForm(p => ({ ...p, notes: v }))}
            mode="outlined" multiline numberOfLines={2} style={styles.input} />

          <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving} style={{ marginTop: 8 }}>
            Simpan Pembayaran
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  card: { elevation: 2 },
  label: { marginBottom: 4, marginTop: 4 },
  select: { marginBottom: 12, justifyContent: 'flex-start' },
  input: { marginBottom: 12 },
});
