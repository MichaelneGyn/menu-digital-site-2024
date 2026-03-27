import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const { itemId } = params

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        categoryId: true,
        restaurantId: true
      }
    })

    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 })
    }

    // @ts-expect-error prisma extension model
    const customization = await prisma.categoryCustomization.findUnique({
      where: {
        categoryId_restaurantId: {
          categoryId: menuItem.categoryId,
          restaurantId: menuItem.restaurantId
        }
      },
      include: {
        extras: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' }
        }
      }
    })

    return NextResponse.json({
      extras: ((customization?.extras || []) as Array<{ id: string; name: string; price: number | string | null }>).map((extra) => ({
        id: extra.id,
        name: extra.name,
        price: Number(extra.price || 0)
      }))
    })
  } catch (error) {
    console.error('Erro ao buscar adicionais por categoria:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
