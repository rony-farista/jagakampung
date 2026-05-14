/**
 * Kirim push notification via Expo Push Notification Service
 * Tidak perlu SDK tambahan — pakai fetch ke Expo API
 */

const sendPushNotification = async (tokens, title, body, data = {}) => {
  if (!tokens || tokens.length === 0) return;

  // Filter hanya token valid (format ExponentPushToken[...])
  const validTokens = tokens.filter(
    (t) => t && t.startsWith('ExponentPushToken')
  );
  if (validTokens.length === 0) return;

  // Bagi jadi batch max 100
  const chunks = [];
  for (let i = 0; i < validTokens.length; i += 100) {
    chunks.push(validTokens.slice(i, i + 100));
  }

  for (const chunk of chunks) {
    const messages = chunk.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
    }));

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });
      const result = await response.json();
      console.log(`✅ Push sent to ${chunk.length} devices`, result.data?.[0]?.status);
    } catch (error) {
      console.error('❌ Push notification error:', error.message);
    }
  }
};

module.exports = { sendPushNotification };
