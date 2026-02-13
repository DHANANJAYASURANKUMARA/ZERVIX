import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

// GET all gigs with optional filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const type = searchParams.get('type'); // 'autocomplete' or default
        const queryParam = searchParams.get('query'); // for autocomplete

        if (type === 'autocomplete' && queryParam) {
            // Autocomplete logic
            const suggestions = await prisma.gig.findMany({
                where: {
                    title: {
                        contains: queryParam,
                        mode: 'insensitive'
                    },
                    status: 'ACTIVE'
                },
                select: {
                    title: true
                },
                distinct: ['title'],
                take: 5
            });

            return NextResponse.json(suggestions.map((s: { title: string }) => ({ text: s.title, type: 'gig' })));
        }

        const category = searchParams.get('category');
        const subcategory = searchParams.get('subcategory');
        const location = searchParams.get('location');
        const search = searchParams.get('search');
        const sort = searchParams.get('sort') || 'newest';
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const sellerLevel = searchParams.get('sellerLevel');
        const deliveryTime = searchParams.get('deliveryTime');
        const tag = searchParams.get('tag');

        const where: any = {
            status: 'ACTIVE'
        };

        if (category && category !== 'All') {
            where.category = category;
        }
        if (subcategory && subcategory !== 'All') {
            where.subcategory = subcategory;
        }
        if (location) {
            where.location = { contains: location, mode: 'insensitive' };
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (tag) {
            where.tags = { contains: tag, mode: 'insensitive' };
        }
        if (sellerLevel) {
            where.seller = { sellerLevel };
        }

        // Handle price filters (lowest tier price)
        if (minPrice || maxPrice) {
            where.tiers = {
                some: {
                    price: {
                        gte: minPrice ? Number(minPrice) : undefined,
                        lte: maxPrice ? Number(maxPrice) : undefined
                    }
                }
            };
        }

        if (deliveryTime) {
            where.tiers = {
                ...where.tiers,
                some: {
                    ...where.tiers?.some,
                    delivery: { lte: Number(deliveryTime) }
                }
            };
        }

        let orderBy: any = { createdAt: 'desc' };
        if (sort === 'price_low') orderBy = { price: 'asc' }; // Simplified, ideally min(tiers.price)
        else if (sort === 'price_high') orderBy = { price: 'desc' };
        else if (sort === 'rating') orderBy = { createdAt: 'desc' }; // Complex in Prisma without aggregate sort
        else if (sort === 'best_selling') orderBy = { ordersCount: 'desc' };

        const gigs = await prisma.gig.findMany({
            where,
            include: {
                seller: {
                    select: {
                        name: true,
                        image: true,
                        sellerLevel: true
                    }
                },
                reviews: {
                    select: {
                        rating: true
                    }
                },
                tiers: {
                    orderBy: {
                        price: 'asc'
                    },
                    take: 1
                }
            },
            orderBy
        });

        // Format to match old output
        const formattedGigs = gigs.map((gig: any) => {
            const ratings = gig.reviews.map((r: { rating: number }) => r.rating);
            const avgRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;
            return {
                ...gig,
                sellerName: gig.seller.name,
                sellerImage: gig.seller.image,
                sellerLevel: gig.seller.sellerLevel,
                avgRating,
                reviewCount: gig.reviews.length,
                startingPrice: gig.tiers[0]?.price || gig.price
            };
        });

        return NextResponse.json(formattedGigs);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// POST create a new gig
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            title, description, category, subcategory, price, location,
            image, sellerId, tiers, tags, gallery, faq, requirements
        } = body;

        if (!title || !description || !category || !price || !sellerId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const gig = await prisma.gig.create({
            data: {
                title,
                description,
                category,
                subcategory: subcategory || '',
                price,
                location: location || null,
                image: image || null,
                sellerId,
                tags: JSON.stringify(tags || []),
                gallery: JSON.stringify(gallery || []),
                faq: JSON.stringify(faq || []),
                requirements: JSON.stringify(requirements || []),
                status: 'ACTIVE',
                ordersCount: 0,
                tiers: {
                    create: tiers?.map((tier: any) => ({
                        name: tier.name,
                        title: tier.title || tier.name,
                        description: tier.description || '',
                        price: tier.price,
                        delivery: tier.delivery,
                        revisions: tier.revisions || 1,
                        features: typeof tier.features === 'string' ? tier.features : JSON.stringify(tier.features)
                    })) || []
                }
            }
        });

        return NextResponse.json({ id: gig.id, title, category, price }, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
