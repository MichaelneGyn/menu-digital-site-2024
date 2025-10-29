'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, DollarSign, ShoppingCart, AlertCircle, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ReportData {
  period: {
    type: string;
    startDate: string;
    endDate: string;
  };
  summary: {
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
    roi: number;
    totalOrders: number;
    averageTicket: number;
    averageProfitPerOrder: number;
  };
  products: Array<{
    name: string;
    sold: number;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  }>;
  lowMarginProducts: Array<{
    name: string;
    margin: number;
  }>;
  insights: Array<{
    type: 'success' | 'warning' | 'danger';
    message: string;
    products?: string[];
  }>;
}

export default function RelatoriosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('month');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace('/auth/login');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      loadReport();
    }
  }, [session, period]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reports/sales-profit?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (isLoading || !reportData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando relatório...</p>
          </div>
        </div>
      </div>
    );
  }

  const { summary, products, lowMarginProducts, insights } = reportData;

  // Dados para o gráfico de barras (top 10 produtos)
  const topProducts = products.slice(0, 10).map(p => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    Faturamento: p.revenue,
    Custo: p.cost,
    Lucro: p.profit,
  }));

  // Dados para o gráfico de pizza (distribuição de vendas)
  const pieData = products.slice(0, 6).map(p => ({
    name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
    value: p.revenue,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 Relatórios de Vendas e Lucro</h1>
              <p className="text-gray-600 mt-1">
                Análise completa do seu faturamento e lucratividade
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Filtros de Período */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={period === 'today' ? 'default' : 'outline'}
            onClick={() => setPeriod('today')}
          >
            Hoje
          </Button>
          <Button
            variant={period === 'week' ? 'default' : 'outline'}
            onClick={() => setPeriod('week')}
          >
            Última Semana
          </Button>
          <Button
            variant={period === 'month' ? 'default' : 'outline'}
            onClick={() => setPeriod('month')}
          >
            Último Mês
          </Button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Faturamento */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">💰 Faturamento</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.revenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.totalOrders} pedidos
              </p>
            </CardContent>
          </Card>

          {/* Custo */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">📉 Custo Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.cost)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ingredientes + Embalagens
              </p>
            </CardContent>
          </Card>

          {/* Lucro */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">💎 Lucro Líquido</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.profit)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Margem: {summary.margin.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          {/* ROI */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">🎯 ROI</CardTitle>
              <ShoppingCart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {summary.roi.toFixed(2)}x
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Retorno sobre investimento
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Insights Automáticos */}
        {insights.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                💡 Insights Automáticos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    insight.type === 'success'
                      ? 'bg-green-50 border-green-500'
                      : insight.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <p className="font-medium">{insight.message}</p>
                  {insight.products && (
                    <p className="text-sm text-gray-600 mt-1">
                      Produtos: {insight.products.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de Barras - Top Produtos */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Top 10 Produtos por Lucratividade</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="Faturamento" fill="#10b981" />
                  <Bar dataKey="Custo" fill="#ef4444" />
                  <Bar dataKey="Lucro" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Pizza - Distribuição */}
          <Card>
            <CardHeader>
              <CardTitle>🥧 Distribuição de Faturamento</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Produtos */}
        <Card>
          <CardHeader>
            <CardTitle>🏆 Todos os Produtos - Análise Detalhada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Produto</th>
                    <th className="text-right p-2">Vendidos</th>
                    <th className="text-right p-2">Faturamento</th>
                    <th className="text-right p-2">Custo</th>
                    <th className="text-right p-2">Lucro</th>
                    <th className="text-right p-2">Margem</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{product.name}</td>
                      <td className="text-right p-2">{product.sold}x</td>
                      <td className="text-right p-2 text-green-600">
                        {formatCurrency(product.revenue)}
                      </td>
                      <td className="text-right p-2 text-red-600">
                        {formatCurrency(product.cost)}
                      </td>
                      <td className="text-right p-2 text-blue-600 font-semibold">
                        {formatCurrency(product.profit)}
                      </td>
                      <td className="text-right p-2">
                        <span
                          className={`px-2 py-1 rounded text-sm font-semibold ${
                            product.margin >= 50
                              ? 'bg-green-100 text-green-800'
                              : product.margin >= 30
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.margin.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Produtos com Baixa Margem */}
        {lowMarginProducts.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-red-600">⚠️ Produtos com Margem Abaixo de 30%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowMarginProducts.map((product, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-red-600 font-semibold">
                      {product.margin.toFixed(1)}% de margem
                    </span>
                  </div>
                ))}
                <p className="text-sm text-gray-600 mt-3">
                  💡 Considere aumentar o preço ou reduzir o custo destes produtos
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
