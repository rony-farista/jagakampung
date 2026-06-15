import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput as RNTextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Text, ActivityIndicator, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ForumPost, ForumComment } from '../../types';

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const CATEGORY_COLORS: Record<string, string> = {
  umum: '#2196F3',
  pertanyaan: '#FF9800',
  saran: '#4CAF50',
};

export default function ForumDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liking, setLiking] = useState(false);

  const fetchPost = async () => {
    try {
      setError(null);
      const res = await api.get(`/forum/${id}`);
      setPost(res.data);
    } catch (e: any) {
      setError('Gagal memuat diskusi');
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPost().finally(() => setLoading(false));
  }, [id]);

  const handleToggleLike = async () => {
    if (!post || liking) return;
    setLiking(true);
    try {
      const res = await api.post(`/forum/${post.id}/like`);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              isLiked: res.data.isLiked,
              likesCount: res.data.isLiked ? prev.likesCount + 1 : prev.likesCount - 1,
            }
          : prev
      );
    } catch (e) {
      Alert.alert('Error', 'Gagal mengubah like');
    } finally {
      setLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const res = await api.post(`/forum/${id}/comments`, { content: commentText.trim() });
      const newComment: ForumComment = res.data;
      setPost((prev) =>
        prev
          ? {
              ...prev,
              comments: [...(prev.comments || []), newComment],
              commentsCount: prev.commentsCount + 1,
            }
          : prev
      );
      setCommentText('');
    } catch (e) {
      Alert.alert('Error', 'Gagal menambahkan komentar');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = () => {
    Alert.alert('Hapus Diskusi', 'Yakin ingin menghapus diskusi ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/forum/${id}`);
            router.back();
          } catch (e) {
            Alert.alert('Error', 'Gagal menghapus diskusi');
          }
        },
      },
    ]);
  };

  const handleDeleteComment = (commentId: number) => {
    Alert.alert('Hapus Komentar', 'Yakin ingin menghapus komentar ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/forum/${id}/comments/${commentId}`);
            setPost((prev) =>
              prev
                ? {
                    ...prev,
                    comments: (prev.comments || []).filter((c) => c.id !== commentId),
                    commentsCount: prev.commentsCount - 1,
                  }
                : prev
            );
          } catch (e) {
            Alert.alert('Error', 'Gagal menghapus komentar');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Diskusi tidak ditemukan'}</Text>
      </View>
    );
  }

  const canDeletePost =
    user?.id === post.creator?.id || user?.role === 'ADMIN';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Post header */}
        <View style={styles.postCard}>
          <View style={styles.postTopRow}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: CATEGORY_COLORS[post.category] || '#888' },
              ]}
            >
              <Text style={styles.categoryText}>{post.category}</Text>
            </View>
            {canDeletePost && (
              <TouchableOpacity onPress={handleDeletePost} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color="#e53935" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postMeta}>
            {post.creator?.name || 'Anonim'} &middot; {formatDate(post.createdAt)}
          </Text>
          <Text style={styles.postContent}>{post.content}</Text>

          {/* Like row */}
          <View style={styles.likeRow}>
            <TouchableOpacity onPress={handleToggleLike} style={styles.likeBtn} disabled={liking}>
              <Ionicons
                name={post.isLiked ? 'heart' : 'heart-outline'}
                size={22}
                color={post.isLiked ? '#e53935' : '#888'}
              />
              <Text style={[styles.likeCount, post.isLiked && { color: '#e53935' }]}>
                {post.likesCount}
              </Text>
            </TouchableOpacity>
            <View style={styles.commentCount}>
              <Ionicons name="chatbubble-outline" size={20} color="#888" />
              <Text style={styles.likeCount}>{post.commentsCount}</Text>
            </View>
          </View>
        </View>

        <Divider />

        {/* Comments section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Komentar ({post.commentsCount})</Text>
          {(post.comments || []).length === 0 ? (
            <Text style={styles.emptyComments}>Belum ada komentar. Jadilah yang pertama!</Text>
          ) : (
            (post.comments || []).map((comment) => {
              const canDeleteComment =
                user?.id === comment.creator?.id || user?.role === 'ADMIN';
              return (
                <View key={comment.id} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{comment.creator?.name || 'Anonim'}</Text>
                    {canDeleteComment && (
                      <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                        <Ionicons name="close-circle-outline" size={18} color="#e53935" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.commentContent}>{comment.content}</Text>
                  <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Comment input */}
      <View style={styles.inputRow}>
        <RNTextInput
          style={styles.commentInput}
          placeholder="Tulis komentar..."
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          onPress={handleAddComment}
          disabled={submittingComment || !commentText.trim()}
          style={[
            styles.sendBtn,
            (!commentText.trim() || submittingComment) && styles.sendBtnDisabled,
          ]}
        >
          {submittingComment ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { paddingBottom: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorText: { color: '#e53935', fontSize: 14 },
  postCard: { backgroundColor: '#fff', padding: 16, marginBottom: 2 },
  postTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  categoryText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  deleteBtn: { padding: 4 },
  postTitle: { fontSize: 20, fontWeight: '700', color: '#222', marginBottom: 4 },
  postMeta: { fontSize: 12, color: '#999', marginBottom: 12 },
  postContent: { fontSize: 15, color: '#444', lineHeight: 22, marginBottom: 16 },
  likeRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  likeCount: { fontSize: 14, color: '#888' },
  commentCount: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  commentsSection: { backgroundColor: '#fff', padding: 16, marginTop: 2 },
  commentsTitle: { fontSize: 16, fontWeight: '700', color: '#222', marginBottom: 12 },
  emptyComments: { color: '#999', fontSize: 13, fontStyle: 'italic' },
  commentCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#6200ee',
    paddingLeft: 10,
    marginBottom: 14,
  },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  commentAuthor: { fontSize: 13, fontWeight: '600', color: '#6200ee' },
  commentContent: { fontSize: 14, color: '#444', lineHeight: 20 },
  commentDate: { fontSize: 11, color: '#bbb', marginTop: 4 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 8,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
    backgroundColor: '#fafafa',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#ccc' },
});
