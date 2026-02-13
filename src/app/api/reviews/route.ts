import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { gigId, orderId, userId, rating, comment, communicationRating, serviceRating, recommendRating } = body;

        if (!gigId || !userId || !rating) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx: any) => {
            // 1. Create Review
            const review = await tx.review.create({
                data: {
                    gigId,
                    orderId: orderId || null,
                    userId,
                    rating,
                    comment: comment || '',
                    communicationRating: communicationRating || rating,
                    serviceRating: serviceRating || rating,
                    recommendRating: recommendRating || rating
                }
            });

            // 2. Log Activity if Order ID present
            if (orderId) {
                await tx.activityLog.create({
                    data: {
                        orderId,
                        type: 'REVIEW',
                        message: `Buyer left a ${rating}-star review`,
                        userId
                    }
                });
            }

            return review;
        });

        return NextResponse.json({ success: true, id: result.id });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
