import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/auth';
import * as XLSX from 'xlsx';
import { prisma } from '@/lib/db';

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

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const items = await parseFileContent(file);

    return NextResponse.json({
      success: true,
      items,
      count: items.length
    });
  } catch (error) {
    console.error('Erro no preview:', error);
    return NextResponse.json(
      { error: 'Erro ao processar arquivo' },
      { status: 500 }
    );
  }
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
            price: formatPrice(getValue(values, columnMap.price) || '0'),
            category: getValue(values, columnMap.category) || 'Sem categoria'
          };
          items.push(item);
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
              price: formatPrice(getValueFromRow(row, columnMap.price) || '0'),
              category: getValueFromRow(row, columnMap.category) || 'Sem categoria'
            };
            items.push(item);
          }
        }
      }
    } else {
      // Tentar parse como JSON ou texto
      const content = await file.text();
      try {
        const jsonData = JSON.parse(content);
        if (Array.isArray(jsonData)) {
          jsonData.forEach((item, index) => {
            items.push({
              name: item.name || item.nome || `Item ${index + 1}`,
              description: item.description || item.descricao || '',
              price: formatPrice(item.price || item.preco || '0'),
              category: item.category || item.categoria || 'Sem categoria'
            });
          });
        }
      } catch {
        // Parse como texto simples
        const lines = content.split('\n').filter(line => line.trim());
        lines.forEach((line, index) => {
          if (line.trim()) {
            items.push({
              name: line.trim() || `Item ${index + 1}`,
              description: '',
              price: '0,00',
              category: 'Sem categoria'
            });
          }
        });
      }
    }
  } catch (error) {
    console.error('Erro ao fazer parse do arquivo:', error);
  }
  
  return items;
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

function formatPrice(price: string): string {
  if (!price) return '0,00';
  
  // Remove caracteres não numéricos exceto vírgula e ponto
  const cleaned = price.toString().replace(/[^\d.,]/g, '');
  
  // Converte para formato brasileiro
  if (cleaned.includes('.') && cleaned.includes(',')) {
    // Formato: 1.234,56
    return cleaned;
  } else if (cleaned.includes('.') && !cleaned.includes(',')) {
    // Formato: 1234.56 -> 1234,56
    const parts = cleaned.split('.');
    if (parts[1] && parts[1].length <= 2) {
      return parts[0] + ',' + parts[1].padEnd(2, '0');
    }
    return cleaned.replace('.', ',');
  } else if (cleaned.includes(',')) {
    // Já está no formato brasileiro
    return cleaned;
  } else {
    // Apenas números - assumir que são centavos se <= 999, senão reais
    const num = parseInt(cleaned);
    if (num <= 999) {
      return num.toString() + ',00';
    } else {
      return (num / 100).toFixed(2).replace('.', ',');
    }
  }
}