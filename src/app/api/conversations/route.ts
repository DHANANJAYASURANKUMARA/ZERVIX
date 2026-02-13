import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

// GET all conversations for a user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

        // Fetch conversations where user is participant
        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { user1Id: userId },
                    { user2Id: userId }
                ]
            },
            include: {
                user1: {
                    select: { id: true, name: true, image: true }
                },
                user2: {
                    select: { id: true, name: true, image: true }
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            },
            orderBy: {
                lastMessageAt: 'desc'
            }
        });

        const formattedConversations = conversations.map((c: any) => {
            const otherUser = c.user1Id === userId ? c.user2 : c.user1;
            const lastMessage = c.messages[0];
            return {
                ...c,
                otherUserId: otherUser.id,
                otherUserName: otherUser.name,
                otherUserImage: otherUser.image,
                lastMessage: lastMessage?.content || '',
                lastMessageAt: lastMessage?.createdAt || c.createdAt,
                unreadCount: 0 // Ideally count unread where receiver is userId
            };
        });

        return NextResponse.json(formattedConversations);
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

        // Check if conversation exists
        let conversation = await prisma.conversation.findFirst({
            where: {
                OR: [
                    { user1Id: participant1Id, user2Id: participant2Id },
                    { user1Id: participant2Id, user2Id: participant1Id }
                ]
            }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    user1Id: participant1Id,
                    user2Id: participant2Id
                }
            });
        }

        return NextResponse.json(conversation);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
