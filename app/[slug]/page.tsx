import { notFound } from 'next/navigation';
import { getRestaurantBySlug } from '@/lib/restaurant';
import MenuPage from '@/components/menu/menu-page';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function RestaurantPage({ params }: PageProps) {
  const restaurant = await getRestaurantBySlug(params.slug);

  if (!restaurant) {
    notFound();
  }

  return <MenuPage restaurant={restaurant} />;
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
