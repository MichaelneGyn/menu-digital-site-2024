'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Save, Trash2, TrendingUp, Eye, MousePointer, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { withSubscriptionCheck } from '@/components/withSubscriptionCheck';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: {
    name: string;
  };
}

interface UpsellRule {
  id?: string;
  name: string;
  active: boolean;
  displayLocation: string;
  priority: number;
  productIds: string[];
  productDiscounts?: string;
  title?: string;
  subtitle?: string;
  views?: number;
  clicks?: number;
  conversions?: number;
  revenue?: number;
}

function UpsellPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [rules, setRules] = useState<UpsellRule[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productDiscounts, setProductDiscounts] = useState<{[key: string]: number}>({});
  
  // Formulário
  const [formData, setFormData] = useState<UpsellRule>({
    name: 'Sugestões Principais',
    active: true,
    displayLocation: 'checkout',
    priority: 0,
    productIds: [],
    productDiscounts: '{}',
    title: '🔥 Oferta Especial!',
    subtitle: 'Aproveite enquanto está no carrinho:',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Buscar produtos do cardápio
      const menuResponse = await fetch('/api/menu-items');
      if (menuResponse.ok) {
        const menuData = await menuResponse.json();
        setMenuItems(menuData);
      }

      // Buscar regras de upsell existentes
      const upsellResponse = await fetch('/api/upsell');
      if (upsellResponse.ok) {
        const upsellData = await upsellResponse.json();
        setRules(upsellData);

        // Se existe regra, carregar a primeira
        if (upsellData.length > 0) {
          const firstRule = upsellData[0];
          setFormData(firstRule);
          setSelectedProducts(firstRule.productIds || []);
          
          // Carregar descontos
          if (firstRule.productDiscounts) {
            try {
              const discounts = JSON.parse(firstRule.productDiscounts);
              setProductDiscounts(discounts);
            } catch (e) {
              setProductDiscounts({});
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProduct = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        if (prev.length >= 6) {
          toast.error('Máximo de 6 produtos por regra');
          return prev;
        }
        return [...prev, productId];
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (selectedProducts.length === 0) {
        toast.error('Selecione pelo menos 1 produto');
        return;
      }

      const dataToSave = {
        ...formData,
        productIds: selectedProducts,
        productDiscounts: JSON.stringify(productDiscounts),
      };

      const method = formData.id ? 'PUT' : 'POST';
      const response = await fetch('/api/upsell', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar');
      }

      toast.success('✅ Configuração de upsell salva com sucesso!');
      fetchData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configuração');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscountChange = (productId: string, discount: number) => {
    setProductDiscounts(prev => ({
      ...prev,
      [productId]: Math.max(0, Math.min(100, discount)) // Entre 0 e 100%
    }));
  };

  const handleDelete = async () => {
    if (!formData.id) return;

    if (!confirm('Tem certeza que deseja deletar esta regra de upsell?')) {
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`/api/upsell?id=${formData.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar');
      }

      toast.success('Regra deletada com sucesso!');
      
      // Resetar formulário
      setFormData({
        name: 'Sugestões Principais',
        active: true,
        displayLocation: 'checkout',
        priority: 0,
        productIds: [],
        title: 'Complete seu pedido! 🎉',
        subtitle: 'Clientes também levaram:',
      });
      setSelectedProducts([]);
      
      fetchData();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao deletar regra');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Calcular métricas
  const totalViews = rules.reduce((sum, rule) => sum + (rule.views || 0), 0);
  const totalClicks = rules.reduce((sum, rule) => sum + (rule.clicks || 0), 0);
  const totalConversions = rules.reduce((sum, rule) => sum + (rule.conversions || 0), 0);
  const totalRevenue = rules.reduce((sum, rule) => sum + (rule.revenue || 0), 0);
  const conversionRate = totalViews > 0 ? ((totalConversions / totalViews) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🎯 Upsell</h1>
              <p className="text-gray-600 mt-1">Aumente suas vendas sugerindo produtos complementares</p>
            </div>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Visualizações</p>
                  <p className="text-2xl font-bold">{totalViews}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cliques</p>
                  <p className="text-2xl font-bold">{totalClicks}</p>
                </div>
                <MousePointer className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conversões</p>
                  <p className="text-2xl font-bold">{totalConversions}</p>
                  <p className="text-xs text-green-600">{conversionRate}% taxa</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Receita Extra</p>
                  <p className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuração */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configuração de Upsell</CardTitle>
            <CardDescription>
              Configure quais produtos serão sugeridos no checkout
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-base font-medium">Upsell Ativo</Label>
                <p className="text-sm text-gray-600">Mostrar sugestões para os clientes</p>
              </div>
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>

            {/* Textos Personalizados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Complete seu pedido! 🎉"
                />
              </div>

              <div>
                <Label htmlFor="subtitle">Subtítulo</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Clientes também levaram:"
                />
              </div>
            </div>

            {/* Seleção de Produtos */}
            <div>
              <Label className="text-base font-medium mb-3 block">
                Produtos para Upsell ({selectedProducts.length}/6)
              </Label>
              <p className="text-sm text-gray-600 mb-4">
                Selecione até 6 produtos que serão sugeridos no checkout
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1">
                {menuItems.map((item) => {
                  const isSelected = selectedProducts.includes(item.id);
                  const discount = productDiscounts[item.id]; // Sem || 0 para permitir undefined
                  const discountedPrice = discount && discount > 0 ? item.price * (1 - discount / 100) : item.price;
                  
                  return (
                    <div
                      key={item.id}
                      className={`
                        relative p-3 rounded-lg border-2 transition-all
                        ${isSelected 
                          ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200' 
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                        }
                      `}
                    >
                      <button
                        onClick={() => handleToggleProduct(item.id)}
                        className="w-full text-left"
                      >
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-20 object-cover rounded-md mb-2"
                          />
                        )}
                        <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.category.name}</p>
                        <p className="text-sm font-bold text-green-600 mt-1">
                          R$ {item.price.toFixed(2)}
                        </p>

                        {isSelected && (
                          <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                            ✓
                          </div>
                        )}
                      </button>

                      {/* Campo de Desconto */}
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-orange-200" onClick={(e) => e.stopPropagation()}>
                          <label className="text-xs font-semibold text-gray-700 block mb-1">
                            💰 Desconto (%):
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={discount ?? ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                // Se apagar tudo, remove o desconto
                                setProductDiscounts(prev => {
                                  const newDiscounts = {...prev};
                                  delete newDiscounts[item.id];
                                  return newDiscounts;
                                });
                              } else {
                                // Remove zeros à esquerda e converte para número
                                const numValue = parseInt(value.replace(/^0+/, '') || '0');
                                handleDiscountChange(item.id, numValue);
                              }
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Ex: 15"
                          />
                          {discount > 0 && (
                            <div className="mt-2 text-xs">
                              <p className="text-gray-500 line-through">De: R$ {item.price.toFixed(2)}</p>
                              <p className="text-green-600 font-bold">Por: R$ {discountedPrice.toFixed(2)}</p>
                              <p className="text-orange-600 font-semibold">Economia: R$ {(item.price - discountedPrice).toFixed(2)}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={saving || selectedProducts.length === 0}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Configuração'}
              </Button>

              {formData.id && (
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  disabled={saving}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deletar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dica */}
        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="text-3xl">🔥</div>
              <div>
                <h3 className="font-semibold text-orange-900 mb-2">Dicas para AUMENTAR CONVERSÕES:</h3>
                <ul className="text-sm text-orange-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">💰</span>
                    <span><strong>USE DESCONTOS:</strong> 10-20% de desconto aumenta conversão em até 300%!</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">🍕</span>
                    <span><strong>Produtos Complementares:</strong> Pizza + Refrigerante, Hambúrguer + Batata</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">💵</span>
                    <span><strong>Preço Atrativo:</strong> Desconto de R$5-10 gera urgência de compra</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">📊</span>
                    <span><strong>Teste A/B:</strong> Mude descontos semanalmente e veja o que converte mais</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">🎯</span>
                    <span><strong>3-5 Produtos:</strong> Não exagere nas opções para não confundir</span>
                  </li>
                </ul>
                <div className="mt-3 p-3 bg-white rounded-lg border-2 border-orange-300">
                  <p className="text-xs font-bold text-orange-900">💡 DICA DE OURO:</p>
                  <p className="text-sm text-gray-700 mt-1">
                    Upsell <strong>SEM desconto</strong> converte ~5%. Upsell <strong>COM desconto de 15%</strong> converte ~20%! 
                    <span className="text-orange-600 font-bold"> = 4x mais vendas!</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withSubscriptionCheck(UpsellPage);
