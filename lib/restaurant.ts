
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Custom types for client components
export type ClientMenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number | null;
  image?: string;
  isPromo?: boolean;
  promoTag?: string;
  isActive: boolean;
  categoryId: string;
  restaurantId: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ClientCategory = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  restaurantId: string;
  menuItems: ClientMenuItem[];
};

export type ClientRestaurant = {
  id: string;
  name: string;
  description?: string;
  slug: string;
  logo?: string;
  bannerImage?: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  bannerUrl?: string;
  theme: string;
  showDeliveryTime: boolean;
  showRatings: boolean;
  customCss?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  openTime?: string;
  closeTime?: string;
  workingDays?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  whatsapp?: string;
  isActive: boolean;
  allowOrders: boolean;
  deliveryFee: number;
  minOrderValue: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  categories: ClientCategory[];
};

export async function getRestaurantBySlug(slug: string): Promise<ClientRestaurant | null> {
  try {
    // Use service role client for server-side operations
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: restaurant, error } = await serviceSupabase
      .from('restaurants')
      .select(`
        *,
        categories (
          *,
          items (*)
        )
      `)
      .eq('slug', slug)
      .single();

    if (error || !restaurant) {
      console.error('Error fetching restaurant:', error);
      return null;
    }

    // Transform Supabase data to match our types
    const transformedRestaurant: ClientRestaurant = {
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.description,
      slug: restaurant.slug,
      logo: restaurant.logo,
      bannerImage: restaurant.banner_image,
      primaryColor: restaurant.primary_color || '#d32f2f',
      secondaryColor: restaurant.secondary_color || '#ffc107',
      logoUrl: restaurant.logo_url,
      bannerUrl: restaurant.banner_url,
      theme: restaurant.theme || 'light',
      showDeliveryTime: restaurant.show_delivery_time ?? true,
      showRatings: restaurant.show_ratings ?? true,
      customCss: restaurant.custom_css,
      phone: restaurant.phone,
      email: restaurant.email,
      address: restaurant.address,
      city: restaurant.city,
      state: restaurant.state,
      zipCode: restaurant.zip_code,
      openTime: restaurant.open_time,
      closeTime: restaurant.close_time,
      workingDays: restaurant.working_days,
      facebook: restaurant.facebook,
      instagram: restaurant.instagram,
      twitter: restaurant.twitter,
      whatsapp: restaurant.whatsapp,
      isActive: restaurant.is_active ?? true,
      allowOrders: restaurant.allow_orders ?? true,
      deliveryFee: Number(restaurant.delivery_fee) || 0,
      minOrderValue: Number(restaurant.min_order_value) || 0,
      userId: restaurant.owner_id,
      createdAt: restaurant.created_at,
      updatedAt: restaurant.updated_at || restaurant.created_at,
      categories: (restaurant.categories || [])
        .filter((cat: any) => cat.is_active !== false)
        .map((category: any) => ({
          id: category.id,
          name: category.name,
          description: category.description,
          icon: category.icon,
          sortOrder: category.sort_order || 0,
          isActive: category.is_active ?? true,
          restaurantId: category.restaurant_id,
          menuItems: (category.items || [])
            .filter((item: any) => item.is_active !== false)
            .map((item: any) => ({
              id: item.id,
              name: item.name,
              description: item.description,
              price: Number(item.price) || 0,
              originalPrice: item.original_price ? Number(item.original_price) : null,
              image: item.image,
              isPromo: item.is_promo ?? false,
              promoTag: item.promo_tag,
              isActive: item.is_active ?? true,
              categoryId: item.category_id,
              restaurantId: item.restaurant_id,
              sortOrder: item.sort_order || 0,
              createdAt: item.created_at,
              updatedAt: item.updated_at || item.created_at,
            }))
            .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
        }))
        .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
    };

    return transformedRestaurant;
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return null;
  }
}

export async function getUserRestaurants(userId: string) {
  try {
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user restaurants:', error);
      return [];
    }

    return restaurants || [];
  } catch (error) {
    console.error('Error fetching user restaurants:', error);
    return [];
  }
}
