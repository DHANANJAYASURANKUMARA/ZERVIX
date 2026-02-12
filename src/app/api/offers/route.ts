import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { requestId, sellerId, price, deliveryDays, description } = body;

        if (!requestId || !sellerId || !price) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get request details to find buyer
        const buyerRequest = await prisma.buyerRequest.findUnique({
            where: { id: requestId }
        });

        if (!buyerRequest) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

        const result = await prisma.$transaction([
            // 1. Create Offer Record
            prisma.customOffer.create({
                data: {
                    requestId,
                    sellerId,
                    buyerId: buyerRequest.buyerId,
                    price: parseFloat(price),
                    deliveryDays: deliveryDays ? parseInt(deliveryDays) : 7,
                    description: description || 'Custom Offer',
                    status: 'PENDING'
                }
            }),
            // 2. Notify Buyer
            prisma.notification.create({
                data: {
                    userId: buyerRequest.buyerId,
                    type: 'OFFER',
                    title: 'New Offer Received',
                    message: `New offer of $${price} for your request`,
                    link: `/inbox` // Or specific link if handled
                }
            }),
            // 3. Increment offer count
            prisma.buyerRequest.update({
                where: { id: requestId },
                data: { offersCount: { increment: 1 } }
            })
        ]);

        return NextResponse.json({ success: true, id: result[0].id });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
