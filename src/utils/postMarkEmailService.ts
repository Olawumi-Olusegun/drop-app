var postmark = require("postmark");
import dotenv from "dotenv";
import { OTPEmailTemplate } from "./OTPEmailTemplate";

dotenv.config();

const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN!);

export const sendEmail = async (to: string, subject: string, otp: string) => {

    const from = process.env.DROP_INNOVATION_EMAIL;

    if(!from) {
        throw new Error("App origin email required");
    }

  try {
    const response = await client.sendEmail({
      From: from,
      To: to,
      Subject: subject,
      HtmlBody: OTPEmailTemplate(otp),
    //   MessageStream: "outbound",
    })
    return response;
  } catch (error) {
    throw error;
  }
};
