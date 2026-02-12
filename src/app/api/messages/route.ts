import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { conversationId, content, senderId } = body;

        if (!conversationId || !content || !senderId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Insert message and update conversation in a transaction
        const message = await prisma.$transaction([
            prisma.message.create({
                data: {
                    conversationId,
                    senderId,
                    content,
                    isRead: false
                }
            }),
            prisma.conversation.update({
                where: { id: conversationId },
                data: {
                    lastMessage: content,
                    lastMessageAt: new Date()
                }
            })
        ]);

        return NextResponse.json({ success: true, id: message[0].id });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
