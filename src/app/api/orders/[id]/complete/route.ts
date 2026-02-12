import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        await prisma.$transaction([
            // 1. Update Order Status
            prisma.order.update({
                where: { id },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                    updatedAt: new Date()
                }
            }),
            // 2. Log Activity
            prisma.activityLog.create({
                data: {
                    orderId: id,
                    type: 'COMPLETED',
                    message: 'Order completed by buyer'
                }
            })
        ]);

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
