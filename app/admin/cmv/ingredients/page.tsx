'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar
} from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  pricePerUnit: number;
  supplier?: string;
  lastPurchase?: string;
  notes?: string;
  priceHistory: { id: string; price: number; date: string }[];
  _count: { recipeItems: number };
}

export default function IngredientsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    unit: 'kg',
    pricePerUnit: '',
    supplier: '',
    lastPurchase: '',
    notes: ''
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace('/auth/login');
      return;
    }
    fetchIngredients();
  }, [session, status]);

  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/ingredients');
      if (response.ok) {
        const data = await response.json();
        setIngredients(data);
      }
    } catch (error) {
      console.error('Erro ao buscar ingredientes:', error);
      toast.error('Erro ao carregar ingredientes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.pricePerUnit) {
      toast.error('Nome e preço são obrigatórios');
      return;
    }

    try {
      const url = editingIngredient
        ? `/api/ingredients?id=${editingIngredient.id}`
        : '/api/ingredients';
      
      const method = editingIngredient ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pricePerUnit: parseFloat(formData.pricePerUnit)
        })
      });

      if (response.ok) {
        toast.success(editingIngredient ? 'Ingrediente atualizado!' : 'Ingrediente criado!');
        setShowModal(false);
        resetForm();
        fetchIngredients();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao salvar ingrediente');
      }
    } catch (error) {
      console.error('Erro ao salvar ingrediente:', error);
      toast.error('Erro ao salvar ingrediente');
    }
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setFormData({
      name: ingredient.name,
      unit: ingredient.unit,
      pricePerUnit: ingredient.pricePerUnit.toString(),
      supplier: ingredient.supplier || '',
      lastPurchase: ingredient.lastPurchase ? ingredient.lastPurchase.split('T')[0] : '',
      notes: ingredient.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (ingredient: Ingredient) => {
    if (ingredient._count.recipeItems > 0) {
      toast.error(`Este ingrediente está sendo usado em ${ingredient._count.recipeItems} receita(s)`);
      return;
    }

    if (!confirm(`Deletar "${ingredient.name}"?`)) return;

    try {
      const response = await fetch(`/api/ingredients?id=${ingredient.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Ingrediente deletado!');
        fetchIngredients();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao deletar ingrediente');
      }
    } catch (error) {
      console.error('Erro ao deletar ingrediente:', error);
      toast.error('Erro ao deletar ingrediente');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      unit: 'kg',
      pricePerUnit: '',
      supplier: '',
      lastPurchase: '',
      notes: ''
    });
    setEditingIngredient(null);
  };

  const getPriceChange = (ingredient: Ingredient) => {
    if (ingredient.priceHistory.length < 2) return null;
    
    const current = ingredient.priceHistory[0].price;
    const previous = ingredient.priceHistory[1].price;
    const change = ((current - previous) / previous) * 100;
    
    return {
      value: change,
      isPositive: change > 0
    };
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="pizza-loader mb-4"></div>
          <p>Carregando ingredientes...</p>
        </div>
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
                  <Package className="w-8 h-8 text-blue-600" />
                  Ingredientes
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Gerencie os ingredientes e seus custos
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Ingrediente
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Ingredientes</CardTitle>
              <Package className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ingredients.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Uso</CardTitle>
              <DollarSign className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ingredients.filter(i => i._count.recipeItems > 0).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sem Uso</CardTitle>
              <Package className="w-5 h-5 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ingredients.filter(i => i._count.recipeItems === 0).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Ingredientes */}
        <Card>
          <CardHeader>
            <CardTitle>Todos os Ingredientes</CardTitle>
          </CardHeader>
          <CardContent>
            {ingredients.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum ingrediente cadastrado
                </h3>
                <p className="text-gray-600 mb-4">
                  Comece adicionando os ingredientes que você usa nas suas receitas
                </p>
                <Button
                  onClick={() => setShowModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Ingrediente
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {ingredients.map((ingredient) => {
                  const priceChange = getPriceChange(ingredient);
                  
                  return (
                    <div
                      key={ingredient.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-lg">{ingredient.name}</h4>
                          {ingredient._count.recipeItems > 0 && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Usado em {ingredient._count.recipeItems} receita(s)
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>
                            <DollarSign className="w-4 h-4 inline mr-1" />
                            R$ {ingredient.pricePerUnit.toFixed(2)}/{ingredient.unit}
                          </span>
                          {ingredient.supplier && (
                            <span>Fornecedor: {ingredient.supplier}</span>
                          )}
                          {ingredient.lastPurchase && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(ingredient.lastPurchase).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                        {priceChange && (
                          <div className="mt-2">
                            <Badge
                              className={
                                priceChange.isPositive
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-green-100 text-green-700'
                              }
                            >
                              {priceChange.isPositive ? (
                                <TrendingUp className="w-3 h-3 mr-1" />
                              ) : (
                                <TrendingDown className="w-3 h-3 mr-1" />
                              )}
                              {priceChange.isPositive ? '+' : ''}
                              {priceChange.value.toFixed(1)}%
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(ingredient)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(ingredient)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Adicionar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingIngredient ? 'Editar Ingrediente' : 'Novo Ingrediente'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Queijo Mussarela"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="unit">Unidade *</Label>
                    <select
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    >
                      <option value="kg">Quilograma (kg)</option>
                      <option value="g">Grama (g)</option>
                      <option value="L">Litro (L)</option>
                      <option value="ml">Mililitro (ml)</option>
                      <option value="unidade">Unidade</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="pricePerUnit">Preço por unidade *</Label>
                    <Input
                      id="pricePerUnit"
                      type="number"
                      step="0.01"
                      value={formData.pricePerUnit}
                      onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="supplier">Fornecedor</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      placeholder="Nome do fornecedor"
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastPurchase">Última Compra</Label>
                    <Input
                      id="lastPurchase"
                      type="date"
                      value={formData.lastPurchase}
                      onChange={(e) => setFormData({ ...formData, lastPurchase: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md min-h-[80px]"
                    placeholder="Observações sobre o ingrediente..."
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingIngredient ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
