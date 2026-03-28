import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { ArrowLeft, ExternalLink, Package } from 'lucide-react'

export default async function CardapioPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect('/auth/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      restaurants: {
        orderBy: { createdAt: 'asc' },
        include: {
          menuItems: {
            include: { category: true },
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  })

  const restaurant = user?.restaurants?.[0]
  const menuItems = restaurant?.menuItems || []

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Todos os itens do cardápio</h1>
              <p className="text-sm text-gray-500 mt-1">
                {restaurant?.name ? `Restaurante: ${restaurant.name}` : 'Restaurante não encontrado'}
              </p>
            </div>
          </div>

          {restaurant?.slug && (
            <Link
              href={`/${restaurant.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Ver cardápio público
            </Link>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Itens cadastrados</h2>
            <span className="text-sm text-gray-500">{menuItems.length} item(ns)</span>
          </div>

          {menuItems.length === 0 ? (
            <div className="p-10 text-center">
              <Package className="w-10 h-10 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Nenhum item cadastrado no cardápio.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[70vh] overflow-y-scroll">
              {menuItems.map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={
                          item.image.startsWith('/')
                            ? item.image
                            : item.image.startsWith('http')
                              ? item.image
                              : `/api/image?key=${encodeURIComponent(item.image)}`
                        }
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                    <p className="text-sm text-gray-500 truncate">{item.category?.name || 'Sem categoria'}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900">R$ {Number(item.price).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{item.isActive ? 'Ativo' : 'Inativo'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
