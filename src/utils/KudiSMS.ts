import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const KUDISMS_API_URL = process.env.KUDISMS_API_URL || "";

export const sendSMSWithKudiSMS = async (recipientPhoneNumber: string, message: string) => {
  try {
    const response = await axios.post(`${KUDISMS_API_URL}`, null, {
      params: {
        username: process.env.KUDISMS_USERNAME,
        password: process.env.KUDISMS_API_KEY,
        sender: process.env.KUDISMS_SENDER_ID,
        message: message,
        mobiles: recipientPhoneNumber, // For many recepient separate phone numbers comma.
      },
    });

    console.log("SMS Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};
