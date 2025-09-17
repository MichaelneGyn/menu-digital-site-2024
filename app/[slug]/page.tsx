
import { getRestaurantBySlug } from '@/lib/restaurant';
import { notFound } from 'next/navigation';
import MenuPage from '@/components/menu/menu-page';

export async function generateStaticParams() {
  // Retorna uma lista vazia para permitir geração dinâmica
  return [];
}

export const dynamicParams = true; // Permite gerar páginas para slugs não listados

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const restaurant = await getRestaurantBySlug(params.slug);
  
  if (!restaurant) {
    return {
      title: 'Restaurante não encontrado',
    };
  }

  return {
    title: `${restaurant.name} - Cardápio Online`,
    description: restaurant.description || `Cardápio online de ${restaurant.name}`,
  };
}

export default async function RestaurantMenuPage({ params }: { params: { slug: string } }) {
  const restaurant = await getRestaurantBySlug(params.slug);

  if (!restaurant) {
    notFound();
  }

  return <MenuPage restaurant={restaurant} />;
}
