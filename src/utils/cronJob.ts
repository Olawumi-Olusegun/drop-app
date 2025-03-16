import * as cron from 'node-cron';
import https from "https"

const renderUrl = `${process.env.BACKEND_URL}/health` || "";
const intervalTime = '*/12 * * * *';


interface ICronJob {
    url?: string;
    interval?: string;
}

const sendGetRequest = (url: string) => {
    https.get(url, (res) => {
    let data = '';

    if(res.statusCode === 200) {
        console.log("Get request sent successfully")
    }

    // Response
    res.on('data', (chunk) => {
      data += chunk;
    });

    // Request completed
    res.on('end', () => {
      console.log('Response:', data);
    });
  }).on('error', (err) => {
    console.error('Error making GET request:', err.message);
  });
};

export const startCronJob = ({ url = renderUrl, interval = intervalTime }: ICronJob) => {
  cron.schedule(interval, () => {
    console.log('Sending GET request...');
    sendGetRequest(url);
  });
  console.log(`This cron job runs every 12mins to keep render awake`);
};