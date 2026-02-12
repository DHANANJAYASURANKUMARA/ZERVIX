import { NextRequest, NextResponse } from 'next/server';
import getDb, { generateId } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password, isSeller } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const db = getDb();

        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existing) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const id = generateId();

        db.prepare(
            'INSERT INTO users (id, name, email, password, isSeller, role) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(id, name || '', email, hashedPassword, isSeller ? 1 : 0, isSeller ? 'SELLER' : 'BUYER');

        return NextResponse.json({
            id,
            name,
            email,
            isSeller: !!isSeller,
            role: isSeller ? 'SELLER' : 'BUYER'
        }, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
