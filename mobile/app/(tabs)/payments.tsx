import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import api from '../../services/api';
import { Payment } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];

export default function PaymentsScreen() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchPayments = async (statusFilter = 'all') => {
    try {
      const params: any = {};
      if (user?.role === 'USER') params.userId = user.id;
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await api.get('/payments', { params });
      setPayments(data.payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchPayments(filter); }, [filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPayments(filter);
  }, [filter]);

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

  const renderItem = ({ item }: { item: Payment }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
              {item.paymentType?.name || 'Iuran'}
            </Text>
            {user?.role !== 'USER' && item.user && (
              <Text variant="bodySmall" style={styles.meta}>👤 {item.user.name}</Text>
            )}
            <Text variant="bodySmall" style={styles.meta}>
              📅 {item.month ? `${MONTHS[item.month - 1]} ` : ''}{item.year}
            </Text>
            {item.receivedBy && (
              <Text variant="bodySmall" style={styles.meta}>🧾 Diterima: {item.receivedBy.name}</Text>
            )}
            {item.notes && <Text variant="bodySmall" style={styles.meta} numberOfLines={1}>📝 {item.notes}</Text>}
          </View>
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <Text variant="titleSmall" style={{ fontWeight: 'bold', color: '#2E7D32' }}>
              {formatRupiah(Number(item.amount))}
            </Text>
            <Chip
              style={{ backgroundColor: item.status === 'paid' ? '#E8F5E9' : '#FFF3E0' }}
              textStyle={{ color: item.status === 'paid' ? '#2E7D32' : '#E65100', fontSize: 11 }}
            >
              {item.status === 'paid' ? '✅ Lunas' : '⏳ Belum'}
            </Chip>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={filter}
        onValueChange={(v) => setFilter(v)}
        style={styles.filter}
        buttons={[
          { value: 'all', label: 'Semua' },
          { value: 'paid', label: '✅ Lunas' },
          { value: 'pending', label: '⏳ Belum' },
        ]}
      />
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>Tidak ada data pembayaran</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filter: { margin: 12 },
  list: { padding: 12, paddingTop: 0, gap: 8 },
  card: { elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  meta: { color: '#666', marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
});
