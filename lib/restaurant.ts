
import { prisma } from './db';
import { Restaurant, Category, MenuItem } from '@prisma/client';

// Custom types for client components (with Decimal converted to number)
export type ClientMenuItem = Omit<MenuItem, 'price' | 'originalPrice' | 'cost'> & {
  price: number;
  originalPrice: number | null;
  cost: number | null;
};

export type ClientCategory = Omit<Category, 'menuItems'> & {
  menuItems: ClientMenuItem[];
};

export type ClientRestaurant = Omit<Restaurant, 'deliveryFee' | 'minOrderValue' | 'categories'> & {
  deliveryFee: number;
  minOrderValue: number;
  categories: ClientCategory[];
};

export async function getRestaurantBySlug(slug: string): Promise<ClientRestaurant | null> {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug, isActive: true },
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            menuItems: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' }
            }
          }
        }
      }
    });
    
    if (!restaurant) return null;

    // Convert Decimal values to numbers for client components
    return {
      ...restaurant,
      deliveryFee: Number(restaurant.deliveryFee),
      minOrderValue: Number(restaurant.minOrderValue),
      categories: restaurant.categories.map(category => ({
        ...category,
        menuItems: category.menuItems.map(item => ({
          ...item,
          price: Number(item.price),
          originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
          cost: item.cost ? Number(item.cost) : null,
        }))
      }))
    };
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return null;
  }
}

export async function getUserRestaurants(userId: string) {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    return restaurants;
  } catch (error) {
    console.error('Error fetching user restaurants:', error);
    return [];
  }
}
