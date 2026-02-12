import { NextRequest, NextResponse } from 'next/server';
import getDb, { generateId } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const db = getDb();

        // 1. Update Order Status
        db.prepare('UPDATE orders SET status = ?, completedAt = datetime("now"), updatedAt = datetime("now") WHERE id = ?').run('COMPLETED', id);

        // 2. Log Activity
        db.prepare('INSERT INTO activity_log (id, orderId, type, message) VALUES (?, ?, ?, ?)').run(
            generateId(), id, 'COMPLETED', 'Order completed by buyer'
        );

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
