import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/auth';
import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx';

interface ParsedItem {
  name: string;
  description: string;
  price: string;
  category: string;
  image?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Usando cliente Supabase global
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const restaurantId = formData.get('restaurantId') as string;

    if (!file || !restaurantId) {
      return NextResponse.json({ error: 'Arquivo e ID do restaurante são obrigatórios' }, { status: 400 });
    }

    // Verificar se o restaurante pertence ao usuário
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: restaurantId,
        userId: session.user?.email || ''
      }
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    const items = await parseFileContent(file);

    if (items.length === 0) {
      return NextResponse.json({ error: 'Nenhum item válido encontrado no arquivo' }, { status: 400 });
    }

    // Processar importação
    const result = await importItems(restaurantId, items);

    return NextResponse.json({
      success: true,
      imported: result.imported,
      skipped: result.skipped,
      categoriesCreated: result.categoriesCreated
    });
  } catch (error) {
    console.error('Erro na importação:', error);
    return NextResponse.json(
      { error: 'Erro ao importar catálogo' },
      { status: 500 }
    );
  }
}

async function importItems(restaurantId: string, items: ParsedItem[]) {
  let imported = 0;
  let skipped = 0;
  let categoriesCreated = 0;
  const createdCategories = new Set<string>();

  for (const item of items) {
    try {
      // Verificar se o item já existe (baseado no nome)
      const existingItem = await prisma.menuItem.findFirst({
        where: {
          name: item.name,
          category: {
            restaurantId: restaurantId
          }
        }
      });

      if (existingItem) {
        skipped++;
        continue;
      }

      // Buscar ou criar categoria
      let category = await prisma.category.findFirst({
        where: {
          name: item.category,
          restaurantId: restaurantId
        }
      });

      if (!category) {
        // Criar nova categoria
        category = await prisma.category.create({
          data: {
            name: item.category,
            icon: getCategoryIcon(item.category),
            restaurantId: restaurantId
          }
        });
        
        if (!createdCategories.has(item.category)) {
          categoriesCreated++;
          createdCategories.add(item.category);
        }
      }

      // Converter preço para número
      const price = parsePrice(item.price);

      // Criar item do menu
      await prisma.menuItem.create({
        data: {
          name: item.name,
          description: item.description || '',
          price: price,
          image: item.image || getDefaultImage(item.category),
          categoryId: category.id,
          restaurantId: restaurantId,
          isPromo: false
        }
      });

      imported++;
    } catch (error) {
      console.error(`Erro ao importar item ${item.name}:`, error);
      skipped++;
    }
  }

  return { imported, skipped, categoriesCreated };
}

async function parseFileContent(file: File): Promise<ParsedItem[]> {
  const items: ParsedItem[] = [];
  
  try {
    if (file.type === 'text/csv') {
      // Parse CSV
      const content = await file.text();
      const lines = content.split('\n').filter(line => line.trim());
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Mapear colunas comuns do iFood
      const columnMap = {
        name: findColumn(headers, ['nome', 'name', 'produto', 'item', 'title']),
        description: findColumn(headers, ['descricao', 'description', 'desc', 'detalhes']),
        price: findColumn(headers, ['preco', 'price', 'valor', 'preço']),
        category: findColumn(headers, ['categoria', 'category', 'cat', 'grupo'])
      };
      
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length > 1) {
          const item: ParsedItem = {
            name: getValue(values, columnMap.name) || `Item ${i}`,
            description: getValue(values, columnMap.description) || '',
            price: getValue(values, columnMap.price) || '0',
            category: getValue(values, columnMap.category) || 'Sem categoria'
          };
          
          if (item.name.trim()) {
            items.push(item);
          }
        }
      }
    } else if (file.type.includes('sheet') || file.type.includes('excel')) {
      // Parse Excel
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
      
      if (jsonData.length > 1) {
        const headers = jsonData[0].map(h => h?.toString().toLowerCase() || '');
        
        // Mapear colunas comuns do iFood
        const columnMap = {
          name: findColumn(headers, ['nome', 'name', 'produto', 'item', 'title']),
          description: findColumn(headers, ['descricao', 'description', 'desc', 'detalhes']),
          price: findColumn(headers, ['preco', 'price', 'valor', 'preço']),
          category: findColumn(headers, ['categoria', 'category', 'cat', 'grupo'])
        };
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row && row.length > 1) {
            const item: ParsedItem = {
              name: getValueFromRow(row, columnMap.name) || `Item ${i}`,
              description: getValueFromRow(row, columnMap.description) || '',
              price: getValueFromRow(row, columnMap.price) || '0',
              category: getValueFromRow(row, columnMap.category) || 'Sem categoria'
            };
            
            if (item.name.trim()) {
              items.push(item);
            }
          }
        }
      }
    } else {
      // Tentar parse como JSON
      const content = await file.text();
      try {
        const jsonData = JSON.parse(content);
        if (Array.isArray(jsonData)) {
          jsonData.forEach((item, index) => {
            const parsedItem: ParsedItem = {
              name: item.name || item.nome || `Item ${index + 1}`,
              description: item.description || item.descricao || '',
              price: item.price || item.preco || '0',
              category: item.category || item.categoria || 'Sem categoria'
            };
            
            if (parsedItem.name.trim()) {
              items.push(parsedItem);
            }
          });
        }
      } catch {
        // Parse como texto simples
        const lines = content.split('\n').filter(line => line.trim());
        lines.forEach((line, index) => {
          if (line.trim()) {
            items.push({
              name: line.trim(),
              description: '',
              price: '0',
              category: 'Sem categoria'
            });
          }
        });
      }
    }
  } catch (error) {
    console.error('Erro ao fazer parse do arquivo:', error);
  }
  
  return items.filter(item => item.name && item.name.trim());
}

