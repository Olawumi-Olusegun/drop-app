import amqp from 'amqplib';
import axios from 'axios';
import { PaymentStatus } from '@prisma/client';
import prisma from '../config/db';


const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const RABBITMQ_URL =  process.env.RABBITMQ_URL ||'amqps://ofqjltpz:GpsSYhlgemewBlYj-uZdF-cIXmiURZI5@kebnekaise.lmq.cloudamqp.com/ofqjltpz';
const QUEUE_NAME = 'cardChargeQueue';


const chargeSavedCard = async (
  amount: number, // amount in kobo
  email: string,
  authCode: string,
  reference: string
): Promise<boolean> => {
  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/charge_authorization',
      {
        amount,
        email,
        authorization_code: authCode,
        reference,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.data && response.data.data.status === 'success';
  } catch (error: any) {
    console.error('Paystack charge error in worker:', error.response ? error.response.data : error.message);
    return false;
  }
};

const processMessage = async (msg: amqp.ConsumeMessage | null, channel: amqp.Channel) => {
  if (msg) {
 
    const jobData = JSON.parse(msg.content.toString());
    const { rideId, finalFare, riderEmail, riderId, userId, netAmount, reference } = jobData;
    const finalFareAmount = parseFloat(finalFare);
    const amountInKobo = finalFareAmount * 100;
    try {
      // Retrieve the rider's saved card details (if any) from the User record.
      const user = await prisma.user.findUnique({
        where: { id: riderId },
        select: { savedCardAuthCode: true, email: true },
      });
      if (!user || !user.savedCardAuthCode) {
        // Update payment record as failed and block the user.
        await prisma.payment.update({
          where: { rideId },
          data: { status: PaymentStatus.failed },
        });
        await prisma.user.update({
          where: { id: riderId },
          data: { isBlocked: true, outstandingBalance: finalFareAmount },
        });
        throw new Error("No saved card found during background processing");
      }
      const chargeSuccessful = await chargeSavedCard(amountInKobo, riderEmail, user.savedCardAuthCode, reference);
      if (chargeSuccessful) {
        await prisma.payment.update({
          where: { rideId },
          data: { status: PaymentStatus.completed },
        });
        // Update the driver's wallet.
        const walletUpdate = await prisma.wallet.update({
          where: { userId: userId },
          data: { balance: { increment: netAmount } },
        });
        await prisma.walletTransaction.create({
          data: {
            walletId: walletUpdate.id,
            type: 'credit',
            amount: netAmount,
            reference,
            status: 'completed',
          },
        });
      } else {
        await prisma.payment.update({
          where: { rideId },
          data: { status: PaymentStatus.failed },
        });
        await prisma.user.update({
          where: { id: riderId },
          data: { isBlocked: true, outstandingBalance: finalFareAmount },
        });
        throw new Error("Background card payment failed");
      }
      channel.ack(msg);
    } catch (error: any) {
      console.error("Error processing RabbitMQ message:", error.message);
      channel.nack(msg, false, false); // Do not requeue
    }
  }
};

const startWorker = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log(`RabbitMQ worker is listening on queue: ${QUEUE_NAME}`);
    channel.consume(QUEUE_NAME, (msg) => processMessage(msg, channel));
  } catch (error) {
    console.error("Failed to start RabbitMQ worker:", error);
    process.exit(1);
  }
};

startWorker();