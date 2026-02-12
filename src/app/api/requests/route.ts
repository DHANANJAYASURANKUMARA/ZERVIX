import { NextRequest, NextResponse } from 'next/server';
import getDb, { generateId } from '@/lib/db';

// GET all open requests (for Sellers to see)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        const db = getDb();
        let query = `
            SELECT r.*, u.name as buyerName, u.image as buyerImage 
            FROM buyer_requests r
            JOIN users u ON r.userId = u.id
            WHERE r.status = 'ACTIVE'
        `;
        const params: any[] = [];

        if (category) {
            query += ' AND r.category = ?';
            params.push(category);
        }

        query += ' ORDER BY r.createdAt DESC';

        const requests = db.prepare(query).all(...params);
        return NextResponse.json(requests);

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// POST create a request (for Buyers)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, description, category, budget, deliveryTime } = body;

        if (!userId || !description || !category || !budget) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = getDb();
        const id = generateId();

        db.prepare(`
            INSERT INTO buyer_requests (id, userId, description, category, budget, deliveryTime, status)
            VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
        `).run(id, userId, description, category, budget, deliveryTime);

        return NextResponse.json({ success: true, id });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
