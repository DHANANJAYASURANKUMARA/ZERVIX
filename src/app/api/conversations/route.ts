import { NextRequest, NextResponse } from 'next/server';
import getDb, { generateId } from '@/lib/db';

// GET all conversations for a user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

        const db = getDb();

        // Fetch conversations where user is participant
        // We join with the other user to get their details
        // We also want the last message
        const conversations = db.prepare(`
            SELECT c.*, 
                   u.id as otherUserId, u.name as otherUserName, u.image as otherUserImage,
                   (SELECT content FROM messages m WHERE m.conversationId = c.id ORDER BY m.createdAt DESC LIMIT 1) as lastMessage,
                   (SELECT createdAt FROM messages m WHERE m.conversationId = c.id ORDER BY m.createdAt DESC LIMIT 1) as lastMessageAt,
                   (SELECT COUNT(*) FROM messages m WHERE m.conversationId = c.id AND m.receiverId = ? AND m.isRead = 0) as unreadCount
            FROM conversations c
            JOIN users u ON (c.participant1Id = u.id OR c.participant2Id = u.id)
            WHERE (c.participant1Id = ? OR c.participant2Id = ?) AND u.id != ?
            ORDER BY lastMessageAt DESC
        `).all(userId, userId, userId, userId);

        return NextResponse.json(conversations);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// POST create or get existing conversation
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { participant1Id, participant2Id } = body;

        if (!participant1Id || !participant2Id) {
            return NextResponse.json({ error: 'Participants required' }, { status: 400 });
        }

        const db = getDb();

        // Check if conversation exists
        let conversation = db.prepare(`
            SELECT * FROM conversations 
            WHERE (participant1Id = ? AND participant2Id = ?) 
               OR (participant1Id = ? AND participant2Id = ?)
        `).get(participant1Id, participant2Id, participant2Id, participant1Id);

        if (!conversation) {
            const id = generateId();
            db.prepare('INSERT INTO conversations (id, participant1Id, participant2Id) VALUES (?, ?, ?)').run(
                id, participant1Id, participant2Id
            );
            conversation = { id, participant1Id, participant2Id };
        }

        return NextResponse.json(conversation);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
