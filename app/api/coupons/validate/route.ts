import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Valida um cupom de desconto
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, restaurantId, cartTotal } = body;

    if (!code || !restaurantId) {
      return NextResponse.json(
        { error: 'Código do cupom e ID do restaurante são obrigatórios' },
        { status: 400 }
      );
    }

    // Busca o cupom
    const coupon = await prisma.coupon.findUnique({
      where: { 
        code: code.toUpperCase()
      }
    });

    if (!coupon) {
      return NextResponse.json(
        { error: 'Cupom não encontrado', valid: false },
        { status: 404 }
      );
    }

    // Validações
    const now = new Date();

    // Verifica se o cupom pertence ao restaurante
    if (coupon.restaurantId !== restaurantId) {
      return NextResponse.json(
        { error: 'Cupom não válido para este restaurante', valid: false },
        { status: 400 }
      );
    }

    // Verifica se está ativo
    if (!coupon.isActive) {
      return NextResponse.json(
        { error: 'Cupom desativado', valid: false },
        { status: 400 }
      );
    }

    // Verifica validade (data de início)
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return NextResponse.json(
        { error: 'Cupom ainda não está válido', valid: false },
        { status: 400 }
      );
    }

    // Verifica validade (data de término)
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return NextResponse.json(
        { error: 'Cupom expirado', valid: false },
        { status: 400 }
      );
    }

    // Verifica número máximo de usos
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return NextResponse.json(
        { error: 'Cupom esgotado', valid: false },
        { status: 400 }
      );
    }

    // Verifica valor mínimo do pedido
    if (coupon.minValue && cartTotal < coupon.minValue) {
      return NextResponse.json(
        { 
          error: `Pedido mínimo de R$ ${coupon.minValue.toFixed(2)} para usar este cupom`, 
          valid: false 
        },
        { status: 400 }
      );
    }

    // Calcula o desconto
    let discountAmount = 0;
    if (coupon.type === 'PERCENT') {
      discountAmount = (cartTotal * coupon.discount) / 100;
    } else if (coupon.type === 'FIXED') {
      discountAmount = coupon.discount;
    }

    // Garante que o desconto não seja maior que o total
    discountAmount = Math.min(discountAmount, cartTotal);

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        discount: coupon.discount,
        description: coupon.description
      },
      discountAmount,
      finalTotal: cartTotal - discountAmount
    });
  } catch (error) {
    console.error('Erro ao validar cupom:', error);
    return NextResponse.json(
      { error: 'Erro ao validar cupom', valid: false },
      { status: 500 }
    );
  }
}
