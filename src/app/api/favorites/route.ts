import { NextRequest, NextResponse } from 'next/server';
import getDb, { generateId } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

        const db = getDb();
        const favorites = db.prepare(`
            SELECT f.*, g.title, g.image, g.price, g.category, 
                   (SELECT AVG(rating) FROM reviews WHERE gigId = g.id) as avgRating,
                   (SELECT COUNT(*) FROM reviews WHERE gigId = g.id) as reviewCount,
                   u.name as sellerName, u.image as sellerImage
            FROM favorites f
            JOIN gigs g ON f.gigId = g.id
            JOIN users u ON g.sellerId = u.id
            WHERE f.userId = ?
            ORDER BY f.createdAt DESC
        `).all(userId);

        return NextResponse.json(favorites);

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

        const db = getDb();

        // Check if exists
        const existing = db.prepare('SELECT * FROM favorites WHERE userId = ? AND gigId = ?').get(userId, gigId);

        if (existing) {
            db.prepare('DELETE FROM favorites WHERE userId = ? AND gigId = ?').run(userId, gigId);
            return NextResponse.json({ action: 'removed' });
        } else {
            const id = generateId();
            db.prepare('INSERT INTO favorites (id, userId, gigId) VALUES (?, ?, ?)').run(id, userId, gigId);
            // Notify seller? (Maybe later)
            return NextResponse.json({ action: 'added' });
        }

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
