import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { message, files } = body;

        if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

        const result = await prisma.$transaction([
            // 1. Create Delivery
            prisma.delivery.create({
                data: {
                    orderId: id,
                    message,
                    files: JSON.stringify(files || []),
                    status: 'PENDING'
                }
            }),
            // 2. Update Order Status
            prisma.order.update({
                where: { id },
                data: {
                    status: 'DELIVERED',
                    updatedAt: new Date()
                }
            }),
            // 3. Log Activity
            prisma.activityLog.create({
                data: {
                    orderId: id,
                    type: 'DELIVERY',
                    message: 'Seller delivered the work'
                }
            })
        ]);

        return NextResponse.json({ success: true, deliveryId: result[0].id });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
