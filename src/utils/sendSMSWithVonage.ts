import { Vonage } from "@vonage/server-sdk";
import { Auth } from '@vonage/auth';

const VONAGE_API_KEY = process.env.VONAGE_API_KEY as string;
const VONAGE_API_SECRET_KEY = process.env.VONAGE_API_SECRET_KEY as string;


const vonage = new Vonage(
  new Auth({ apiKey: VONAGE_API_KEY, apiSecret: VONAGE_API_SECRET_KEY, })
);

const sanitizePhone = (input: string) => input.replace(/[^0-9]/g, '');

export const sendSMSWithVonage = async ({ to, text }: { to: string, text: string}) => {
      const from = "Drop Ride"
      const cleaned = sanitizePhone(to);
    try {
      const message = await vonage.sms.send({ to: cleaned, from, text });
    // const message = "";
      console.log('SMS message:', message, cleaned);
      return message;
    } catch (error) {
      console.error('Vonage SMS error:', error);
      throw error;
    }
  }