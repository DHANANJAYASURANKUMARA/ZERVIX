import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const db = getDb();

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as {
            id: string; name: string; email: string; password: string; isSeller: number; role: string; image: string;
        } | undefined;

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Return user data (in production, use JWT tokens)
        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            isSeller: !!user.isSeller,
            role: user.role,
            image: user.image
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
