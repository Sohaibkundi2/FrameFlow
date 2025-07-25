import { auth } from '@clerk/nextjs/server';
import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

interface cloudinaryUploadResult {
    public_id: string;
    [key: string]: any
}

export async function POST(request: NextRequest) {
    const { userId } = await auth()

    if (!userId) {
        return NextResponse.json({
            error: "unAuthorized request",
            status: 401
        })
    }

    try {

        const formData = await request.formData()
        const file = formData.get('file') as File || null

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
                    { folder: "cloudinary-saas-images" },
                    (error, result) => {
                        if (error) reject(error)
                        else resolve(result as cloudinaryUploadResult)
                    }
                )
                uploadSteam.end(buffer)
            }
        )

        return NextResponse.json({
            publicId: result.public_id,
        }, { status: 200 })

    } catch (error) {
        console.log('error while uploading the image ', error)
        return NextResponse.json({
            error: "Error while uploading the image",
            status: 500
        })
    }
}