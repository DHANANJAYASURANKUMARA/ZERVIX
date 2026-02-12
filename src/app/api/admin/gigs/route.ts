import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
    try {
        const db = getDb();
        const gigs = db.prepare(`
      SELECT g.id, g.title, g.category, g.price, g.status, g.createdAt, u.name as sellerName
      FROM gigs g JOIN users u ON g.sellerId = u.id
      ORDER BY g.createdAt DESC
    `).all();
        return NextResponse.json({ gigs });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
