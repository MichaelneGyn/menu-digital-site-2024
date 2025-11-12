'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

export default function ComparacaoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            Virtual Cardápio
          </Link>
          <Link href="/">
            <Button variant="ghost">← Voltar</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
          💰 Quanto Você Realmente Paga?
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Comparação real: 100 pedidos de R$ 50 por mês
        </p>
      </div>

      {/* Comparação */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* Cards de Comparação */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* iFood */}
          <div className="bg-red-50 border-4 border-red-200 rounded-3xl p-8 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full font-bold">
              ❌ CARO
            </div>
            
            <div className="text-center mb-8 mt-4">
              <h2 className="text-3xl font-black text-gray-900 mb-2">iFood</h2>
              <p className="text-gray-600">Plataforma tradicional</p>
            </div>

            <div className="space-y-6">
              {/* Mensalidade */}
              <div className="bg-white rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 font-semibold">Mensalidade:</span>
                  <span className="text-2xl font-black text-gray-900">R$ 150</span>
                </div>
                <p className="text-xs text-gray-500">Taxa fixa mensal</p>
              </div>

              {/* Comissão */}
              <div className="bg-white rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 font-semibold">Comissão:</span>
                  <span className="text-2xl font-black text-red-600">27%</span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  <div className="flex justify-between">
                    <span>100 pedidos × R$ 50:</span>
                    <span className="font-semibold">R$ 5.000</span>
                  </div>
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>Comissão 27%:</span>
                    <span>-R$ 1.350</span>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="bg-red-600 rounded-xl p-6 text-white">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">CUSTO TOTAL/MÊS:</span>
                  <span className="text-4xl font-black">R$ 1.500</span>
                </div>
              </div>

              {/* Desvantagens */}
              <div className="space-y-2 pt-4">
                <div className="flex items-start gap-2">
                  <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Dados dos clientes são do iFood</span>
                </div>
                <div className="flex items-start gap-2">
                  <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Sem controle sobre promoções</span>
                </div>
                <div className="flex items-start gap-2">
                  <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Dependência da plataforma</span>
                </div>
              </div>
            </div>
          </div>

          {/* Virtual Cardápio */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-4 border-green-400 rounded-3xl p-8 relative shadow-2xl">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-2 rounded-full font-bold">
              ✅ ECONÔMICO
            </div>
            
            <div className="text-center mb-8 mt-4">
              <h2 className="text-3xl font-black text-gray-900 mb-2">Virtual Cardápio</h2>
              <p className="text-gray-600">Seu próprio sistema</p>
            </div>

            <div className="space-y-6">
              {/* Mensalidade */}
              <div className="bg-white rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 font-semibold">Mensalidade:</span>
                  <span className="text-2xl font-black text-gray-900">R$ 69,90</span>
                </div>
                <p className="text-xs text-green-600 font-semibold">🎉 Primeiros 10: R$ 34,95 vitalício!</p>
              </div>

              {/* Comissão */}
              <div className="bg-white rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 font-semibold">Comissão:</span>
                  <span className="text-2xl font-black text-green-600">0%</span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  <div className="flex justify-between">
                    <span>100 pedidos × R$ 50:</span>
                    <span className="font-semibold">R$ 5.000</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Comissão 0%:</span>
                    <span>R$ 0</span>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="bg-green-600 rounded-xl p-6 text-white">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">CUSTO TOTAL/MÊS:</span>
                  <span className="text-4xl font-black">R$ 69,90</span>
                </div>
              </div>

              {/* Vantagens */}
              <div className="space-y-2 pt-4">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-semibold">Dados dos clientes são SEUS</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-semibold">Controle total sobre promoções</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-semibold">Independência total</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Economia */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl mb-8">
          <p className="text-2xl mb-4 opacity-90">💰 Você economiza vs iFood:</p>
          <p className="text-6xl md:text-7xl font-black mb-4">R$ 1.430</p>
          <p className="text-3xl font-bold mb-8">por mês</p>
          
          <div className="border-t border-white/30 pt-6 mt-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-lg opacity-90 mb-2">Em 6 meses:</p>
                <p className="text-3xl font-black">R$ 8.580</p>
              </div>
              <div>
                <p className="text-lg opacity-90 mb-2">Em 1 ano:</p>
                <p className="text-3xl font-black">R$ 17.160</p>
              </div>
              <div>
                <p className="text-lg opacity-90 mb-2">Em 2 anos:</p>
                <p className="text-3xl font-black">R$ 34.320</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calculadora Interativa */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-200 mb-8">
          <h3 className="text-2xl font-black text-center mb-6">🧮 Calcule Sua Economia</h3>
          
          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantos pedidos você faz por mês?
              </label>
              <input
                type="number"
                placeholder="Ex: 100"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-lg"
                id="pedidos"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Qual seu ticket médio?
              </label>
              <input
                type="number"
                placeholder="Ex: 50"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-lg"
                id="ticket"
              />
            </div>
            
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
              onClick={() => {
                const pedidos = (document.getElementById('pedidos') as HTMLInputElement)?.value;
                const ticket = (document.getElementById('ticket') as HTMLInputElement)?.value;
                
                if (pedidos && ticket) {
                  const faturamento = parseInt(pedidos) * parseFloat(ticket);
                  const comissaoIfood = faturamento * 0.27 + 150;
                  const custoVC = 69.90;
                  const economia = comissaoIfood - custoVC;
                  
                  alert(`💰 Sua Economia:\n\nFaturamento: R$ ${faturamento.toFixed(2)}\niFood: R$ ${comissaoIfood.toFixed(2)}/mês\nVirtual Cardápio: R$ ${custoVC}/mês\n\n✅ VOCÊ ECONOMIZA: R$ ${economia.toFixed(2)}/mês\n📈 EM 1 ANO: R$ ${(economia * 12).toFixed(2)}`);
                }
              }}
            >
              Calcular Economia
            </Button>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center">
          <Link href="/auth/login?register=true">
            <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xl py-8 px-12 font-black shadow-2xl transform hover:scale-105 transition-all">
              🔥 COMEÇAR A ECONOMIZAR AGORA
            </Button>
          </Link>
          <p className="text-gray-600 mt-4 font-semibold">
            ✅ 30 dias grátis • ✅ Sem cartão de crédito • ✅ Cancele quando quiser
          </p>
        </div>
      </div>
    </div>
  );
}
