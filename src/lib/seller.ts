import getDb from '@/lib/db';

export function calculateSellerLevel(userId: string) {
    const db = getDb();

    // Get stats
    const stats = db.prepare(`
        SELECT 
            (SELECT COUNT(*) FROM orders WHERE sellerId = ? AND status = 'COMPLETED') as completedOrders,
            (SELECT AVG(rating) FROM reviews r JOIN gigs g ON r.gigId = g.id WHERE g.sellerId = ?) as avgRating,
            (SELECT SUM(total) FROM orders WHERE sellerId = ? AND status = 'COMPLETED') as totalEarnings
    `).get(userId, userId, userId) as any;

    const { completedOrders, avgRating, totalEarnings } = stats;
    const rating = avgRating || 0;
    const earnings = totalEarnings || 0;

    let level = 'New Seller';

    if (completedOrders >= 50 && rating >= 4.8 && earnings >= 2000) {
        level = 'Top Rated';
    } else if (completedOrders >= 20 && rating >= 4.5 && earnings >= 500) {
        level = 'Level 2';
    } else if (completedOrders >= 5 && rating >= 4.0 && earnings >= 100) {
        level = 'Level 1';
    }

    // Update user record
    db.prepare('UPDATE users SET sellerLevel = ? WHERE id = ?').run(level, userId);

    return level;
}
