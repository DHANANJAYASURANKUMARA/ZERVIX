import { NextRequest, NextResponse } from 'next/server';
import getDb, { generateId } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
    try {
        const { conversationId } = await params;
        const userId = request.nextUrl.searchParams.get('userId');
        const db = getDb();

        const messages = db.prepare('SELECT * FROM messages WHERE conversationId = ? ORDER BY createdAt ASC').all(conversationId);

        // Mark messages as read
        if (userId) {
            db.prepare('UPDATE messages SET isRead = 1 WHERE conversationId = ? AND senderId != ? AND isRead = 0').run(conversationId, userId);
        }

        return NextResponse.json({ messages });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
    try {
        const { conversationId } = await params;
        const { senderId, content } = await request.json();
        if (!senderId || !content) return NextResponse.json({ error: 'senderId and content required' }, { status: 400 });

        const db = getDb();
        const id = generateId();
        db.prepare('INSERT INTO messages (id, conversationId, senderId, content) VALUES (?, ?, ?, ?)').run(id, conversationId, senderId, content);
        db.prepare("UPDATE conversations SET lastMessage = ?, lastMessageAt = datetime('now') WHERE id = ?").run(content, conversationId);

        return NextResponse.json({ id });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
