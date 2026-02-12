import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all open requests (for Sellers to see)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        const where: any = { status: 'OPEN' };
        if (category) {
            where.category = category;
        }

        const requests = await prisma.buyerRequest.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedRequests = requests.map((r: any) => ({
            ...r,
            buyerName: r.user.name,
            buyerImage: r.user.image
        }));

        return NextResponse.json(formattedRequests);

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// POST create a request (for Buyers)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, description, title, category, budget, deliveryDays } = body;

        if (!userId || !description || !category || !budget) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newRequest = await prisma.buyerRequest.create({
            data: {
                buyerId: userId,
                title: title || description.substring(0, 50),
                description,
                category,
                budget: parseFloat(budget),
                deliveryDays: deliveryDays ? parseInt(deliveryDays) : 7,
                status: 'OPEN'
            }
        });

        return NextResponse.json({ success: true, id: newRequest.id });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
