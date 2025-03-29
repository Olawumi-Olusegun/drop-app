import admin from './firebase';


interface PushNotification {
  fcmToken: string; 
  title: string;
  body: string;
}
export const sendPushNotification = async ({ fcmToken, title, body }: PushNotification) => {

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
