import admin from './firebase';

export const sendPushNotification = async (fcmToken: string, title: string, body: string) => {
  const message = {
    token: fcmToken,
    notification: { title, body },
    data: { customData: 'value',  },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Notification sent:', response);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};
