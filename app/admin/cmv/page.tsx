'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Calculator, Plus, Trash2, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PriceInput } from '@/components/PriceInput';

interface Ingrediente {
  id: string;
  nome: string;
  custo: string;
}

interface CalculoSalvo {
  id: string;
  nomeProduto: string;
  precoVenda: string;
  ingredientes: Ingrediente[];
  custoTotal: number;
  cmvPercentual: number;
  lucro: number;
  createdAt: string;
}

export default function CMVSimples() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Estados
  const [nomeProduto, setNomeProduto] = useState('');
  const [precoVenda, setPrecoVenda] = useState('');
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([
    { id: '1', nome: '', custo: '' }
  ]);
  
  // Resultados
  const [custoTotal, setCustoTotal] = useState(0);
  const [cmvPercentual, setCmvPercentual] = useState(0);
  const [lucro, setLucro] = useState(0);
  const [statusCMV, setStatusCMV] = useState<'bom' | 'atencao' | 'ruim' | null>(null);
  const [calculosSalvos, setCalculosSalvos] = useState<CalculoSalvo[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace('/auth/login');
    }
  }, [session, status]);

  useEffect(() => {
    if (!session?.user?.email) return;
    const storageKey = `cmv_calculos:${session.user.email}`;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setCalculosSalvos(parsed);
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [session?.user?.email]);

  // Calcular custo total dos ingredientes
  useEffect(() => {
    const total = ingredientes.reduce((acc, ing) => {
      const custo = parseFloat(ing.custo) || 0;
      return acc + custo;
    }, 0);
    setCustoTotal(total);
  }, [ingredientes]);

  // Calcular CMV automaticamente
  useEffect(() => {
    const preco = parseFloat(precoVenda) || 0;

    if (preco > 0 && custoTotal > 0) {
      const cmv = (custoTotal / preco) * 100;
      const lucroCalculado = preco - custoTotal;

      setCmvPercentual(cmv);
      setLucro(lucroCalculado);

      // Definir status
      if (cmv <= 30) {
        setStatusCMV('bom');
      } else if (cmv <= 40) {
        setStatusCMV('atencao');
      } else {
        setStatusCMV('ruim');
      }
    } else {
      setCmvPercentual(0);
      setLucro(0);
      setStatusCMV(null);
    }
  }, [precoVenda, custoTotal]);

  const adicionarIngrediente = () => {
    setIngredientes([
      ...ingredientes,
      { id: Date.now().toString(), nome: '', custo: '' }
    ]);
  };

  const removerIngrediente = (id: string) => {
    if (ingredientes.length === 1) {
      toast.error('Você precisa ter pelo menos 1 ingrediente!');
      return;
    }
    setIngredientes(ingredientes.filter(ing => ing.id !== id));
  };

  const atualizarIngrediente = (id: string, campo: 'nome' | 'custo', valor: string) => {
    setIngredientes(ingredientes.map(ing => 
      ing.id === id ? { ...ing, [campo]: valor } : ing
    ));
  };

  const limparCampos = () => {
    setNomeProduto('');
    setPrecoVenda('');
    setIngredientes([{ id: '1', nome: '', custo: '' }]);
    setCustoTotal(0);
    setCmvPercentual(0);
    setLucro(0);
    setStatusCMV(null);
  };

  const salvarCalculo = () => {
    if (!nomeProduto || !precoVenda || ingredientes.every(ing => !ing.nome)) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }

    if (!session?.user?.email) {
      toast.error('Você precisa estar logado para salvar');
      return;
    }

    const storageKey = `cmv_calculos:${session.user.email}`;
    const novoCalculo: CalculoSalvo = {
      id: Date.now().toString(),
      nomeProduto: nomeProduto.trim(),
      precoVenda,
      ingredientes: ingredientes
        .filter((ing) => ing.nome.trim() || ing.custo)
        .map((ing) => ({ ...ing, nome: ing.nome.trim() })),
      custoTotal,
      cmvPercentual,
      lucro,
      createdAt: new Date().toISOString()
    };

    const atualizados = [novoCalculo, ...calculosSalvos].slice(0, 50);
    setCalculosSalvos(atualizados);
    localStorage.setItem(storageKey, JSON.stringify(atualizados));
    toast.success(`✅ Cálculo de "${novoCalculo.nomeProduto}" salvo!`);
    limparCampos();
  };

  const carregarCalculo = (calculo: CalculoSalvo) => {
    setNomeProduto(calculo.nomeProduto);
    setPrecoVenda(calculo.precoVenda);
    setIngredientes(
      calculo.ingredientes.length > 0
        ? calculo.ingredientes.map((ing) => ({
            id: ing.id || Date.now().toString(),
            nome: ing.nome,
            custo: ing.custo
          }))
        : [{ id: '1', nome: '', custo: '' }]
    );
    toast.success('Cálculo carregado');
  };

  const excluirCalculo = (id: string) => {
    if (!session?.user?.email) return;
    const storageKey = `cmv_calculos:${session.user.email}`;
    const atualizados = calculosSalvos.filter((c) => c.id !== id);
    setCalculosSalvos(atualizados);
    localStorage.setItem(storageKey, JSON.stringify(atualizados));
    toast.success('Cálculo removido');
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
              <PriceInput
                value={precoVenda}
                onChange={setPrecoVenda}
                placeholder="Ex: 45,00"
                className="text-lg h-12"
              />
              <p className="text-sm text-gray-500">💡 Quanto o cliente paga por este produto</p>
            </div>

            {/* Passo 3: Lista de Ingredientes */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">3</span>
                Liste TODOS os ingredientes
              </Label>
              <p className="text-sm text-gray-500">💡 Não esqueça nada: embalagem, molho, tempero, etc.</p>

              {/* Tabela de Ingredientes */}
              <div className="space-y-2">
                {ingredientes.map((ingrediente, index) => (
                  <div key={ingrediente.id} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Input
                        placeholder={`Ex: ${index === 0 ? 'Farinha' : index === 1 ? 'Queijo' : index === 2 ? 'Calabresa' : 'Ingrediente'}`}
                        value={ingrediente.nome}
                        onChange={(e) => atualizarIngrediente(ingrediente.id, 'nome', e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="w-32">
                      <PriceInput
                        value={ingrediente.custo}
                        onChange={(value) => atualizarIngrediente(ingrediente.id, 'custo', value)}
                        placeholder="0,00"
                        className="h-11"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removerIngrediente(ingrediente.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Botão Adicionar Ingrediente */}
              <Button
                type="button"
                variant="outline"
                onClick={adicionarIngrediente}
                className="w-full border-dashed border-2 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Ingrediente
              </Button>

              {/* Custo Total */}
              {custoTotal > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">💰 Custo Total dos Ingredientes:</span>
                    <span className="text-2xl font-bold text-blue-600">R$ {custoTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Resultado */}
            {statusCMV && (
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
                  statusCMV === 'bom' ? 'bg-green-100 border-2 border-green-300' :
                  statusCMV === 'atencao' ? 'bg-yellow-100 border-2 border-yellow-300' :
                  'bg-red-100 border-2 border-red-300'
                }`}>
                  <div className="flex items-start gap-3">
                    {statusCMV === 'bom' && (
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
                    {statusCMV === 'atencao' && (
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
                    {statusCMV === 'ruim' && (
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
                disabled={!statusCMV}
              >
                💾 Salvar Cálculo
              </Button>
            </div>
          </CardContent>
        </Card>

        {calculosSalvos.length > 0 && (
          <Card className="mt-6 border-2 border-gray-100">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-lg">📌 Cálculos salvos</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {calculosSalvos.slice(0, 10).map((calculo) => (
                <div key={calculo.id} className="flex items-center justify-between gap-3 bg-white border rounded-lg p-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{calculo.nomeProduto}</p>
                    <p className="text-sm text-gray-600">
                      CMV {calculo.cmvPercentual.toFixed(1)}% • Lucro R$ {calculo.lucro.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => carregarCalculo(calculo)}>
                      Abrir
                    </Button>
                    <Button type="button" variant="outline" onClick={() => excluirCalculo(calculo.id)}>
                      Remover
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

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
