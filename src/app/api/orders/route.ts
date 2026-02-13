import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

// POST create order
export async function POST(request: NextRequest) {
    try {
        const { buyerId, gigId, total } = await request.json();

        if (!buyerId || !gigId || !total) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const order = await prisma.order.create({
            data: {
                buyerId,
                gigId,
                total,
                status: 'PENDING'
            }
        });

        return NextResponse.json({ id: order.id, status: order.status, total: order.total }, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// GET orders for a user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        const orders = await prisma.order.findMany({
            where: {
                buyerId: userId
            },
            include: {
                gig: {
                    select: {
                        title: true,
                        image: true,
                        category: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const formattedOrders = orders.map((o: any) => ({
            ...o,
            gigTitle: o.gig.title,
            gigImage: o.gig.image,
            category: o.gig.category
        }));

        return NextResponse.json(formattedOrders);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
