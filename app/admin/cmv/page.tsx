'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Calculator, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CMVSimples() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Estados simples
  const [nomeProduto, setNomeProduto] = useState('');
  const [precoVenda, setPrecoVenda] = useState('');
  const [custoIngredientes, setCustoIngredientes] = useState('');
  
  // Resultados
  const [cmvPercentual, setCmvPercentual] = useState(0);
  const [lucro, setLucro] = useState(0);
  const [status, setStatus] = useState<'bom' | 'atencao' | 'ruim' | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace('/auth/login');
    }
  }, [session, status]);

  // Calcular CMV automaticamente quando mudar os valores
  useEffect(() => {
    const preco = parseFloat(precoVenda) || 0;
    const custo = parseFloat(custoIngredientes) || 0;

    if (preco > 0 && custo > 0) {
      const cmv = (custo / preco) * 100;
      const lucroCalculado = preco - custo;

      setCmvPercentual(cmv);
      setLucro(lucroCalculado);

      // Definir status
      if (cmv <= 30) {
        setStatus('bom');
      } else if (cmv <= 40) {
        setStatus('atencao');
      } else {
        setStatus('ruim');
      }
    } else {
      setCmvPercentual(0);
      setLucro(0);
      setStatus(null);
    }
  }, [precoVenda, custoIngredientes]);

  const limparCampos = () => {
    setNomeProduto('');
    setPrecoVenda('');
    setCustoIngredientes('');
    setCmvPercentual(0);
    setLucro(0);
    setStatus(null);
  };

  const salvarCalculo = () => {
    if (!nomeProduto || !precoVenda || !custoIngredientes) {
      toast.error('Preencha todos os campos!');
      return;
    }

    // Aqui você pode salvar no banco se quiser
    toast.success(`✅ Cálculo de "${nomeProduto}" salvo!`);
    limparCampos();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
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
          
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Calculadora de Lucro</h1>
          </div>
          <p className="text-gray-600">
            Descubra quanto você lucra em cada produto! 💰
          </p>
        </div>

        {/* Card Principal */}
        <Card className="shadow-xl border-2 border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="text-xl">📊 Calcule seu Lucro</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Passo 1: Nome do Produto */}
            <div className="space-y-2">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">1</span>
                Nome do Produto
              </Label>
              <Input
                placeholder="Ex: Pizza Calabresa"
                value={nomeProduto}
                onChange={(e) => setNomeProduto(e.target.value)}
                className="text-lg h-12"
              />
              <p className="text-sm text-gray-500">💡 Digite o nome do produto que você vende</p>
            </div>

            {/* Passo 2: Preço de Venda */}
            <div className="space-y-2">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">2</span>
                Por quanto você VENDE?
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">R$</span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="45.00"
                  value={precoVenda}
                  onChange={(e) => setPrecoVenda(e.target.value)}
                  className="text-lg h-12 pl-12"
                />
              </div>
              <p className="text-sm text-gray-500">💡 Quanto o cliente paga por este produto</p>
            </div>

            {/* Passo 3: Custo dos Ingredientes */}
            <div className="space-y-2">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">3</span>
                Quanto CUSTA fazer?
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">R$</span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="15.00"
                  value={custoIngredientes}
                  onChange={(e) => setCustoIngredientes(e.target.value)}
                  className="text-lg h-12 pl-12"
                />
              </div>
              <p className="text-sm text-gray-500">💡 Some TODOS os ingredientes (farinha, queijo, calabresa, etc)</p>
            </div>

            {/* Resultado */}
            {status && (
              <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
                <h3 className="text-2xl font-bold mb-4 text-center">📊 Resultado</h3>
                
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {/* Lucro */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">💰 Seu Lucro</p>
                    <p className="text-3xl font-bold text-green-600">
                      R$ {lucro.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Por cada {nomeProduto || 'produto'} vendido
                    </p>
                  </div>

                  {/* CMV */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">📈 CMV (Custo %)</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {cmvPercentual.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Quanto % do preço é custo
                    </p>
                  </div>
                </div>

                {/* Status Visual */}
                <div className={`p-4 rounded-lg ${
                  status === 'bom' ? 'bg-green-100 border-2 border-green-300' :
                  status === 'atencao' ? 'bg-yellow-100 border-2 border-yellow-300' :
                  'bg-red-100 border-2 border-red-300'
                }`}>
                  <div className="flex items-start gap-3">
                    {status === 'bom' && (
                      <>
                        <TrendingUp className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-bold text-green-800 text-lg">✅ Excelente!</p>
                          <p className="text-green-700 text-sm">
                            Seu lucro está ótimo! Continue assim! 🎉
                          </p>
                        </div>
                      </>
                    )}
                    {status === 'atencao' && (
                      <>
                        <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-bold text-yellow-800 text-lg">⚠️ Atenção!</p>
                          <p className="text-yellow-700 text-sm">
                            Seu lucro está OK, mas pode melhorar. Tente reduzir custos ou aumentar o preço.
                          </p>
                        </div>
                      </>
                    )}
                    {status === 'ruim' && (
                      <>
                        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-bold text-red-800 text-lg">🚨 Cuidado!</p>
                          <p className="text-red-700 text-sm">
                            Seu lucro está muito baixo! Você precisa aumentar o preço ou reduzir os custos urgentemente.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Exemplo Prático */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-semibold text-blue-900 mb-2">💡 Na prática:</p>
                  <p className="text-sm text-blue-800">
                    Se você vender <strong>10 {nomeProduto || 'produtos'}</strong>, você vai lucrar:{' '}
                    <strong className="text-green-600">R$ {(lucro * 10).toFixed(2)}</strong>
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    Se você vender <strong>100 {nomeProduto || 'produtos'}</strong>, você vai lucrar:{' '}
                    <strong className="text-green-600">R$ {(lucro * 100).toFixed(2)}</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={limparCampos}
                variant="outline"
                className="flex-1"
              >
                🔄 Calcular Outro
              </Button>
              <Button
                onClick={salvarCalculo}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!status}
              >
                💾 Salvar Cálculo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dicas */}
        <Card className="mt-6 border-2 border-purple-100">
          <CardHeader className="bg-purple-50">
            <CardTitle className="text-lg">💡 Dicas Importantes</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-semibold">CMV Ideal: 25% a 35%</p>
                  <p className="text-sm text-gray-600">Quanto menor, melhor é seu lucro!</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <p className="font-semibold">Some TODOS os ingredientes</p>
                  <p className="text-sm text-gray-600">Não esqueça nada: embalagem, molho, tempero, etc.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <p className="font-semibold">Revise seus preços regularmente</p>
                  <p className="text-sm text-gray-600">Se os ingredientes ficarem mais caros, ajuste o preço de venda!</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
