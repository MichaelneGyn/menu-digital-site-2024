import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

async function setupUser() {
  try {
    // Update password for your admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'michaeldouglasqueiroz@gmail.com' },
      update: {
        password: hashedPassword,
      },
      create: {
        email: 'michaeldouglasqueiroz@gmail.com',
        name: 'Michael Douglas Queiroz',
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
    });

    // Delete existing test user if exists
    await prisma.user.deleteMany({
      where: { email: 'john@doe.com' }
    });

    // Create test user
    const testHashedPassword = await bcrypt.hash('johndoe123', 10);
    
    const testUser = await prisma.user.create({
      data: {
        email: 'john@doe.com',
        name: 'João Silva',
        password: testHashedPassword,
        role: UserRole.STAFF,
      },
    });

    // Create restaurants
    const adminRestaurant = await prisma.restaurant.upsert({
      where: { slug: 'meu-restaurante' },
      update: {
        userId: adminUser.id,
      },
      create: {
        name: 'Meu Restaurante',
        slug: 'meu-restaurante',
        userId: adminUser.id,
      },
    });

    const testRestaurant = await prisma.restaurant.upsert({
      where: { slug: 'di-sarda-pizzaria' },
      update: {},
      create: {
        name: 'Di Sarda Pizzaria',
        slug: 'di-sarda-pizzaria',
        userId: testUser.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Users created successfully!',
      admin: {
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
      testUser: {
        email: testUser.email,
        name: testUser.name,
        role: testUser.role,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return setupUser();
}

export async function POST() {
  return setupUser();
}
