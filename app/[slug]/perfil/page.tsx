import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, MessageCircle, Store } from 'lucide-react';
import { getRestaurantBySlug } from '@/lib/restaurant';
import { resolvePreferredImageSource } from '@/lib/utils';

interface PageProps {
  params: {
    slug: string;
  };
}

export const revalidate = 10;

export default async function PerfilPage({ params }: PageProps) {
  const restaurant = await getRestaurantBySlug(params.slug);

  if (!restaurant) {
    notFound();
  }

  const logoSource = resolvePreferredImageSource(restaurant.logoUrl, restaurant.logo);
  const cleanWhatsapp = restaurant.whatsapp?.replace(/\D/g, '') || '';
  const whatsappHref = cleanWhatsapp ? `https://wa.me/${cleanWhatsapp}` : '';

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-4">
        <Link
          href={`/${restaurant.slug}`}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao cardapio
        </Link>

        <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-2xl bg-gray-100 flex items-center justify-center shrink-0">
              {logoSource ? (
                <img src={logoSource} alt={`Logo de ${restaurant.name}`} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-gray-400">
                  {restaurant.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 break-words">{restaurant.name}</h1>
              <p className="mt-1 text-sm text-gray-500">{restaurant.description || 'Informacoes do estabelecimento.'}</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <Store className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <h2 className="font-semibold text-gray-900">Sobre</h2>
              <p className="text-sm text-gray-600">{restaurant.description || 'Sem descricao cadastrada.'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <h2 className="font-semibold text-gray-900">Endereco</h2>
              <p className="text-sm text-gray-600">{restaurant.address || 'Endereco nao informado.'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <h2 className="font-semibold text-gray-900">WhatsApp</h2>
              {whatsappHref ? (
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="text-sm font-medium text-green-600 hover:text-green-700">
                  {restaurant.whatsapp}
                </a>
              ) : (
                <p className="text-sm text-gray-600">WhatsApp nao informado.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
