import { NextRequest, NextResponse } from 'next/server';
import getDb, { generateId } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { gigId, orderId, userId, rating, comment, communicationRating, serviceRating, recommendRating } = body;

        if (!gigId || !userId || !rating) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = getDb();
        const reviewId = generateId();

        // 1. Create Review
        db.prepare(`
            INSERT INTO reviews (
                id, gigId, orderId, userId, rating, comment, 
                communicationRating, serviceRating, recommendRating
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            reviewId, gigId, orderId || null, userId, rating, comment || '',
            communicationRating || rating, serviceRating || rating, recommendRating || rating
        );

        // 2. Update Gig Rating Stats
        // We recalculate average for accuracy
        const gigStats = db.prepare(`
            SELECT COUNT(*) as count, AVG(rating) as avg 
            FROM reviews WHERE gigId = ?
        `).get(gigId) as any;

        db.prepare('UPDATE gigs SET rating = ?, reviewsCount = ? WHERE id = ?').run(gigStats.avg, gigStats.count, gigId);

        // 3. Log Activity if Order ID present
        if (orderId) {
            db.prepare('INSERT INTO activity_log (id, orderId, type, message) VALUES (?, ?, ?, ?)').run(
                generateId(), orderId, 'REVIEW', `Buyer left a ${rating}-star review`
            );
        }

        return NextResponse.json({ success: true, id: reviewId });

    } catch (error: unknown) {
        // console.error(error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
