import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const db = getDb();

        const gig = db.prepare(`
      SELECT g.*, u.name as sellerName, u.sellerLevel
      FROM gigs g JOIN users u ON g.sellerId = u.id
      WHERE g.id = ?
    `).get(id) as Record<string, unknown> | undefined;

        if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });

        const tiers = db.prepare('SELECT * FROM gig_tiers WHERE gigId = ? ORDER BY price ASC').all(id) as Record<string, unknown>[];


        const reviews = db.prepare(`
      SELECT r.*, u.name as userName FROM reviews r
      JOIN users u ON r.userId = u.id
      WHERE r.gigId = ? ORDER BY r.createdAt DESC
    `).all(id);

        const stats = db.prepare('SELECT AVG(rating) as avgRating, COUNT(*) as reviewCount FROM reviews WHERE gigId = ?').get(id) as { avgRating: number; reviewCount: number };

        // Increment impressions
        db.prepare('UPDATE gigs SET impressions = impressions + 1 WHERE id = ?').run(id);

        return NextResponse.json({
            ...gig,
            tiers: tiers.map((t: Record<string, unknown>) => ({
                ...t,
                features: typeof t.features === 'string' ? JSON.parse(t.features as string) : t.features
            })),
            reviews,
            avgRating: stats.avgRating,
            reviewCount: stats.reviewCount
        });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