function findColumn(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.findIndex(h => h.includes(name));
    if (index !== -1) return index;
  }
  return -1;
}

function getValue(values: string[], index: number): string {
  return index >= 0 && index < values.length ? values[index].trim().replace(/"/g, '') : '';
}

function getValueFromRow(row: any[], index: number): string {
  return index >= 0 && index < row.length ? (row[index]?.toString() || '').trim() : '';
}

function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  
  // Remove caracteres não numéricos exceto vírgula e ponto
  const cleaned = priceStr.toString().replace(/[^\d.,]/g, '');
  
  if (!cleaned) return 0;
  
  // Converte para formato numérico
  if (cleaned.includes(',')) {
    // Formato brasileiro: 1.234,56 ou 123,45
    const parts = cleaned.split(',');
    const integerPart = parts[0].replace(/\./g, ''); // Remove pontos dos milhares
    const decimalPart = parts[1] || '00';
    return parseFloat(integerPart + '.' + decimalPart);
  } else {
    // Formato americano: 1234.56
    return parseFloat(cleaned);
  }
}

function getCategoryIcon(categoryName: string): string {
  const name = categoryName.toLowerCase();
  
  if (name.includes('pizza')) return '🍕';
  if (name.includes('hambur') || name.includes('burger')) return '🍔';
  if (name.includes('bebida') || name.includes('drink')) return '🥤';
  if (name.includes('sobremesa') || name.includes('doce')) return '🍰';
  if (name.includes('salada')) return '🥗';
  if (name.includes('massa') || name.includes('pasta')) return '🍝';
  if (name.includes('carne') || name.includes('meat')) return '🥩';
  if (name.includes('frango') || name.includes('chicken')) return '🍗';
  if (name.includes('peixe') || name.includes('fish')) return '🐟';
  if (name.includes('sushi') || name.includes('japonês')) return '🍣';
  if (name.includes('mexicano') || name.includes('taco')) return '🌮';
  if (name.includes('café') || name.includes('coffee')) return '☕';
  if (name.includes('lanche') || name.includes('snack')) return '🥪';
  
  return '🍽️'; // Ícone padrão
}

function getDefaultImage(categoryName: string): string {
  // Retorna uma imagem padrão baseada na categoria
  const name = categoryName.toLowerCase();
  
  if (name.includes('pizza')) return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400';
  if (name.includes('hambur') || name.includes('burger')) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400';
  if (name.includes('bebida') || name.includes('drink')) return 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400';
  if (name.includes('sobremesa') || name.includes('doce')) return 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400';
  if (name.includes('salada')) return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400';
  
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'; // Imagem padrão de comida
}