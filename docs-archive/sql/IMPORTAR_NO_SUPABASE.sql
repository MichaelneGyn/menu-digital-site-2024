-- ========================================
-- CATEGORIAS
-- ========================================

INSERT INTO "Category" (id, name, icon, "restaurantId", "createdAt", "updatedAt") VALUES ('cmgelr7lv0001v3lwf6k0qjtm', 'Promoções', '🎉', 'cmgejjxg00001v3ok71d5ze51', '2025-10-06T03:59:55.460Z', '2025-10-06T03:59:55.460Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO "Category" (id, name, icon, "restaurantId", "createdAt", "updatedAt") VALUES ('cmgfw6oht0001v3mcmpzzsw2j', 'bebidas', '🥤', 'cmgejjxg00001v3ok71d5ze51', '2025-10-07T01:39:39.521Z', '2025-10-07T01:39:39.521Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO "Category" (id, name, icon, "restaurantId", "createdAt", "updatedAt") VALUES ('cmgfw6vdu0003v3mcd1s5o4l7', 'sobremesas', '🍰', 'cmgejjxg00001v3ok71d5ze51', '2025-10-07T01:39:48.451Z', '2025-10-07T01:39:48.451Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO "Category" (id, name, icon, "restaurantId", "createdAt", "updatedAt") VALUES ('cmgfw71oh0005v3mc22gdia8j', 'pizzas', '🍕', 'cmgejjxg00001v3ok71d5ze51', '2025-10-07T01:39:56.609Z', '2025-10-07T01:39:56.609Z') ON CONFLICT (id) DO NOTHING;

-- ========================================
-- ITENS DO MENU
-- ========================================

INSERT INTO "MenuItem" (id, name, description, price, image, "isPromo", "originalPrice", "restaurantId", "categoryId", "createdAt", "updatedAt") VALUES ('cmgfah0bh0001v3yw88hgxomn', 'lanche', 'x', 14.2, '/uploads/1759764708945-images.jpg', false, NULL, 'cmgejjxg00001v3ok71d5ze51', 'cmgelr7lv0001v3lwf6k0qjtm', '2025-10-06T15:31:49.853Z', '2025-10-06T15:31:49.853Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO "MenuItem" (id, name, description, price, image, "isPromo", "originalPrice", "restaurantId", "categoryId", "createdAt", "updatedAt") VALUES ('cmgfw94nk0007v3mcb80hujh9', 'pizza', 'pizza', 17.2, '/uploads/1759801293429-images__1_.jpg', true, 9.99, 'cmgejjxg00001v3ok71d5ze51', 'cmgelr7lv0001v3lwf6k0qjtm', '2025-10-07T01:41:33.776Z', '2025-10-07T01:41:33.776Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO "MenuItem" (id, name, description, price, image, "isPromo", "originalPrice", "restaurantId", "categoryId", "createdAt", "updatedAt") VALUES ('cmgfwa1rn0009v3mchr2qm3k2', 'bolo', 'bolinho gostoso', 24.2, '/uploads/1759801336346-images__2_.jpg', false, NULL, 'cmgejjxg00001v3ok71d5ze51', 'cmgfw6vdu0003v3mcd1s5o4l7', '2025-10-07T01:42:16.691Z', '2025-10-07T01:42:16.691Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO "MenuItem" (id, name, description, price, image, "isPromo", "originalPrice", "restaurantId", "categoryId", "createdAt", "updatedAt") VALUES ('cmgfwap2g000bv3mclx0takig', 'ice', 'bebida gelado', 17.99, '/uploads/1759801366797-bebida-alcoolica-mista-cannabis-hemp-500ml.jpg', false, NULL, 'cmgejjxg00001v3ok71d5ze51', 'cmgfw6oht0001v3mcmpzzsw2j', '2025-10-07T01:42:46.888Z', '2025-10-07T01:42:46.888Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO "MenuItem" (id, name, description, price, image, "isPromo", "originalPrice", "restaurantId", "categoryId", "createdAt", "updatedAt") VALUES ('cmgfzhii0000dv3mcnm6ray89', 'pao de alho ', 'pao de alho ', 11, '/uploads/1759806723192-images__1_.jpg', true, 9.99, 'cmgejjxg00001v3ok71d5ze51', 'cmgelr7lv0001v3lwf6k0qjtm', '2025-10-07T03:12:03.816Z', '2025-10-07T03:12:03.816Z') ON CONFLICT (id) DO NOTHING;
