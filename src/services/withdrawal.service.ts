import { WithdrawalStatus } from "@prisma/client";
import prisma from "../config/db"
import { publishToQueue } from "../jobs/rabbbitMqJob";



export const requestWithdrawal = async (userId: string, amount: number) =>{

    const bankexists = await prisma.bankDetail.findUnique({
        where: {userId: userId}
    })

    if(!bankexists){
        throw new Error("User has no saved bank ")
    }
    const withdrawal = await prisma.$transaction(async (tx)=>{

        const wallet = await tx.wallet.findUnique({where: {userId}});
        if(!wallet){
            throw new Error("Wallet not found for user")
        }
        if(wallet.balance < amount){
            throw new Error("Insufficent wallet balance")
        }

        const reference = `withdrawal-${userId}-${Date.now()}`

        const withdrawalRecord = await tx.withdrawal.create({
            data: {
              userId,
              walletId: wallet.id,
              amount,
              status: WithdrawalStatus.pending,  // Use enum directly
              reference,
              createdAt: new Date(),
            },
          });
      
        return withdrawalRecord
    })
    return withdrawal
}

export const processWithdrawal = async(withdrawalId: string)=>{
    const withdrawal = await prisma.withdrawal.findUnique({
        where: {id: withdrawalId},
        include :{
            user: {select: {id: true, email: true}},
            wallet: {select: {id: true}}
        }
    })
    if(!withdrawal) throw new Error("Withdrawal not found")
    if(withdrawal.status== WithdrawalStatus.completed ) throw new Error("Withdrawal already processed")
    const bankDetails = await prisma.bankDetail.findUnique({
    
        where: {userId: withdrawal.user.id}
    })

    const jobPayload = {
        withdrawalId,
        userId: withdrawal.user.id,
        amount: withdrawal.amount,
        walletId: withdrawal.wallet.id,
        reference: withdrawal.reference,
        bankDetails
    }

    await publishToQueue(jobPayload, "withdrawalQueue")

    return {message: "Withdrawal processing initiated"}

}