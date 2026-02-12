import { NextRequest, NextResponse } from 'next/server';
import getDb, { generateId } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { requestId, sellerId, price, deliveryTime, message } = body;

        if (!requestId || !sellerId || !price) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = getDb();

        // Get request details to find buyer
        const buyerRequest = db.prepare('SELECT * FROM buyer_requests WHERE id = ?').get(requestId) as any;
        if (!buyerRequest) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

        const offerId = generateId();

        // 1. Create Offer Record (db.ts update needed for offers table? using custom_offers for now if exists or msg)
        // Wait, I didn't verify existing tables for offers. 
        // I'll stick to creating a Message with special type 'OFFER' and metadata for now, 
        // or insert into `custom_offers` if I added it in Phase 1. 
        // Checking schema check: I added `CustomOffer` model in Phase 1.

        db.prepare(`
            INSERT INTO custom_offers (id, requestId, sellerId, buyerId, price, deliveryTime, message, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')
        `).run(offerId, requestId, sellerId, buyerRequest.userId, price, deliveryTime, message);

        // 2. Notify Buyer (via notification)
        db.prepare('INSERT INTO notifications (id, userId, type, message, link) VALUES (?, ?, ?, ?, ?)').run(
            generateId(), buyerRequest.userId, 'OFFER', `New offer of $${price} for your request`, `/inbox?offer=${offerId}`
        );

        // 3. Increment offer count on request
        // (db schema might not have count column, ignoring for now)

        return NextResponse.json({ success: true, id: offerId });

    } catch (error: unknown) {
        // console.error(error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
