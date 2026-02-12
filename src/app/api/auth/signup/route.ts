import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password, isSeller } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({
            where: { email },
            select: { id: true }
        });

        if (existing) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name: name || '',
                email,
                password: hashedPassword,
                isSeller: !!isSeller,
                role: isSeller ? 'SELLER' : 'BUYER'
            }
        });

        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            isSeller: user.isSeller,
            role: user.role
        }, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
