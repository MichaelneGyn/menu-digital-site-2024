import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * Lista todos os cupons do restaurante
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Busca o usuário e seu restaurante
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        restaurants: {
          take: 1,
          include: {
            coupons: {
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        }
      }
    });

    if (!user || !user.restaurants[0]) {
      return NextResponse.json(
        { error: 'Restaurante não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(user.restaurants[0].coupons);
  } catch (error) {
    console.error('Erro ao buscar cupons:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar cupons' },
      { status: 500 }
    );
  }
}

/**
 * Cria um novo cupom
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      code,
      type,
      discount,
      description,
      minValue,
      maxUses,
      usesPerUser,
      validFrom,
      validUntil,
      isActive
    } = body;

    // Validações
    if (!code || !type || !discount) {
      return NextResponse.json(
        { error: 'Código, tipo e desconto são obrigatórios' },
        { status: 400 }
      );
    }

    if (type === 'PERCENT' && (discount < 0 || discount > 100)) {
      return NextResponse.json(
        { error: 'Desconto percentual deve ser entre 0 e 100' },
        { status: 400 }
      );
    }

    if (type === 'FIXED' && discount < 0) {
      return NextResponse.json(
        { error: 'Desconto fixo deve ser maior que 0' },
        { status: 400 }
      );
    }

    // Busca o usuário e seu restaurante
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        restaurants: { take: 1 }
      }
    });

    if (!user || !user.restaurants[0]) {
      return NextResponse.json(
        { error: 'Restaurante não encontrado' },
        { status: 404 }
      );
    }

    // Verifica se o código já existe
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Código de cupom já existe' },
        { status: 400 }
      );
    }

    // Cria o cupom
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        type,
        discount: parseFloat(discount),
        description,
        minValue: minValue ? parseFloat(minValue) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        usesPerUser: usesPerUser ? parseInt(usesPerUser) : null,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : null,
        isActive: isActive ?? true,
        restaurantId: user.restaurants[0].id
      }
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Erro ao criar cupom:', error);
    return NextResponse.json(
      { error: 'Erro ao criar cupom' },
      { status: 500 }
    );
  }
}
