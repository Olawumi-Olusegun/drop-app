import axios from "axios";
import prisma from "../config/db";
import amqp from 'amqplib';
import { WithdrawalStatus } from "@prisma/client";


const QUEUE_NAME = "withdrawalQueue"
const PAYSTACK_PAYOUT_URL = 'https://api.paystack.co/transfer'
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

const transferToDriver = async(

    account_number: string,
    bank_code: string,
    amount:  number,
    currency: string,
    reference: string,
    narration: string
)=>{


    const payoutPayload = {
        account_number ,
        bank_code,
        amount,
        currency,
        reference, 
        narration 
      };

      let payoutSuccessful = false


    try {

        const response = await axios.post(PAYSTACK_PAYOUT_URL, payoutPayload, {
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
              'Content-Type': 'application/json',
            },
          });
          if (response.data.data && response.data.data.status === 'success') {
            payoutSuccessful = true;
          }

          return payoutSuccessful
        } catch (error: any) {
          console.error("Paystack payout error:", error.response ? error.response.data : error.message);
          return payoutSuccessful
        }
      
 }

const processWithdrawal = async (msg: amqp.ConsumeMessage | null, channel: amqp.Channel)=>{

    if(msg){

        const jobData = JSON.parse(msg.content.toString());
        const { withdrawalId, email, amount, walletId, reference, bankDetails } = jobData
        const amountInKobo = amount * 100;

        try{
            const transfer = await transferToDriver(bankDetails.accountNumber,bankDetails.bankCode,amountInKobo, "NGN", reference, "Driver Payout")
            if(transfer){
                const updatedWithdrawal = await prisma.$transaction(async(tx)=>{
                    await tx.withdrawal.update({
                        where: {id: withdrawalId},
                        data: {status: WithdrawalStatus.completed},

                    })

                    await tx.wallet.update({
                        where: {id: walletId},
                        data:{balance: {decrement: amount}}
                    })

                    await tx.walletTransaction.create({
                        data: {
                            walletId,
                            type: 'debit',
                            amount,
                            reference,
                            status: 'completed'
                        }
                    })
                })
                return updatedWithdrawal
            }
            else{
                await prisma.withdrawal.update({
                    where: {id: withdrawalId},
                    data: {status: WithdrawalStatus.FAILED}
                })
                throw new Error("Payout failed via Paystack")
            }


        }

        catch{


        }







    }

}


const startWorker = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log(`RabbitMQ worker is listening on queue: ${QUEUE_NAME}`);
    channel.consume(QUEUE_NAME, (msg) => processWithdrawal (msg, channel));
  } catch (error) {
    console.error("Failed to start RabbitMQ worker:", error);
    process.exit(1);
  }
};

startWorker()

