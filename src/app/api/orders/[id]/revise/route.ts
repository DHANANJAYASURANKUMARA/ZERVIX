import { NextRequest, NextResponse } from 'next/server';
import getDb, { generateId } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { message, buyerId } = body;
        const db = getDb();

        if (!message || !buyerId) return NextResponse.json({ error: 'Message and Buyer ID required' }, { status: 400 });

        const revisionId = generateId();

        // 1. Create Revision
        db.prepare('INSERT INTO revisions (id, orderId, message, buyerId) VALUES (?, ?, ?, ?)').run(
            revisionId, id, message, buyerId
        );

        // 2. Update Order Status
        db.prepare('UPDATE orders SET status = ?, updatedAt = datetime("now") WHERE id = ?').run('REVISION', id);

        // 3. Log Activity
        db.prepare('INSERT INTO activity_log (id, orderId, type, message) VALUES (?, ?, ?, ?)').run(
            generateId(), id, 'REVISION', 'Buyer requested a revision'
        );

        return NextResponse.json({ success: true, revisionId });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
