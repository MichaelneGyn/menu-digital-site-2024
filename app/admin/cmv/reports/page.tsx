'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  FileText,
  ArrowLeft,
  Download,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Package
} from 'lucide-react';

interface CMVAnalysis {
  averageCMV: number;
  totalRecipes: number;
  productsWithCMV: number;
  productsWithoutCMV: number;
  bestProducts: any[];
  worstProducts: any[];
  categoryAnalysis: any[];
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<CMVAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace('/auth/login');
      return;
    }
    fetchAnalysis();
  }, [session, status]);

  const fetchAnalysis = async () => {
    try {
      const response = await fetch('/api/cmv/analysis');
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      } else {
        setAnalysis({
          averageCMV: 0,
          totalRecipes: 0,
          productsWithCMV: 0,
          productsWithoutCMV: 0,
          bestProducts: [],
          worstProducts: [],
          categoryAnalysis: []
        });
      }
    } catch (error) {
      console.error('Erro ao buscar análise:', error);
      setAnalysis({
        averageCMV: 0,
        totalRecipes: 0,
        productsWithCMV: 0,
        productsWithoutCMV: 0,
        bestProducts: [],
        worstProducts: [],
        categoryAnalysis: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = () => {
    if (!analysis) return;

    const bestProductsText = analysis.bestProducts?.length > 0 
      ? analysis.bestProducts.map((p, i) => `${i + 1}. ${p.name} - CMV: ${p.cmv.toFixed(1)}% - Preço: R$ ${p.price.toFixed(2)}`).join('\n')
      : 'Nenhum produto cadastrado';

    const worstProductsText = analysis.worstProducts?.length > 0
      ? analysis.worstProducts.map((p, i) => `${i + 1}. ${p.name} - CMV: ${p.cmv.toFixed(1)}% - Preço: R$ ${p.price.toFixed(2)}`).join('\n')
      : 'Nenhum produto cadastrado';

    const categoryText = analysis.categoryAnalysis?.length > 0
      ? analysis.categoryAnalysis.map(c => `${c.name}: ${c.averageCMV.toFixed(1)}% (${c.productsCount} produtos)`).join('\n')
      : 'Nenhuma categoria com dados';

    const reportText = `
RELATÓRIO DE ANÁLISE CMV
Data: ${new Date().toLocaleDateString('pt-BR')}
======================================

RESUMO GERAL
------------
CMV Médio do Cardápio: ${analysis.averageCMV.toFixed(1)}%
Total de Produtos com Custo: ${analysis.productsWithCMV}
Total de Produtos sem Custo: ${analysis.productsWithoutCMV}
Total de Receitas Cadastradas: ${analysis.totalRecipes}

TOP 5 MAIS RENTÁVEIS
--------------------
${bestProductsText}

TOP 5 MENOS RENTÁVEIS
---------------------
${worstProductsText}

ANÁLISE POR CATEGORIA
---------------------
${categoryText}
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-cmv-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    toast.success('Relatório exportado!');
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="pizza-loader mb-4"></div>
          <p>Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Erro ao carregar relatório</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchAnalysis}>Tentar Novamente</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/cmv">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-8 h-8 text-red-600" />
                  Relatórios
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Análise completa do seu cardápio
                </p>
              </div>
            </div>
            <Button
              onClick={exportReport}
              className="bg-red-600 hover:bg-red-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Resumo Executivo */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Resumo Executivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {analysis.averageCMV.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 mt-1">CMV Médio</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {analysis.productsWithCMV}
                </div>
                <div className="text-sm text-gray-600 mt-1">Com Custo</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">
                  {analysis.productsWithoutCMV}
                </div>
                <div className="text-sm text-gray-600 mt-1">Sem Custo</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {analysis.totalRecipes}
                </div>
                <div className="text-sm text-gray-600 mt-1">Receitas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Produtos Mais Rentáveis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-5 h-5" />
              Top 10 Produtos Mais Rentáveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">#</th>
                    <th className="text-left py-3 px-2">Produto</th>
                    <th className="text-left py-3 px-2">Categoria</th>
                    <th className="text-right py-3 px-2">Preço</th>
                    <th className="text-right py-3 px-2">Custo</th>
                    <th className="text-right py-3 px-2">CMV</th>
                    <th className="text-right py-3 px-2">Lucro</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis?.bestProducts?.map((product, index) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 font-semibold">{index + 1}</td>
                      <td className="py-3 px-2">{product.name}</td>
                      <td className="py-3 px-2">
                        <Badge variant="outline">{product.category}</Badge>
                      </td>
                      <td className="py-3 px-2 text-right">
                        R$ {product.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        R$ {product.cost.toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Badge className="bg-green-100 text-green-800">
                          {product.cmv.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-green-600">
                        R$ {(product.price - product.cost).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Produtos Menos Rentáveis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Top 10 Produtos Menos Rentáveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">#</th>
                    <th className="text-left py-3 px-2">Produto</th>
                    <th className="text-left py-3 px-2">Categoria</th>
                    <th className="text-right py-3 px-2">Preço</th>
                    <th className="text-right py-3 px-2">Custo</th>
                    <th className="text-right py-3 px-2">CMV</th>
                    <th className="text-right py-3 px-2">Lucro</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis?.worstProducts?.map((product, index) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 font-semibold">{index + 1}</td>
                      <td className="py-3 px-2">{product.name}</td>
                      <td className="py-3 px-2">
                        <Badge variant="outline">{product.category}</Badge>
                      </td>
                      <td className="py-3 px-2 text-right">
                        R$ {product.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        R$ {product.cost.toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Badge className={
                          product.cmv > 35 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }>
                          {product.cmv.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold">
                        R$ {(product.price - product.cost).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Análise por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Análise por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!analysis?.categoryAnalysis || analysis.categoryAnalysis.length === 0) ? (
              <p className="text-center text-gray-500 py-8">Cadastre receitas para ver análise por categoria</p>
            ) : (
              <div className="space-y-4">
                {analysis.categoryAnalysis.map((category) => (
                  <div key={category.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-lg">{category.name}</h4>
                      <p className="text-sm text-gray-600">{category.productsCount} produtos</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        category.averageCMV <= 28 ? 'text-green-600' :
                        category.averageCMV <= 32 ? 'text-blue-600' :
                        category.averageCMV <= 35 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {category.averageCMV.toFixed(1)}%
                      </div>
                      <Badge className={
                        category.status === 'excellent' ? 'bg-green-100 text-green-800' :
                        category.status === 'good' ? 'bg-blue-100 text-blue-800' :
                        category.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {category.status === 'excellent' ? 'Excelente' :
                         category.status === 'good' ? 'Bom' :
                         category.status === 'warning' ? 'Atenção' : 'Crítico'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insights e Recomendações */}
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-800">💡 Insights e Ações Recomendadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis && analysis.averageCMV > 32 && (
              <div className="p-3 bg-white rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-1">
                  📈 CMV médio acima do ideal
                </h4>
                <p className="text-sm text-purple-800">
                  Seu CMV médio ({analysis.averageCMV.toFixed(1)}%) está acima do recomendado. 
                  Foque em revisar os produtos com CMV acima de 35%.
                </p>
              </div>
            )}
            
            {analysis && analysis.productsWithoutCMV > 0 && (
              <div className="p-3 bg-white rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-1">
                  📝 Produtos sem custo cadastrado
                </h4>
                <p className="text-sm text-purple-800">
                  Você tem {analysis.productsWithoutCMV} produto(s) sem custo cadastrado. 
                  Complete o cadastro para ter controle total.
                </p>
              </div>
            )}

            <div className="p-3 bg-white rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-1">
                🎯 Próximos Passos
              </h4>
              <ul className="text-sm text-purple-800 list-disc list-inside space-y-1">
                <li>Revise produtos com CMV acima de 35%</li>
                <li>Considere aumentar preços dos produtos menos rentáveis</li>
                <li>Negocie melhores preços com fornecedores</li>
                <li>Monitore a evolução do CMV mensalmente</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
