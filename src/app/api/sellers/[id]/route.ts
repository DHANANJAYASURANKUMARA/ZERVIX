import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { calculateSellerLevel } from '@/lib/seller';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const db = getDb();

        // Recalculate level on fetch (for demo purposes)
        try { calculateSellerLevel(id); } catch (e) { }

        // Get User
        // Note: Using broad select, ensure no sensitive data leaks.
        // In db.ts, password is in users table, so we must select specific columns.
        const user = db.prepare(`
            SELECT id, name, image, bio, skills, languages, country, 
                   sellerLevel, responseTime, memberSince, createdAt,
                   (SELECT COUNT(*) FROM reviews r JOIN gigs g ON r.gigId = g.id WHERE g.sellerId = users.id) as reviewCount,
                   (SELECT AVG(r.rating) FROM reviews r JOIN gigs g ON r.gigId = g.id WHERE g.sellerId = users.id) as avgRating
            FROM users 
            WHERE id = ?
        `).get(id) as any;

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get Gigs
        const gigs = db.prepare(`
            SELECT id, title, image, price, category, rating, 
                   (SELECT MIN(price) FROM gig_tiers WHERE gigId = gigs.id) as startingPrice,
                   (SELECT COUNT(*) FROM reviews WHERE gigId = gigs.id) as reviewCount,
                   (SELECT AVG(rating) FROM reviews WHERE gigId = gigs.id) as avgRating
            FROM gigs 
            WHERE sellerId = ? AND status = 'ACTIVE'
        `).all(id);

        // Get Reviews (Limit to recent 20)
        const reviews = db.prepare(`
            SELECT r.*, u.name as userName, u.image as userImage 
            FROM reviews r 
            JOIN users u ON r.userId = u.id 
            JOIN gigs g ON r.gigId = g.id
            WHERE g.sellerId = ?
            ORDER BY r.createdAt DESC
            LIMIT 20
        `).all(id);

        // Parse JSON fields
        const parsedUser = {
            ...user,
            skills: user.skills ? JSON.parse(user.skills) : [],
            languages: user.languages ? JSON.parse(user.languages) : [],
        };

        return NextResponse.json({
            user: parsedUser,
            gigs,
            reviews
        });

    } catch (error: unknown) {
        // console.error(error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
