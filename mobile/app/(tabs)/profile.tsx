import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Avatar, Chip, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put(`/users/${user?.id}`, form);
      await refreshUser();
      setEditing(false);
      Alert.alert('Berhasil', 'Profil berhasil diperbarui');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive', onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        }
      },
    ]);
  };

  const roleLabel = user?.role === 'ADMIN' ? '🛡️ Admin' :
    user?.role === 'BENDAHARA' ? '💼 Bendahara' : '👤 Warga';

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Avatar.Text size={72} label={(user?.name || 'U').substring(0, 2).toUpperCase()}
          style={{ backgroundColor: '#fff' }} color="#6200ee" />
        <Text variant="headlineSmall" style={styles.headerName}>{user?.name}</Text>
        <Chip style={styles.roleChip} textStyle={{ color: '#fff' }}>{roleLabel}</Chip>
      </View>

      {/* Info Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.rowBetween}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Informasi Pribadi</Text>
            <Button mode="text" compact onPress={() => setEditing(!editing)}>
              {editing ? 'Batal' : 'Edit'}
            </Button>
          </View>
          <Divider style={{ marginVertical: 12 }} />

          {editing ? (
            <>
              <TextInput label="Nama Lengkap" value={form.name}
                onChangeText={(v) => setForm(p => ({ ...p, name: v }))}
                mode="outlined" style={styles.input} />
              <TextInput label="No. HP" value={form.phone}
                onChangeText={(v) => setForm(p => ({ ...p, phone: v }))}
                mode="outlined" keyboardType="phone-pad" style={styles.input} />
              <TextInput label="Alamat" value={form.address}
                onChangeText={(v) => setForm(p => ({ ...p, address: v }))}
                mode="outlined" multiline numberOfLines={2} style={styles.input} />
              <Button mode="contained" onPress={handleSave} loading={loading} style={styles.saveBtn}>
                Simpan Perubahan
              </Button>
            </>
          ) : (
            <>
              <InfoRow icon="📧" label="Email" value={user?.email} />
              <InfoRow icon="📱" label="No. HP" value={user?.phone || '-'} />
              <InfoRow icon="🪪" label="NIK" value={user?.nik || '-'} />
              <InfoRow icon="🏠" label="Alamat" value={user?.address || '-'} />
              <InfoRow icon="✅" label="Status" value={user?.isActive ? 'Aktif' : 'Nonaktif'} />
            </>
          )}
        </Card.Content>
      </Card>

      {/* Logout */}
      <Button mode="outlined" onPress={handleLogout} style={styles.logoutBtn}
        textColor="#F44336" icon="logout">
        Logout
      </Button>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value?: string }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text variant="bodySmall" style={{ color: '#888' }}>{icon} {label}</Text>
      <Text variant="bodyMedium" style={{ marginTop: 2 }}>{value || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#6200ee', alignItems: 'center', padding: 28, gap: 8 },
  headerName: { color: '#fff', fontWeight: 'bold', marginTop: 4 },
  roleChip: { backgroundColor: 'rgba(255,255,255,0.2)' },
  card: { margin: 16, elevation: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: { marginBottom: 12 },
  saveBtn: { marginTop: 4 },
  logoutBtn: { margin: 16, marginTop: 0, borderColor: '#F44336' },
});
