import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId'); // Current user ID to mark messages as read

        const db = getDb();

        // Mark messages as read if userId is provided
        if (userId) {
            db.prepare('UPDATE messages SET isRead = 1 WHERE conversationId = ? AND receiverId = ?').run(id, userId);
        }

        const messages = db.prepare(`
            SELECT m.*, u.name as senderName, u.image as senderImage
            FROM messages m
            JOIN users u ON m.senderId = u.id
            WHERE m.conversationId = ?
            ORDER BY m.createdAt ASC
        `).all(id);

        return NextResponse.json(messages);

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
