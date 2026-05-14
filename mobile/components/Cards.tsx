import { View, StyleSheet, Platform } from 'react-native';
import { Card, Text, ActivityIndicator } from 'react-native-paper';

interface StatCardProps {
  label: string;
  value: string | number;
  color: string;
  icon?: string;
}

export function StatCard({ label, value, color, icon }: StatCardProps) {
  return (
    <Card style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <Card.Content style={styles.content}>
        <Text variant="labelMedium" style={styles.label}>{icon} {label}</Text>
        <Text variant="headlineSmall" style={[styles.value, { color }]}>{value}</Text>
      </Card.Content>
    </Card>
  );
}

interface PaymentCardProps {
  name: string;
  type: string;
  amount: number;
  month?: number;
  year?: number;
  status: 'paid' | 'pending';
  receivedBy?: string;
  notes?: string;
  showUser?: boolean;
}

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];

export function PaymentCard({ name, type, amount, month, year, status, receivedBy, notes, showUser }: PaymentCardProps) {
  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>{type}</Text>
            {showUser && <Text variant="bodySmall" style={styles.meta}>👤 {name}</Text>}
            <Text variant="bodySmall" style={styles.meta}>
              📅 {month ? `${MONTHS[month - 1]} ` : ''}{year}
            </Text>
            {receivedBy && <Text variant="bodySmall" style={styles.meta}>🧾 {receivedBy}</Text>}
            {notes && <Text variant="bodySmall" style={styles.meta} numberOfLines={1}>📝 {notes}</Text>}
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <Text variant="titleSmall" style={{ fontWeight: 'bold', color: '#2E7D32' }}>
              {formatRupiah(amount)}
            </Text>
            <View style={[styles.badge, { backgroundColor: status === 'paid' ? '#E8F5E9' : '#FFF3E0' }]}>
              <Text style={{ color: status === 'paid' ? '#2E7D32' : '#E65100', fontSize: 11 }}>
                {status === 'paid' ? '✅ Lunas' : '⏳ Belum'}
              </Text>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

export function SkeletonCard() {
  return (
    <Card style={[styles.card, { opacity: 0.5 }]}>
      <Card.Content>
        <View style={{ height: 14, backgroundColor: '#E0E0E0', borderRadius: 4, marginBottom: 8 }} />
        <View style={{ height: 10, backgroundColor: '#E0E0E0', borderRadius: 4, width: '60%' }} />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  statCard: {
    elevation: 2,
    ...Platform.select({ web: { boxShadow: '0 1px 4px rgba(0,0,0,0.15)' } }),
  },
  content: { paddingVertical: 12 },
  label: { color: '#666' },
  value: { fontWeight: 'bold', marginTop: 4 },
  card: { elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  meta: { color: '#666', marginTop: 2 },
  badge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
});
