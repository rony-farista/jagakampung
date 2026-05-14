import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterScreen() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    nik: '', phone: '', address: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert('Error', 'Nama, email, dan password wajib diisi');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Password tidak cocok');
      return;
    }
    if (form.password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        nik: form.nik || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
      });
      Alert.alert(
        'Registrasi Berhasil',
        'Akun Anda sedang menunggu persetujuan Admin.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error: any) {
      Alert.alert('Registrasi Gagal', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>Daftar Akun</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>RT Warga & Iuran</Text>

          <TextInput label="Nama Lengkap *" value={form.name}
            onChangeText={(v) => handleChange('name', v)} mode="outlined" style={styles.input} />
          <TextInput label="Email *" value={form.email}
            onChangeText={(v) => handleChange('email', v)} mode="outlined"
            keyboardType="email-address" autoCapitalize="none" style={styles.input} />
          <TextInput label="NIK" value={form.nik}
            onChangeText={(v) => handleChange('nik', v)} mode="outlined"
            keyboardType="numeric" style={styles.input} />
          <TextInput label="No. HP" value={form.phone}
            onChangeText={(v) => handleChange('phone', v)} mode="outlined"
            keyboardType="phone-pad" style={styles.input} />
          <TextInput label="Alamat" value={form.address}
            onChangeText={(v) => handleChange('address', v)} mode="outlined"
            multiline numberOfLines={2} style={styles.input} />
          <TextInput label="Password *" value={form.password}
            onChangeText={(v) => handleChange('password', v)} mode="outlined"
            secureTextEntry style={styles.input} />
          <TextInput label="Konfirmasi Password *" value={form.confirmPassword}
            onChangeText={(v) => handleChange('confirmPassword', v)} mode="outlined"
            secureTextEntry style={styles.input} />

          <Button mode="contained" onPress={handleRegister}
            loading={loading} disabled={loading} style={styles.button}>
            Daftar
          </Button>
          <Button mode="text" onPress={() => router.back()} disabled={loading}>
            Sudah punya akun? Login
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 16, backgroundColor: '#f5f5f5' },
  card: { padding: 8 },
  title: { textAlign: 'center', marginBottom: 4 },
  subtitle: { textAlign: 'center', marginBottom: 20, color: '#666' },
  input: { marginBottom: 12 },
  button: { marginVertical: 8 }
});
