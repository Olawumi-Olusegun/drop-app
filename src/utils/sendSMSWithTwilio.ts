import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
const authToken = process.env.TWILIO_AUTH_TOKEN as string;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER as string;
export const client = twilio(accountSid, authToken);

export const sendSMSWithTwilio = async (to: string, body: string) => {
    try {
        const message = await client.messages.create({ from: twilioPhone, to, body, });
        console.log('SMS sent:', message.sid);
        console.log('SMS message:', message);
        return message;
      } catch (error) {
        console.error('Twilio SMS error:', error);
        throw error;
      }
}

