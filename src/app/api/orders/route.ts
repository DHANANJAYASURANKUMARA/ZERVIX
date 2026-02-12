import { NextRequest, NextResponse } from 'next/server';
import getDb, { generateId } from '@/lib/db';

// POST create order
export async function POST(request: NextRequest) {
    try {
        const { buyerId, gigId, total } = await request.json();

        if (!buyerId || !gigId || !total) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = getDb();
        const id = generateId();

        db.prepare(
            'INSERT INTO orders (id, buyerId, gigId, total) VALUES (?, ?, ?, ?)'
        ).run(id, buyerId, gigId, total);

        return NextResponse.json({ id, status: 'PENDING', total }, { status: 201 });
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

        const db = getDb();
        const orders = db.prepare(`
      SELECT o.*, g.title as gigTitle, g.image as gigImage, g.category
      FROM orders o
      JOIN gigs g ON o.gigId = g.id
      WHERE o.buyerId = ?
      ORDER BY o.createdAt DESC
    `).all(userId);

        return NextResponse.json(orders);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
