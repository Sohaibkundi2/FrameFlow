import { auth } from '@clerk/nextjs/server';
import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient()

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

interface cloudinaryUploadResult {
    public_id: string,
    bytes: number,
    duration?: number,
    [key: string]: any,
}

export async function POST(request: NextRequest) {

    try {

        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({
                error: "unAuthorized request",
                status: 401
            })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File || null
        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const originalSize = formData.get('originalSize') as string

        if (!file) {
            return NextResponse.json({
                error: "file is missing",
                status: 400
            })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const result = await new Promise<cloudinaryUploadResult>(
            (resolve, reject) => {

                const uploadSteam = cloudinary.uploader.upload_stream(
                    {
                        resource_type: "video",
                        folder: "cloudinary-saas-video",
                        transformation: [
                            { quality: 'auto', fetch_format: 'mp4' }
                        ]
                    },
                    (error, result) => {
                        if (error) reject(error)
                        else resolve(result as cloudinaryUploadResult)
                    }
                )
                uploadSteam.end(buffer)
            }
        )

        const video = await prisma.video.create({
            data: {
                title,
                description,
                publicID: result.public_id,
                originalSize: originalSize,
                compressedSize: String(result.bytes),
                duration: result.duration || 0
            }

        })

        return NextResponse.json(video)
    } catch (error) {
        console.log('error while uploading the file ', error)
        return NextResponse.json({
            error: "Error while uploading the file",
            status: 500
        })
    } finally {
        await prisma.$disconnect();
    }

}