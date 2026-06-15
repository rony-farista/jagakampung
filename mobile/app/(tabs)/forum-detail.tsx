import React, { useState, useCallback, useRef } from 'react';
import {
  View, ScrollView, StyleSheet, KeyboardAvoidingView,
  Platform, Alert, TouchableOpacity
} from 'react-native';
import { Text, Card, Chip, TextInput, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ForumPost, ForumComment } from '../../types';

const CATEGORY_COLORS: Record<string, string> = {
  umum: '#1976D2',
  pertanyaan: '#F57C00',
  saran: '#388E3C',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ForumDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const fetchPost = async () => {
    try {
      const res = await api.get(`/forum/${id}`);
      setPost(res.data.post);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchPost(); }, [id]));

  const handleLike = async () => {
    if (!post || likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await api.post(`/forum/${post.id}/like`);
      setPost({ ...post, isLiked: res.data.liked, likesCount: res.data.likesCount });
    } catch (e) {
      console.error(e);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !post) return;
    setSubmitting(true);
    try {
      await api.post(`/forum/${post.id}/comments`, { content: commentText.trim() });
      setCommentText('');
      fetchPost();
    } catch (e) {
      Alert.alert('Error', 'Gagal menambahkan komentar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = () => {
    Alert.alert('Hapus Diskusi', 'Yakin ingin menghapus diskusi ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/forum/${id}`);
            router.back();
          } catch (e) {
            Alert.alert('Error', 'Gagal menghapus diskusi');
          }
        }
      }
    ]);
  };

  const handleDeleteComment = (comment: ForumComment) => {
    Alert.alert('Hapus Komentar', 'Yakin ingin menghapus komentar ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/forum/${id}/comments/${comment.id}`);
            fetchPost();
          } catch (e) {
            Alert.alert('Error', 'Gagal menghapus komentar');
          }
        }
      }
    ]);
  };

  const canDeletePost = post && (post.creator?.id === user?.id || user?.role === 'ADMIN');
  const canDeleteComment = (c: ForumComment) => c.creator?.id === user?.id || user?.role === 'ADMIN';

  if (loading) {
    return <ActivityIndicator style={styles.loader} color="#6200ee" />;
  }

  if (!post) {
    return <Text style={styles.empty}>Diskusi tidak ditemukan</Text>;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <Card style={styles.postCard}>
          <Card.Content>
            <View style={styles.chipRow}>
              <Chip
                style={[styles.categoryChip, { backgroundColor: CATEGORY_COLORS[post.category] || '#888' }]}
                textStyle={{ color: '#fff', fontSize: 11 }}
              >
                {post.category}
              </Chip>
              {canDeletePost && (
                <TouchableOpacity onPress={handleDeletePost} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={20} color="#e53935" />
                </TouchableOpacity>
              )}
            </View>
            <Text variant="titleLarge" style={styles.postTitle}>{post.title}</Text>
            <Text variant="bodySmall" style={styles.meta}>
              {post.creator?.name} · {formatDate(post.createdAt)}
            </Text>
            <Text variant="bodyMedium" style={styles.content}>{post.content}</Text>
            <TouchableOpacity onPress={handleLike} style={styles.likeBtn} disabled={likeLoading}>
              <Ionicons
                name={post.isLiked ? 'heart' : 'heart-outline'}
                size={22}
                color={post.isLiked ? '#e53935' : '#888'}
              />
              <Text style={[styles.likeText, post.isLiked && { color: '#e53935' }]}>
                {post.likesCount} Suka
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        <Text variant="titleSmall" style={styles.commentsHeader}>
          Komentar ({post.commentsCount})
        </Text>
        <Divider />

        {(post.comments || []).map((c) => (
          <Card key={c.id} style={styles.commentCard}>
            <Card.Content>
              <View style={styles.commentHeader}>
                <Text variant="labelMedium" style={styles.commentAuthor}>{c.creator?.name}</Text>
                <View style={styles.commentRight}>
                  <Text variant="bodySmall" style={styles.commentDate}>{formatDate(c.createdAt)}</Text>
                  {canDeleteComment(c) && (
                    <TouchableOpacity onPress={() => handleDeleteComment(c)} style={{ marginLeft: 8 }}>
                      <Ionicons name="trash-outline" size={16} color="#e53935" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <Text variant="bodyMedium">{c.content}</Text>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          mode="outlined"
          placeholder="Tulis komentar..."
          value={commentText}
          onChangeText={setCommentText}
          style={styles.commentInput}
          dense
          multiline
        />
        <Button
          mode="contained"
          onPress={handleAddComment}
          loading={submitting}
          disabled={!commentText.trim() || submitting}
          style={styles.sendBtn}
          contentStyle={{ height: 44 }}
        >
          Kirim
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loader: { flex: 1, marginTop: 80 },
  empty: { textAlign: 'center', marginTop: 40, color: '#aaa' },
  postCard: { margin: 12, borderRadius: 10 },
  chipRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryChip: { alignSelf: 'flex-start' },
  deleteBtn: { padding: 4 },
  postTitle: { fontWeight: 'bold', marginBottom: 4 },
  meta: { color: '#888', marginBottom: 12 },
  content: { lineHeight: 22, marginBottom: 16 },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  likeText: { fontSize: 14, color: '#888' },
  commentsHeader: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4, color: '#333' },
  commentCard: { marginHorizontal: 12, marginTop: 8, borderRadius: 8 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  commentAuthor: { fontWeight: 'bold', color: '#6200ee' },
  commentRight: { flexDirection: 'row', alignItems: 'center' },
  commentDate: { color: '#aaa', fontSize: 11 },
  inputBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', padding: 8, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#eee', gap: 8, alignItems: 'flex-end'
  },
  commentInput: { flex: 1, backgroundColor: '#fff', maxHeight: 100 },
  sendBtn: { backgroundColor: '#6200ee', alignSelf: 'flex-end' },
});
