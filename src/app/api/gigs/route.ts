import { NextRequest, NextResponse } from 'next/server';
import getDb, { generateId } from '@/lib/db';

// GET all gigs with optional filters
// GET all gigs with optional filters
export async function GET(request: NextRequest) {
    try {
        const db = getDb();
        const { searchParams } = new URL(request.url);

        const type = searchParams.get('type'); // 'autocomplete' or default
        const queryParam = searchParams.get('query'); // for autocomplete

        if (type === 'autocomplete' && queryParam) {
            // Autocomplete logic
            const suggestions = db.prepare(`
                SELECT DISTINCT title as text, 'gig' as type FROM gigs WHERE title LIKE ? LIMIT 5
            `).all(`%${queryParam}%`);

            // Also search tags (need better logic for comma separated, but for now simple LIKE)
            // Ideally we'd have a tags table, but parsing strings in SQL is hard.
            // Simplified: just return titles.
            return NextResponse.json(suggestions);
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

        let query = `
      SELECT g.*, u.name as sellerName, u.image as sellerImage, u.sellerLevel,
             (SELECT AVG(r.rating) FROM reviews r WHERE r.gigId = g.id) as avgRating,
             (SELECT COUNT(*) FROM reviews r WHERE r.gigId = g.id) as reviewCount,
             (SELECT MIN(gt.price) FROM gig_tiers gt WHERE gt.gigId = g.id) as startingPrice
      FROM gigs g
      JOIN users u ON g.sellerId = u.id
      WHERE g.status = 'ACTIVE'
    `;
        const params: (string | number)[] = [];

        if (category && category !== 'All') {
            query += ' AND g.category = ?';
            params.push(category);
        }
        if (subcategory && subcategory !== 'All') {
            query += ' AND g.subcategory = ?';
            params.push(subcategory);
        }
        if (location) {
            query += ' AND g.location LIKE ?';
            params.push(`%${location}%`);
        }
        if (search) {
            query += ' AND (g.title LIKE ? OR g.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        if (tag) {
            query += ' AND g.tags LIKE ?';
            params.push(`%${tag}%`);
        }
        if (sellerLevel) {
            query += ' AND u.sellerLevel = ?';
            params.push(sellerLevel);
        }
        if (minPrice) {
            // Check against gig price OR lowest tier price
            query += ' AND (g.price >= ? OR (SELECT MIN(price) FROM gig_tiers WHERE gigId = g.id) >= ?)';
            params.push(Number(minPrice), Number(minPrice));
        }
        if (maxPrice) {
            query += ' AND (g.price <= ? OR (SELECT MIN(price) FROM gig_tiers WHERE gigId = g.id) <= ?)';
            params.push(Number(maxPrice), Number(maxPrice));
        }
        if (deliveryTime) {
            // Check if ANY tier has delivery <= deliveryTime
            query += ' AND EXISTS (SELECT 1 FROM gig_tiers gt WHERE gt.gigId = g.id AND gt.delivery <= ?)';
            params.push(Number(deliveryTime));
        }

        if (sort === 'price_low') query += ' ORDER BY startingPrice ASC';
        else if (sort === 'price_high') query += ' ORDER BY startingPrice DESC';
        else if (sort === 'rating') query += ' ORDER BY avgRating DESC';
        else if (sort === 'best_selling') query += ' ORDER BY g.ordersCount DESC';
        else query += ' ORDER BY g.createdAt DESC';

        const gigs = db.prepare(query).all(...params);

        return NextResponse.json(gigs);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// POST create a new gig
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

        const db = getDb();
        const gigId = generateId();

        db.prepare(`
            INSERT INTO gigs (
                id, title, description, category, subcategory, price, location, image, sellerId, 
                tags, gallery, faq, requirements, status, ordersCount
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 0)
        `).run(
            gigId,
            title,
            description,
            category,
            subcategory || '',
            price,
            location || null,
            image || null,
            sellerId,
            JSON.stringify(tags || []),
            JSON.stringify(gallery || []),
            JSON.stringify(faq || []),
            JSON.stringify(requirements || [])
        );

        // Insert tiers if provided
        if (tiers && Array.isArray(tiers)) {
            const insertTier = db.prepare(
                'INSERT INTO gig_tiers (id, name, title, description, price, delivery, revisions, features, gigId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );

            for (const tier of tiers) {
                insertTier.run(
                    generateId(),
                    tier.name,
                    tier.title || tier.name,
                    tier.description || '',
                    tier.price,
                    tier.delivery,
                    tier.revisions || 1,
                    typeof tier.features === 'string' ? tier.features : JSON.stringify(tier.features),
                    gigId
                );
            }
        }

        return NextResponse.json({ id: gigId, title, category, price }, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
