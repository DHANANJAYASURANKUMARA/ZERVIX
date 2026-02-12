import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { message, buyerId } = body;

        if (!message || !buyerId) return NextResponse.json({ error: 'Message and Buyer ID required' }, { status: 400 });

        const result = await prisma.$transaction([
            // 1. Create Revision
            prisma.revision.create({
                data: {
                    orderId: id,
                    message,
                    buyerId
                }
            }),
            // 2. Update Order Status
            prisma.order.update({
                where: { id },
                data: {
                    status: 'REVISION',
                    updatedAt: new Date()
                }
            }),
            // 3. Log Activity
            prisma.activityLog.create({
                data: {
                    orderId: id,
                    type: 'REVISION',
                    message: 'Buyer requested a revision'
                }
            })
        ]);

        return NextResponse.json({ success: true, revisionId: result[0].id });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
