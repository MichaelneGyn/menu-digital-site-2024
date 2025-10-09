'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Calculator,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Lightbulb
} from 'lucide-react';

export default function CMVCalculatorPage() {
  const { status } = useSession();
  const router = useRouter();
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [result, setResult] = useState<{
    cmv: number;
    margin: number;
    profit: number;
    status: string;
  } | null>(null);

  if (status === 'unauthenticated') {
    router.replace('/auth/login');
    return null;
  }

  const calculateCMV = () => {
    const priceNum = parseFloat(price);
    const costNum = parseFloat(cost);

    if (!priceNum || !costNum || priceNum <= 0 || costNum < 0) {
      return;
    }

    const cmv = (costNum / priceNum) * 100;
    const margin = 100 - cmv;
    const profit = priceNum - costNum;

    let status = '';
    if (cmv <= 28) status = 'excellent';
    else if (cmv <= 32) status = 'good';
    else if (cmv <= 35) status = 'warning';
    else status = 'danger';

    setResult({ cmv, margin, profit, status });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'excellent':
        return {
          color: 'bg-green-100 text-green-800 border-green-300',
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          label: '🏆 Excelente',
          message: 'Margem de lucro ótima! Continue assim!'
        };
      case 'good':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <CheckCircle className="w-6 h-6 text-blue-600" />,
          label: '✅ Bom',
          message: 'CMV dentro da média do mercado.'
        };
      case 'warning':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
          label: '⚠️ Atenção',
          message: 'CMV um pouco alto. Considere revisar.'
        };
      case 'danger':
        return {
          color: 'bg-red-100 text-red-800 border-red-300',
          icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
          label: '🚨 Crítico',
          message: 'CMV muito alto! Risco de prejuízo.'
        };
      default:
        return null;
    }
  };

  const getRecommendation = () => {
    if (!result) return null;

    const priceNum = parseFloat(price);
    const costNum = parseFloat(cost);

    if (result.cmv > 32) {
      // Calcular preço ideal para CMV 30%
      const idealPrice = costNum / 0.30;
      const priceIncrease = idealPrice - priceNum;

      return {
        type: 'price',
        message: `Aumentando o preço em R$ ${priceIncrease.toFixed(2)} (de R$ ${priceNum.toFixed(2)} para R$ ${idealPrice.toFixed(2)}), seu CMV cairia para 30%.`
      };
    }

    if (result.cmv <= 25) {
      const lowerPrice = costNum / 0.28;
      const priceDecrease = priceNum - lowerPrice;

      return {
        type: 'competitive',
        message: `Você poderia reduzir o preço em até R$ ${priceDecrease.toFixed(2)} e ainda manter um CMV excelente de 28%.`
      };
    }

    return null;
  };

  const statusInfo = result ? getStatusInfo(result.status) : null;
  const recommendation = getRecommendation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/cmv">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Calculator className="w-8 h-8 text-green-600" />
                Calculadora Rápida
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Calcule o CMV sem salvar no sistema
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle>Digite os Valores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="price" className="text-base">
                  Preço de Venda (R$)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="text-lg h-12 mt-2"
                />
              </div>

              <div>
                <Label htmlFor="cost" className="text-base">
                  Custo Total (R$)
                </Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="text-lg h-12 mt-2"
                />
              </div>

              <Button
                onClick={calculateCMV}
                className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
                disabled={!price || !cost}
              >
                <Calculator className="w-5 h-5 mr-2" />
                Calcular CMV
              </Button>

              {/* Exemplo */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-sm">💡 Exemplo</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p><strong>Pizza Calabresa:</strong></p>
                  <p>Preço de Venda: R$ 65,00</p>
                  <p>Custo Total: R$ 21,25</p>
                  <p className="pt-2 text-green-700">
                    <strong>CMV: 32,7%</strong>
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Resultado */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Status Principal */}
                {statusInfo && (
                  <Card className={`border-2 ${statusInfo.color}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4 mb-4">
                        {statusInfo.icon}
                        <div>
                          <h3 className="text-xl font-bold">{statusInfo.label}</h3>
                          <p className="text-sm">{statusInfo.message}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Métricas */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-600">CMV</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-3xl font-bold ${
                        result.cmv <= 28 ? 'text-green-600' :
                        result.cmv <= 32 ? 'text-blue-600' :
                        result.cmv <= 35 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {result.cmv.toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-600">Margem</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-600">
                        {result.margin.toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="col-span-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Lucro Bruto
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">
                        R$ {result.profit.toFixed(2)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        por unidade vendida
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recomendação */}
                {recommendation && (
                  <Card className="border-purple-200 bg-purple-50">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2 text-purple-800">
                        <Lightbulb className="w-5 h-5" />
                        Recomendação
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-purple-900">
                        {recommendation.message}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Simulação de Vendas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      <TrendingUp className="w-5 h-5 inline mr-2" />
                      Simulação de Vendas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>10 unidades vendidas:</span>
                        <span className="font-bold text-green-600">
                          +R$ {(result.profit * 10).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>50 unidades vendidas:</span>
                        <span className="font-bold text-green-600">
                          +R$ {(result.profit * 50).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>100 unidades vendidas:</span>
                        <span className="font-bold text-green-600 text-lg">
                          +R$ {(result.profit * 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center text-gray-500">
                  <Calculator className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>Digite os valores e clique em Calcular para ver o resultado</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Guia Educacional */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📚 Como Interpretar o CMV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="font-semibold text-green-800 mb-2">🏆 Excelente</div>
                <div className="text-2xl font-bold text-green-600 mb-1">25-28%</div>
                <p className="text-sm text-green-700">
                  Margem de lucro ótima. Continue assim!
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="font-semibold text-blue-800 mb-2">✅ Bom</div>
                <div className="text-2xl font-bold text-blue-600 mb-1">28-32%</div>
                <p className="text-sm text-blue-700">
                  Dentro da média do mercado.
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="font-semibold text-yellow-800 mb-2">⚠️ Atenção</div>
                <div className="text-2xl font-bold text-yellow-600 mb-1">32-35%</div>
                <p className="text-sm text-yellow-700">
                  Revise seus custos ou preços.
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="font-semibold text-red-800 mb-2">🚨 Crítico</div>
                <div className="text-2xl font-bold text-red-600 mb-1">&gt;35%</div>
                <p className="text-sm text-red-700">
                  Risco de prejuízo. Ação urgente!
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">💡 Fórmula do CMV:</h4>
              <code className="text-sm bg-white px-3 py-2 rounded border inline-block">
                CMV = (Custo Total / Preço de Venda) × 100
              </code>
              <p className="text-sm text-gray-600 mt-2">
                O CMV representa a porcentagem do preço de venda que vai para pagar os ingredientes. 
                Quanto menor o CMV, maior é sua margem de lucro!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
