import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

        const db = getDb();

        // Calculate Earnings
        // 1. Completed Orders (Net Income = Total * 0.8)
        const completed = db.prepare(`
            SELECT SUM(total) as total FROM orders 
            WHERE sellerId = ? AND status = 'COMPLETED'
        `).get(userId) as any;

        const totalEarned = (completed.total || 0) * 0.8; // 20% platform fee

        // 2. Pending Clearance (Active/Delivered orders)
        const pending = db.prepare(`
            SELECT SUM(total) as total FROM orders 
            WHERE sellerId = ? AND (status = 'ACTIVE' OR status = 'DELIVERED' OR status = 'REVISION')
        `).get(userId) as any;

        const pendingClearance = (pending.total || 0) * 0.8;

        // 3. Withdrawn (Mock table or simplified logic - assuming 0 for now or storing on user)
        // For MVP, we can treat "Available" as TotalEarned (simplification)
        // Real system would track withdrawals.

        return NextResponse.json({
            netIncome: totalEarned,
            withdrawn: 0,
            usedForPurchases: 0,
            pendingClearance: pendingClearance,
            availableForWithdrawal: totalEarned // Simplified
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
