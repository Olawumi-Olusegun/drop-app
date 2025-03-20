import prisma from "../config/db"
import { verifyTransaction } from "../utils/paystackhelpers"


export const saveCardDetails = async(userId: string, reference: string)=>{

    const data = await verifyTransaction(reference)

    console.log(data)
  

    const updatedUser = await prisma.user.update({
        where: {id: userId},
        data: {savedCardAuthCode: data.authorization.authorization_code}
    })

    return updatedUser
}


export const saveOrUpateBankDetails = async (
    userId: string,
    accountNumber: string,
    bankCode: string,
    accountName?: string

)=>{


    const existingDetails = await prisma.bankDetail.findUnique({
        where: {userId}
    })

    if(existingDetails){
        return await prisma.bankDetail.update({
            where: {userId},
            data: {accountNumber, bankCode, accountName}
        })
    }

    return await prisma.bankDetail.create({
        data: {userId, accountNumber, bankCode, accountName}
    })
}