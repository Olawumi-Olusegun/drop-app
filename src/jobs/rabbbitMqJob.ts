
import amqp from 'amqplib';
import { error } from 'console';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';


export const publishToQueue = async (message: object, QUEUE_NAME: string) => {
  let channel
  let connection

  try{
  connection = await amqp.connect(RABBITMQ_URL);
   channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
}
catch(error:any){
  console.error(error.message)

}finally{
  if (channel) await channel.close();
  if (connection) await connection.close()
}
  
};


