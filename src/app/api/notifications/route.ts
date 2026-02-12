import { NextRequest, NextResponse } from 'next/server';
import getDb, { generateId } from '@/lib/db';

// GET all notifications
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

        const db = getDb();
        const notifications = db.prepare(`
            SELECT * FROM notifications 
            WHERE userId = ? 
            ORDER BY createdAt DESC
            LIMIT 50
        `).all(userId);

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

        const db = getDb();

        if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
            const placeholders = notificationIds.map(() => '?').join(',');
            db.prepare(`UPDATE notifications SET isRead = 1 WHERE userId = ? AND id IN (${placeholders})`).run(userId, ...notificationIds);
        } else {
            // Mark all
            db.prepare('UPDATE notifications SET isRead = 1 WHERE userId = ?').run(userId);
        }

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
