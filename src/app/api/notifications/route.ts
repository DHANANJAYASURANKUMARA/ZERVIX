import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

// GET all notifications
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return NextResponse.json(notifications);

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// PATCH mark as read
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, notificationIds } = body; // If no IDs, mark all

        if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

        if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
            await prisma.notification.updateMany({
                where: {
                    userId,
                    id: { in: notificationIds }
                },
                data: { isRead: true }
            });
        } else {
            // Mark all
            await prisma.notification.updateMany({
                where: { userId },
                data: { isRead: true }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
