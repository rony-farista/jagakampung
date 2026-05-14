import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

interface ErrorBoundaryState { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.emoji}>⚠️</Text>
              <Text variant="titleMedium" style={styles.title}>Terjadi Kesalahan</Text>
              <Text variant="bodySmall" style={styles.msg}>
                {this.state.error?.message || 'Unknown error'}
              </Text>
              <Button mode="contained" onPress={() => this.setState({ hasError: false })}>
                Coba Lagi
              </Button>
            </Card.Content>
          </Card>
        </View>
      );
    }
    return this.props.children;
  }
}

export function EmptyState({ icon = '📭', message = 'Tidak ada data' }: { icon?: string; message?: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{icon}</Text>
      <Text variant="bodyMedium" style={styles.emptyMsg}>{message}</Text>
    </View>
  );
}

export function LoadingOverlay() {
  return (
    <View style={styles.overlay}>
      <Text style={{ fontSize: 32 }}>⏳</Text>
      <Text variant="bodyMedium" style={{ color: '#666', marginTop: 8 }}>Memuat...</Text>
    </View>
  );
}

export function useRoleGuard(roles: ('ADMIN' | 'BENDAHARA' | 'USER')[]) {
  const { user } = useAuth();
  return user ? roles.includes(user.role) : false;
}

export function RoleGuard({
  children,
  roles,
  fallback,
}: {
  children: React.ReactNode;
  roles: ('ADMIN' | 'BENDAHARA' | 'USER')[];
  fallback?: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) return <ActivityIndicator style={{ margin: 16 }} />;
  if (!user || !roles.includes(user.role)) {
    return fallback ? <>{fallback}</> : null;
  }
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.8)' },
  card: { width: '100%' },
  emoji: { fontSize: 40, textAlign: 'center', marginBottom: 12 },
  title: { textAlign: 'center', marginBottom: 8, fontWeight: 'bold' },
  msg: { textAlign: 'center', color: '#666', marginBottom: 16 },
  emptyMsg: { color: '#999', marginTop: 8, textAlign: 'center' },
});

