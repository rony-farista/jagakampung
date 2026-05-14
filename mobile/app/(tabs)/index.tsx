import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface Stats {
  totalPaid: number;
  totalPaidCount: number;
  totalPending: number;
  totalPendingCount: number;
  totalWarga: number;
  paidWarga: number;
  unpaidWarga: number;
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <Card style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <Card.Content>
        <Text variant="labelMedium" style={{ color: '#666' }}>{label}</Text>
        <Text variant="headlineSmall" style={{ color, fontWeight: 'bold' }}>{value}</Text>
      </Card.Content>
    </Card>
  );
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    if (!user) return; // jangan fetch kalau sudah logout
    try {
      const { data } = await api.get('/payments/stats');
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (user) fetchStats(); else setLoading(false); }, [user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, []);

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.greeting}>Selamat datang,</Text>
        <Text variant="headlineSmall" style={styles.name}>{user?.name} 👋</Text>
        <Text variant="bodyMedium" style={styles.role}>
          {user?.role === 'ADMIN' ? '🛡️ Admin' : user?.role === 'BENDAHARA' ? '💼 Bendahara' : '👤 Warga'}
        </Text>
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>📊 Statistik Bulan Ini</Text>

      {stats && (
        <View style={styles.statsGrid}>
          <StatCard label="Total Iuran Terkumpul" value={formatRupiah(Number(stats.totalPaid))} color="#4CAF50" />
          <StatCard label="Warga Sudah Bayar" value={`${stats.paidWarga} Warga`} color="#2196F3" />
          <StatCard label="Warga Belum Bayar" value={`${stats.unpaidWarga} Warga`} color="#F44336" />
          <StatCard label="Total Warga Aktif" value={`${stats.totalWarga} Warga`} color="#9C27B0" />
          {(user?.role === 'ADMIN' || user?.role === 'BENDAHARA') && (
            <StatCard label="Iuran Tertunggak" value={formatRupiah(Number(stats.totalPending))} color="#FF9800" />
          )}
        </View>
      )}

      {!stats && (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={{ textAlign: 'center', color: '#666' }}>Tidak ada data statistik</Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#6200ee', padding: 24, paddingBottom: 28 },
  greeting: { color: 'rgba(255,255,255,0.8)' },
  name: { color: '#fff', fontWeight: 'bold', marginTop: 2 },
  role: { color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  sectionTitle: { padding: 16, paddingBottom: 8, fontWeight: 'bold' },
  statsGrid: { padding: 16, gap: 12 },
  statCard: { elevation: 2 },
  emptyCard: { margin: 16 },
});
