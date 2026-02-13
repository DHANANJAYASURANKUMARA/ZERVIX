import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const gigs = await prisma.gig.findMany({
            include: {
                seller: {
                    select: { name: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const formattedGigs = gigs.map((g: any) => ({
            ...g,
            sellerName: g.seller.name
        }));

        return NextResponse.json({ gigs: formattedGigs });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
