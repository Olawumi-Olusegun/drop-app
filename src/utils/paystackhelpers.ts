import axios from "axios"
import Response from 'express';



export const chargeSavedCard = async(
    amount: number,
    email: string,
    authCode: string,
    reference: string
): Promise<boolean> =>{

    try{
        const response = await axios.post(
            'https://api.paystack.co/transaction/charge_authorization',{
                amount,
                email,
                authorization_code: authCode,
                reference
            },
            {
                headers:{
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        )

        return response.data.data && response.data.data.status === 'success';
    }
    catch(error: any){
        console.log("Paystack charge error", error.response ? error.response.data: error.message)
        return false
    }
}

export const verifyTransaction = async ( reference: string)=>{

    try{
       
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,{
                headers:{
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
                }
                    
            },
        )

        return response.data.data
    }
    catch(error: any){
        console.log("Paystack verification error", error.response ? error.response.data: error.message)
        return false

    }
}