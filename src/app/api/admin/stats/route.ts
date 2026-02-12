import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // TODO: specific admin auth check here (skipping for MVP/demo simplicity, assuming accessible primarily by authorized users or protected by middleware)

        const db = getDb();

        const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
        const gigsCount = db.prepare('SELECT COUNT(*) as count FROM gigs').get() as any;
        const ordersCount = db.prepare('SELECT COUNT(*) as count FROM orders').get() as any;
        const totalRevenue = db.prepare("SELECT SUM(total) as total FROM orders WHERE status = 'COMPLETED'").get() as any;

        const recentOrders = db.prepare(`
            SELECT o.id, o.total, o.status, o.createdAt, u.name as buyerName 
            FROM orders o
            JOIN users u ON o.buyerId = u.id
            ORDER BY o.createdAt DESC LIMIT 5
        `).all();

        return NextResponse.json({
            users: usersCount.count,
            gigs: gigsCount.count,
            orders: ordersCount.count,
            revenue: totalRevenue.total || 0,
            recentOrders
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
