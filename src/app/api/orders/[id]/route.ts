import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const db = getDb();

        const order = db.prepare(`
            SELECT o.*, g.title as gigTitle, g.image as gigImage,
                   b.name as buyerName, b.image as buyerImage,
                   s.name as sellerName, s.image as sellerImage
            FROM orders o
            JOIN gigs g ON o.gigId = g.id
            JOIN users b ON o.buyerId = b.id
            JOIN users s ON o.sellerId = s.id
            WHERE o.id = ?
        `).get(id) as any;

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const deliveries = db.prepare('SELECT * FROM deliveries WHERE orderId = ? ORDER BY createdAt DESC').all(id);
        const revisions = db.prepare('SELECT * FROM revisions WHERE orderId = ? ORDER BY createdAt DESC').all(id);
        const activityLog = db.prepare('SELECT * FROM activity_log WHERE orderId = ? ORDER BY createdAt DESC').all(id);

        return NextResponse.json({
            ...order,
            requirements: order.requirements ? JSON.parse(order.requirements) : [],
            deliveries: deliveries.map((d: any) => ({ ...d, files: JSON.parse(d.files || '[]') })),
            revisions,
            activityLog
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// PATCH for simple status updates (e.g. Seller accepts order)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;
        const db = getDb();

        if (!status) return NextResponse.json({ error: 'Status required' }, { status: 400 });

        db.prepare('UPDATE orders SET status = ?, updatedAt = datetime("now") WHERE id = ?').run(status, id);

        // Log activity
        const type = 'STATUS_CHANGE';
        const message = `Order status updated to ${status}`;
        db.prepare('INSERT INTO activity_log (id, orderId, type, message) VALUES (?, ?, ?, ?)').run(
            Math.random().toString(36).substring(7), id, type, message
        );

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
