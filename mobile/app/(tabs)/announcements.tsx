import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Chip, ActivityIndicator } from 'react-native-paper';
import api from '../../services/api';
import { Announcement } from '../../types';

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get('/announcements');
      setAnnouncements(data.announcements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnnouncements();
  }, []);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const renderItem = ({ item }: { item: Announcement }) => (
    <Card style={[styles.card, item.isPinned && styles.pinned]}>
      <Card.Content>
        <View style={styles.titleRow}>
          {item.isPinned && (
            <Chip style={styles.pinnedChip} textStyle={{ fontSize: 10, color: '#6200ee' }}>
              📌 Dipinned
            </Chip>
          )}
          <Text variant="titleMedium" style={{ fontWeight: 'bold', flex: 1 }}>{item.title}</Text>
        </View>
        <Text variant="bodyMedium" style={styles.content}>{item.content}</Text>
        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.meta}>
            👤 {item.creator?.name}
          </Text>
          {item.createdAt && (
            <Text variant="bodySmall" style={styles.meta}>
              🗓️ {formatDate(item.createdAt)}
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>Belum ada pengumuman</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 12, gap: 8 },
  card: { elevation: 1 },
  pinned: { borderColor: '#6200ee', borderWidth: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  pinnedChip: { backgroundColor: '#EDE7F6' },
  content: { color: '#333', lineHeight: 22 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap' },
  meta: { color: '#888' },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
});
