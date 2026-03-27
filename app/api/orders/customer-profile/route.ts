import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const normalizePhone = (phone: string) => phone.replace(/\D/g, '')

const parseDeliveryAddress = (deliveryAddress: string) => {
  const zipMatch = deliveryAddress.match(/CEP:\s*([0-9-]+)/i)
  const zipCode = zipMatch?.[1] || ''
  const withoutCep = deliveryAddress.replace(/\s*-\s*CEP:\s*[0-9-]+/i, '')

  const segments = withoutCep.split(' - ')
  const firstSegment = segments[0] || ''
  const secondSegment = segments[1] || ''

  const firstParts = firstSegment.split(',').map((part) => part.trim())
  const street = firstParts[0] || ''
  const number = firstParts[1] || ''
  const complement = firstParts.slice(2).join(', ') || ''

  const secondParts = secondSegment.split(',').map((part) => part.trim())
  const neighborhood = secondParts[0] || ''
  const city = secondParts[1] || ''

  return {
    street,
    number,
    complement,
    neighborhood,
    city,
    zipCode,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId') || ''
    const phone = searchParams.get('phone') || ''
    const normalizedPhone = normalizePhone(phone)

    if (!restaurantId || normalizedPhone.length < 10) {
      return NextResponse.json({ found: false }, { status: 200 })
    }

    const recentOrders = await prisma.order.findMany({
      where: {
        restaurantId,
        customerPhone: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: {
        customerName: true,
        customerPhone: true,
        deliveryAddress: true,
      },
    })

    const matchedOrder = recentOrders.find((order) => {
      const orderPhone = normalizePhone(order.customerPhone || '')
      return orderPhone === normalizedPhone
    })

    if (!matchedOrder) {
      return NextResponse.json({ found: false }, { status: 200 })
    }

    const parsedAddress = parseDeliveryAddress(matchedOrder.deliveryAddress || '')
    return NextResponse.json({
      found: true,
      customerName: matchedOrder.customerName || '',
      customerPhone: matchedOrder.customerPhone || phone,
      ...parsedAddress,
    })
  } catch (error) {
    console.error('Erro ao buscar perfil do cliente:', error)
    return NextResponse.json({ found: false, error: 'Erro interno' }, { status: 500 })
  }
}
