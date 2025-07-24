
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export async function GET(request:NextRequest) {
    try {
        const videos = await prisma.video.findMany({
            orderBy: {createdAt:"desc"}
        })

        return NextResponse.json(videos)
        
    } catch (error) {
        return NextResponse.json({
            error:'error while fetching videos',
            status:500
        })
    }
    finally{
        prisma.$disconnect()
    }
}