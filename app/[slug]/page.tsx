import { notFound } from 'next/navigation';
import { getRestaurantBySlug } from '@/lib/restaurant';
import MenuPageModern from '@/components/menu/menu-page-modern';

interface PageProps {
  params: {
    slug: string;
  };
  searchParams: {
    viewOnly?: string;
    table?: string;
  };
}

// Revalidar a cada 10 segundos (garante que mudanças apareçam rapidamente)
export const revalidate = 10;

export default async function RestaurantPage({ params, searchParams }: PageProps) {
  const restaurant = await getRestaurantBySlug(params.slug);

  if (!restaurant) {
    notFound();
  }

  const viewOnly = searchParams.viewOnly === 'true';

  return <MenuPageModern restaurant={restaurant} viewOnly={viewOnly} />;
}

export async function generateMetadata({ params }: PageProps) {
  const restaurant = await getRestaurantBySlug(params.slug);

  if (!restaurant) {
    return {
      title: 'Restaurante não encontrado',
    };
  }

  return {
    title: `${restaurant.name} - Cardápio Digital`,
    description: restaurant.description || `Confira o cardápio do ${restaurant.name}`,
  };
}
