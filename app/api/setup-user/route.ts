import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

export async function POST() {
  try {
    // Delete existing user if exists
    await prisma.user.deleteMany({
      where: { email: 'john@doe.com' }
    });

    // Create fresh user with hashed password
    const hashedPassword = await bcrypt.hash('johndoe123', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'john@doe.com',
        name: 'João Silva',
        password: hashedPassword,
        role: UserRole.STAFF,
      },
    });

    // Create a restaurant for the user
    const restaurant = await prisma.restaurant.upsert({
      where: { slug: 'di-sarda-pizzaria' },
      update: {},
      create: {
        name: 'Di Sarda Pizzaria',
        slug: 'di-sarda-pizzaria',
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully!',
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
      restaurant: {
        name: restaurant.name,
        slug: restaurant.slug,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
