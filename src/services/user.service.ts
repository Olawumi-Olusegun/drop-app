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


