import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, Chip, FAB, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';
import { ForumPost } from '../../types';

const CATEGORIES = [
  { key: 'semua', label: 'Semua' },
  { key: 'umum', label: 'Umum' },
  { key: 'pertanyaan', label: 'Pertanyaan' },
  { key: 'saran', label: 'Saran' },
];

const CATEGORY_COLORS: Record<string, string> = {
  umum: '#1976D2',
  pertanyaan: '#F57C00',
  saran: '#388E3C',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ForumScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('semua');

  const fetchPosts = async (category = selectedCategory) => {
    try {
      const params = category !== 'semua' ? { category } : {};
      const res = await api.get('/forum', { params });
      setPosts(res.data.posts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPosts();
    }, [selectedCategory])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const onCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setLoading(true);
    fetchPosts(cat);
  };

  const renderPost = ({ item }: { item: ForumPost }) => (
    <TouchableOpacity onPress={() => router.push(`/(tabs)/forum-detail?id=${item.id}`)}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.chipRow}>
            <Chip
              style={[styles.categoryChip, { backgroundColor: CATEGORY_COLORS[item.category] || '#888' }]}
              textStyle={{ color: '#fff', fontSize: 11 }}
            >
              {item.category}
            </Chip>
          </View>
          <Text variant="titleMedium" style={styles.postTitle}>{item.title}</Text>
          <Text variant="bodySmall" style={styles.meta}>
            {item.creator?.name} · {formatDate(item.createdAt)}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="heart-outline" size={14} color="#e53935" />
              <Text style={styles.statText}>{item.likesCount}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="chatbubble-outline" size={14} color="#6200ee" />
              <Text style={styles.statText}>{item.commentsCount}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            onPress={() => onCategoryChange(cat.key)}
            style={[
              styles.filterChip,
              selectedCategory === cat.key && styles.filterChipActive
            ]}
          >
            <Text style={[
              styles.filterChipText,
              selectedCategory === cat.key && styles.filterChipTextActive
            ]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color="#6200ee" />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPost}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.empty}>Belum ada diskusi</Text>}
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
  filterRow: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: '#fff', flexWrap: 'wrap' },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff'
  },
  filterChipActive: { backgroundColor: '#6200ee', borderColor: '#6200ee' },
  filterChipText: { fontSize: 13, color: '#555' },
  filterChipTextActive: { color: '#fff' },
  list: { padding: 12 },
  card: { marginBottom: 10, borderRadius: 10 },
  chipRow: { marginBottom: 6 },
  categoryChip: { alignSelf: 'flex-start' },
  postTitle: { fontWeight: 'bold', marginBottom: 4 },
  meta: { color: '#888', marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 16 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: '#555' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  empty: { textAlign: 'center', marginTop: 40, color: '#aaa' },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#6200ee' },
});
