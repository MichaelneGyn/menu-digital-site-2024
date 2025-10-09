'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Package,
  ChefHat,
  BarChart3,
  Plus,
  ArrowLeft
} from 'lucide-react';

interface CMVAnalysis {
  averageCMV: number;
  totalRecipes: number;
  productsWithCMV: number;
  productsWithoutCMV: number;
  bestProducts: any[];
  worstProducts: any[];
  cmvStatus: 'excellent' | 'good' | 'warning' | 'danger' | 'no_data';
  recommendations: any[];
  categoryAnalysis: any[];
  monthlyEvolution: any[];
  benchmarks: any;
}

export default function CMVDashboard() {
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
        // Definir dados vazios em caso de erro
        setAnalysis({
          averageCMV: 0,
          totalRecipes: 0,
          productsWithCMV: 0,
          productsWithoutCMV: 0,
          bestProducts: [],
          worstProducts: [],
          cmvStatus: 'no_data',
          recommendations: [],
          categoryAnalysis: [],
          monthlyEvolution: [],
          benchmarks: null
        });
      }
    } catch (error) {
      console.error('Erro ao buscar análise:', error);
      // Definir dados vazios em caso de erro
      setAnalysis({
        averageCMV: 0,
        totalRecipes: 0,
        productsWithCMV: 0,
        productsWithoutCMV: 0,
        bestProducts: [],
        worstProducts: [],
        cmvStatus: 'no_data',
        recommendations: [],
        categoryAnalysis: [],
        monthlyEvolution: [],
        benchmarks: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'danger': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'good': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'danger': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Bom';
      case 'warning': return 'Atenção';
      case 'danger': return 'Crítico';
      default: return 'Sem dados';
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="pizza-loader mb-4"></div>
          <p>Carregando análise...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Erro ao carregar análise</CardTitle>
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
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-8 h-8 text-red-600" />
                  Calculadora CMV
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Custo da Mercadoria Vendida - Análise Completa
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Geral */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* CMV Médio */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CMV Médio</CardTitle>
              {getStatusIcon(analysis.cmvStatus)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analysis.averageCMV > 0 ? `${analysis.averageCMV}%` : 'N/A'}
              </div>
              <Badge className={`mt-2 ${getStatusColor(analysis.cmvStatus)}`}>
                {getStatusText(analysis.cmvStatus)}
              </Badge>
              <p className="text-xs text-gray-600 mt-2">
                Ideal: 25-28% | Bom: 28-32%
              </p>
            </CardContent>
          </Card>

          {/* Produtos Analisados */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Custo</CardTitle>
              <Package className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {analysis.productsWithCMV}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                produtos com custo cadastrado
              </p>
            </CardContent>
          </Card>

          {/* Produtos Sem CMV */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sem Custo</CardTitle>
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {analysis.productsWithoutCMV}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                produtos sem custo cadastrado
              </p>
            </CardContent>
          </Card>

          {/* Total de Receitas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <ChefHat className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {analysis.totalRecipes}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                receitas completas cadastradas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link href="/admin/cmv/ingredients">
                <Button className="w-full h-20 flex flex-col items-center justify-center gap-2 bg-white border hover:bg-gray-50 text-gray-900">
                  <Package className="w-6 h-6 text-blue-600" />
                  <span className="text-sm">Ingredientes</span>
                </Button>
              </Link>

              <Link href="/admin/cmv/recipes">
                <Button className="w-full h-20 flex flex-col items-center justify-center gap-2 bg-white border hover:bg-gray-50 text-gray-900">
                  <ChefHat className="w-6 h-6 text-purple-600" />
                  <span className="text-sm">Receitas</span>
                </Button>
              </Link>

              <Link href="/admin/cmv/calculator">
                <Button className="w-full h-20 flex flex-col items-center justify-center gap-2 bg-white border hover:bg-gray-50 text-gray-900">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <span className="text-sm">Calculadora</span>
                </Button>
              </Link>

              <Link href="/admin/cmv/reports">
                <Button className="w-full h-20 flex flex-col items-center justify-center gap-2 bg-white border hover:bg-gray-50 text-gray-900">
                  <BarChart3 className="w-6 h-6 text-red-600" />
                  <span className="text-sm">Relatórios</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recomendações */}
        {analysis?.recommendations && analysis.recommendations.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recomendações Inteligentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    rec.type === 'danger' ? 'bg-red-50 border-red-500' :
                    rec.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                    rec.type === 'info' ? 'bg-blue-50 border-blue-500' :
                    'bg-green-50 border-green-500'
                  }`}
                >
                  <h4 className="font-semibold mb-1">{rec.title}</h4>
                  <p className="text-sm text-gray-700">{rec.description}</p>
                  {rec.products && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {rec.products.map((product: string, i: number) => (
                        <Badge key={i} variant="outline">{product}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tabs com análises detalhadas */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="evolution">Evolução</TabsTrigger>
          </TabsList>

          {/* Tab: Produtos */}
          <TabsContent value="products" className="space-y-4">
            {/* Mais Rentáveis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="w-5 h-5" />
                  Top 5 Mais Rentáveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(!analysis?.bestProducts || analysis.bestProducts.length === 0) ? (
                  <p className="text-center text-gray-500 py-8">Cadastre receitas para ver os produtos mais rentáveis</p>
                ) : (
                  <div className="space-y-3">
                    {analysis.bestProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold">{product.name}</h4>
                          <p className="text-sm text-gray-600">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{product.cmv.toFixed(1)}%</div>
                          <div className="text-sm text-gray-600">R$ {product.price.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Menos Rentáveis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <TrendingDown className="w-5 h-5" />
                  Top 5 Menos Rentáveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(!analysis?.worstProducts || analysis.worstProducts.length === 0) ? (
                  <p className="text-center text-gray-500 py-8">Cadastre receitas para ver os produtos menos rentáveis</p>
                ) : (
                  <div className="space-y-3">
                    {analysis.worstProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold">{product.name}</h4>
                          <p className="text-sm text-gray-600">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${
                            product.cmv > 35 ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {product.cmv.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">R$ {product.price.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Categorias */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>CMV por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                {(!analysis?.categoryAnalysis || analysis.categoryAnalysis.length === 0) ? (
                  <p className="text-center text-gray-500 py-8">Cadastre receitas para ver análise por categoria</p>
                ) : (
                  <div className="space-y-3">
                    {analysis.categoryAnalysis.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold">{category.name}</h4>
                          <p className="text-sm text-gray-600">{category.productsCount} produtos</p>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${
                            category.status === 'excellent' ? 'text-green-600' :
                            category.status === 'good' ? 'text-blue-600' :
                            category.status === 'warning' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {category.averageCMV.toFixed(1)}%
                          </div>
                          <Badge className={getStatusColor(category.status)}>
                            {getStatusText(category.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Evolução */}
          <TabsContent value="evolution">
            <Card>
              <CardHeader>
                <CardTitle>Evolução Mensal do CMV</CardTitle>
              </CardHeader>
              <CardContent>
                {(!analysis?.monthlyEvolution || analysis.monthlyEvolution.length === 0) ? (
                  <p className="text-center text-gray-500 py-8">Dados de evolução serão gerados automaticamente</p>
                ) : (
                  <div className="space-y-3">
                    {analysis.monthlyEvolution.map((month, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="font-semibold">{month.month}</div>
                        <div className="flex items-center gap-4">
                          <div className="w-48 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                month.cmv <= 28 ? 'bg-green-500' :
                                month.cmv <= 32 ? 'bg-blue-500' :
                                month.cmv <= 35 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(month.cmv, 100)}%` }}
                            />
                          </div>
                          <div className="font-bold">{month.cmv.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Benchmark */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Entenda o CMV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="font-semibold text-green-800">🏆 Excelente (25-28%)</div>
                <p className="text-sm text-green-700 mt-1">
                  Margem de lucro ótima. Continue assim!
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="font-semibold text-blue-800">✅ Bom (28-32%)</div>
                <p className="text-sm text-blue-700 mt-1">
                  Dentro da média do mercado.
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="font-semibold text-yellow-800">⚠️ Atenção (32-35%)</div>
                <p className="text-sm text-yellow-700 mt-1">
                  Revise seus custos ou preços.
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="font-semibold text-red-800">🚨 Crítico (&gt;35%)</div>
                <p className="text-sm text-red-700 mt-1">
                  Risco de prejuízo. Ação urgente!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
