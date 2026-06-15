import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Card, Text, FAB, Chip, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ForumPost } from '../../types';

const CATEGORIES = [
  { label: 'Semua', value: '' },
  { label: 'Umum', value: 'umum' },
  { label: 'Pertanyaan', value: 'pertanyaan' },
  { label: 'Saran', value: 'saran' },
];

const CATEGORY_COLORS: Record<string, string> = {
  umum: '#2196F3',
  pertanyaan: '#FF9800',
  saran: '#4CAF50',
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ForumScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchPosts = useCallback(async () => {
    try {
      setError(null);
      const params = selectedCategory ? { category: selectedCategory } : {};
      const res = await api.get('/forum', { params });
      setPosts(res.data);
    } catch (e: any) {
      setError('Gagal memuat diskusi');
    }
  }, [selectedCategory]);

  useEffect(() => {
    setLoading(true);
    fetchPosts().finally(() => setLoading(false));
  }, [fetchPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const renderPost = ({ item }: { item: ForumPost }) => {
    const catColor = CATEGORY_COLORS[item.category] || '#888';
    return (
      <TouchableOpacity onPress={() => router.push(`/(tabs)/forum-detail?id=${item.id}`)}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Chip
                style={[styles.categoryChip, { backgroundColor: catColor }]}
                textStyle={styles.categoryChipText}
              >
                {item.category}
              </Chip>
            </View>
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postContent} numberOfLines={2}>
              {item.content}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.creatorText}>{item.creator?.name || 'Anonim'}</Text>
              <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="heart-outline" size={14} color="#888" />
                <Text style={styles.statText}>{item.likesCount}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="chatbubble-outline" size={14} color="#888" />
                <Text style={styles.statText}>{item.commentsCount}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat.value}
            selected={selectedCategory === cat.value}
            onPress={() => setSelectedCategory(cat.value)}
            style={[
              styles.filterChip,
              selectedCategory === cat.value && styles.filterChipSelected,
            ]}
            textStyle={
              selectedCategory === cat.value ? styles.filterChipTextSelected : styles.filterChipText
            }
          >
            {cat.label}
          </Chip>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPost}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Belum ada diskusi</Text>
            </View>
          }
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={() => router.push('/(tabs)/create-forum-post')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  filterRow: { maxHeight: 56, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  filterContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip: { backgroundColor: '#eee', marginRight: 8 },
  filterChipSelected: { backgroundColor: '#6200ee' },
  filterChipText: { color: '#333' },
  filterChipTextSelected: { color: '#fff' },
  listContent: { padding: 12, paddingBottom: 80 },
  card: { marginBottom: 12, borderRadius: 8 },
  cardHeader: { flexDirection: 'row', marginBottom: 6 },
  categoryChip: { alignSelf: 'flex-start', height: 24 },
  categoryChipText: { color: '#fff', fontSize: 11, lineHeight: 14 },
  postTitle: { fontSize: 16, fontWeight: '700', color: '#222', marginBottom: 4 },
  postContent: { fontSize: 13, color: '#555', lineHeight: 18, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  creatorText: { fontSize: 12, color: '#6200ee', fontWeight: '600' },
  dateText: { fontSize: 11, color: '#999' },
  statsRow: { flexDirection: 'row', gap: 16, marginTop: 4 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: '#888' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorText: { color: '#e53935', textAlign: 'center', fontSize: 14 },
  emptyText: { color: '#999', fontSize: 14 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#6200ee' },
});
