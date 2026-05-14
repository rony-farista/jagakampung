import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

// Tampilkan notif saat app foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  // Minta izin dan daftarkan push token ke backend
  async registerPushToken(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Push notification hanya berjalan di perangkat fisik');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Izin notifikasi ditolak');
      return null;
    }

    // Android perlu notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'RT Warga & Iuran',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6200ee',
      });
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const pushToken = tokenData.data;

      // Kirim token ke backend
      await api.post('/users/push-token', { pushToken });
      console.log('Push token terdaftar:', pushToken);
      return pushToken;
    } catch (error) {
      console.error('Gagal mendapatkan push token:', error);
      return null;
    }
  },

  // Setup listener untuk notifikasi yang diterima & diklik
  setupListeners(
    onReceive?: (notification: Notifications.Notification) => void,
    onResponse?: (response: Notifications.NotificationResponse) => void
  ) {
    const receiveListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notifikasi diterima:', notification);
        onReceive?.(notification);
      }
    );

    const responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notifikasi diklik:', response);
        onResponse?.(response);
      }
    );

    return () => {
      receiveListener.remove();
      responseListener.remove();
    };
  },
};
