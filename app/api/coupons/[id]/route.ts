import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * Atualiza um cupom existente
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await req.json();

    // Verifica se o cupom existe e pertence ao usuário
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        restaurant: {
          include: {
            user: true
          }
        }
      }
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { error: 'Cupom não encontrado' },
        { status: 404 }
      );
    }

    if (existingCoupon.restaurant.user.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    // Validações
    if (body.type === 'PERCENT' && body.discount && (body.discount < 0 || body.discount > 100)) {
      return NextResponse.json(
        { error: 'Desconto percentual deve ser entre 0 e 100' },
        { status: 400 }
      );
    }

    if (body.type === 'FIXED' && body.discount && body.discount < 0) {
      return NextResponse.json(
        { error: 'Desconto fixo deve ser maior que 0' },
        { status: 400 }
      );
    }

    // Atualiza o cupom
    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(body.code && { code: body.code.toUpperCase() }),
        ...(body.type && { type: body.type }),
        ...(body.discount !== undefined && { discount: parseFloat(body.discount) }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.minValue !== undefined && { minValue: body.minValue ? parseFloat(body.minValue) : null }),
        ...(body.maxUses !== undefined && { maxUses: body.maxUses ? parseInt(body.maxUses) : null }),
        ...(body.usesPerUser !== undefined && { usesPerUser: body.usesPerUser ? parseInt(body.usesPerUser) : null }),
        ...(body.validFrom && { validFrom: new Date(body.validFrom) }),
        ...(body.validUntil !== undefined && { validUntil: body.validUntil ? new Date(body.validUntil) : null }),
        ...(body.isActive !== undefined && { isActive: body.isActive })
      }
    });

    return NextResponse.json(updatedCoupon);
  } catch (error) {
    console.error('Erro ao atualizar cupom:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar cupom' },
      { status: 500 }
    );
  }
}

/**
 * Deleta um cupom
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Verifica se o cupom existe e pertence ao usuário
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        restaurant: {
          include: {
            user: true
          }
        }
      }
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { error: 'Cupom não encontrado' },
        { status: 404 }
      );
    }

    if (existingCoupon.restaurant.user.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    // Deleta o cupom
    await prisma.coupon.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar cupom:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar cupom' },
      { status: 500 }
    );
  }
}
