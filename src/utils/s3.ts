import {S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl} from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({})
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME

export const generatePresignedUrl = async( key: string,expiresIn: number = 3600): Promise<string>=>{
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
    })

    return await getSignedUrl(s3Client, command, {expiresIn})
}