import { NextRequest, NextResponse } from 'next/server';
import getDb, { generateId } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { message, files } = body;
        const db = getDb();

        if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

        const deliveryId = generateId();

        // 1. Create Delivery
        db.prepare('INSERT INTO deliveries (id, orderId, message, files, status) VALUES (?, ?, ?, ?, ?)').run(
            deliveryId, id, message, JSON.stringify(files || []), 'PENDING'
        );

        // 2. Update Order Status
        db.prepare('UPDATE orders SET status = ?, updatedAt = datetime("now") WHERE id = ?').run('DELIVERED', id);

        // 3. Log Activity
        db.prepare('INSERT INTO activity_log (id, orderId, type, message) VALUES (?, ?, ?, ?)').run(
            generateId(), id, 'DELIVERY', 'Seller delivered the work'
        );

        return NextResponse.json({ success: true, deliveryId });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
