import axios from 'axios';


const sanitizePhone = (input: string) => input.replace(/[^0-9]/g, '');


export const sendSMSWithInfoBip = async ({ to, text }: { to: string, text: string}) => {

  const cleaned = sanitizePhone(to);
  console.log(cleaned)
  console.log(process.env.INFOBIP_API_KEY)

  const url = 'https://qdj322.api.infobip.com/sms/2/text/advanced';

  const payload = {
    messages: [
      {
        // '2347065066382'
        destinations: [{ to: cleaned }], // E.164 format
        from: '447491163443', // Sender ID or number approved in Infobip
        text,
      },
    ],
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `App ${process.env.INFOBIP_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    console.log('SMS sent successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error sending SMS:', error.response?.data || error.message);
    throw error;
  }
};
