import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Text, Card, Chip, FAB, ActivityIndicator, Searchbar } from 'react-native-paper';
import api from '../../services/api';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export default function ResidentsScreen() {
  const { user } = useAuth();
  const [residents, setResidents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchResidents = async (searchQuery = '') => {
    try {
      const params: any = { role: 'USER' };
      if (searchQuery) params.search = searchQuery;
      const { data } = await api.get('/users', { params });
      setResidents(data.users);
    } catch (error) {
      console.error('Error fetching residents:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchResidents(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchResidents(search);
  }, [search]);

  const handleSearch = (query: string) => {
    setSearch(query);
    fetchResidents(query);
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    try {
      await api.put(`/users/${id}`, { isActive: !isActive });
      fetchResidents(search);
    } catch {
      Alert.alert('Error', 'Gagal mengubah status warga');
    }
  };

  const renderItem = ({ item }: { item: User }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.name}</Text>
            <Text variant="bodySmall" style={styles.meta}>📧 {item.email}</Text>
            {item.nik && <Text variant="bodySmall" style={styles.meta}>🪪 NIK: {item.nik}</Text>}
            {item.phone && <Text variant="bodySmall" style={styles.meta}>📱 {item.phone}</Text>}
            {item.address && <Text variant="bodySmall" style={styles.meta} numberOfLines={1}>📍 {item.address}</Text>}
          </View>
          <Chip
            onPress={user?.role === 'ADMIN' ? () => toggleActive(item.id, item.isActive) : undefined}
            style={{ backgroundColor: item.isActive ? '#E8F5E9' : '#FFEBEE' }}
            textStyle={{ color: item.isActive ? '#2E7D32' : '#C62828', fontSize: 11 }}
          >
            {item.isActive ? 'Aktif' : 'Nonaktif'}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Cari warga..."
        onChangeText={handleSearch}
        value={search}
        style={styles.search}
      />
      <FlatList
        data={residents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={styles.empty}>Tidak ada data warga</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  search: { margin: 12 },
  list: { padding: 12, paddingTop: 0, gap: 8 },
  card: { elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  meta: { color: '#666', marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
});
