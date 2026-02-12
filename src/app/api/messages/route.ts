import { NextRequest, NextResponse } from 'next/server';
import getDb, { generateId } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { conversationId, content, senderId } = body;

        if (!conversationId || !content || !senderId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = getDb();

        // Get receiver ID (the other participant)
        const conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(conversationId) as any;
        if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

        const receiverId = conversation.participant1Id === senderId ? conversation.participant2Id : conversation.participant1Id;

        const messageId = generateId();

        // Insert message
        db.prepare(`
            INSERT INTO messages (id, conversationId, senderId, receiverId, content, isRead) 
            VALUES (?, ?, ?, ?, ?, 0)
        `).run(messageId, conversationId, senderId, receiverId, content);

        // Update conversation timestamp
        db.prepare('UPDATE conversations SET updatedAt = datetime("now") WHERE id = ?').run(conversationId);

        return NextResponse.json({ success: true, id: messageId });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
