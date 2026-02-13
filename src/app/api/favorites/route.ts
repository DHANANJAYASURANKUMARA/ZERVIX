import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

        const favorites = await prisma.favorite.findMany({
            where: { userId },
            include: {
                gig: {
                    include: {
                        seller: {
                            select: {
                                name: true,
                                image: true
                            }
                        },
                        reviews: {
                            select: {
                                rating: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedFavorites = favorites.map((f: any) => {
            const ratings = f.gig.reviews.map((r: { rating: number }) => r.rating);
            const avgRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;
            return {
                ...f,
                title: f.gig.title,
                image: f.gig.image,
                price: f.gig.price,
                category: f.gig.category,
                avgRating,
                reviewCount: f.gig.reviews.length,
                sellerName: f.gig.seller.name,
                sellerImage: f.gig.seller.image
            };
        });

        return NextResponse.json(formattedFavorites);

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, gigId } = body;

        if (!userId || !gigId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        // Check if exists
        const existing = await prisma.favorite.findUnique({
            where: {
                userId_gigId: { userId, gigId }
            }
        });

        if (existing) {
            await prisma.favorite.delete({
                where: {
                    userId_gigId: { userId, gigId }
                }
            });
            return NextResponse.json({ action: 'removed' });
        } else {
            await prisma.favorite.create({
                data: { userId, gigId }
            });
            return NextResponse.json({ action: 'added' });
        }

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
