import { Tabs } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color }: { name: IoniconsName; color: string }) {
  return <Ionicons name={name} size={22} color={color} />;
}

export default function TabsLayout() {
  const { user } = useAuth();
  const isAdminOrBendahara = user?.role === 'ADMIN' || user?.role === 'BENDAHARA';

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#6200ee',
      tabBarInactiveTintColor: '#888',
      headerStyle: { backgroundColor: '#6200ee' },
      headerTintColor: '#fff',
    }}>
      <Tabs.Screen name="index" options={{
        title: 'Dashboard',
        tabBarLabel: 'Dashboard',
        tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
      }} />
      <Tabs.Screen name="payments" options={{
        title: 'Iuran',
        tabBarLabel: 'Iuran',
        tabBarIcon: ({ color }) => <TabIcon name="wallet" color={color} />,
      }} />
      <Tabs.Screen name="announcements" options={{
        title: 'Pengumuman',
        tabBarLabel: 'Info',
        tabBarIcon: ({ color }) => <TabIcon name="megaphone" color={color} />,
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Profil',
        tabBarLabel: 'Profil',
        tabBarIcon: ({ color }) => <TabIcon name="person" color={color} />,
      }} />

      {/* Admin/Bendahara only */}
      <Tabs.Screen name="residents" options={{
        title: 'Data Warga',
        tabBarLabel: 'Warga',
        tabBarIcon: ({ color }) => <TabIcon name="people" color={color} />,
        href: isAdminOrBendahara ? undefined : null,
      }} />
      <Tabs.Screen name="payment-types" options={{
        title: 'Jenis Iuran',
        tabBarLabel: 'Jenis',
        tabBarIcon: ({ color }) => <TabIcon name="pricetags" color={color} />,
        href: user?.role === 'ADMIN' ? undefined : null,
      }} />
      <Tabs.Screen name="record-payment" options={{
        title: 'Catat Pembayaran',
        tabBarLabel: 'Catat',
        tabBarIcon: ({ color }) => <TabIcon name="add-circle" color={color} />,
        href: isAdminOrBendahara ? undefined : null,
      }} />
      <Tabs.Screen name="create-announcement" options={{
        title: 'Buat Pengumuman',
        tabBarLabel: 'Buat Info',
        tabBarIcon: ({ color }) => <TabIcon name="create" color={color} />,
        href: isAdminOrBendahara ? undefined : null,
      }} />
    </Tabs>
  );
}
