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
  ChefHat,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  X,
  DollarSign,
  Percent
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: { name: string };
}

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  pricePerUnit: number;
}

interface RecipeItem {
  ingredientId: string;
  quantity: number;
  ingredient?: Ingredient;
  cost?: number;
}

interface Recipe {
  id: string;
  totalCost: number;
  cmv: number;
  margin: number;
  notes?: string;
  menuItem: MenuItem;
  items: (RecipeItem & { ingredient: Ingredient })[];
}

export default function RecipesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState('');
  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([{ ingredientId: '', quantity: 0 }]);
  const [notes, setNotes] = useState('');
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace('/auth/login');
      return;
    }
    fetchData();
  }, [session, status]);

  const fetchData = async () => {
    try {
      const [recipesRes, itemsRes, ingredientsRes] = await Promise.all([
        fetch('/api/recipes'),
        fetch('/api/menu-items'),
        fetch('/api/ingredients')
      ]);

      if (recipesRes.ok) setRecipes(await recipesRes.json());
      if (itemsRes.ok) setMenuItems(await itemsRes.json());
      if (ingredientsRes.ok) setIngredients(await ingredientsRes.json());
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePreview = () => {
    let totalCost = 0;
    
    recipeItems.forEach(item => {
      const ingredient = ingredients.find(i => i.id === item.ingredientId);
      if (ingredient && item.quantity > 0) {
        totalCost += item.quantity * ingredient.pricePerUnit;
      }
    });

    const menuItem = menuItems.find(m => m.id === selectedMenuItem);
    const price = menuItem?.price || 0;
    const cmv = price > 0 ? (totalCost / price) * 100 : 0;
    const margin = 100 - cmv;

    return { totalCost, cmv, margin, price };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMenuItem) {
      toast.error('Selecione um produto');
      return;
    }

    const validItems = recipeItems.filter(item => item.ingredientId && item.quantity > 0);
    if (validItems.length === 0) {
      toast.error('Adicione pelo menos um ingrediente');
      return;
    }

    try {
      const url = editingRecipe
        ? `/api/recipes?id=${editingRecipe.id}`
        : '/api/recipes';
      
      const method = editingRecipe ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuItemId: selectedMenuItem,
          items: validItems,
          notes
        })
      });

      if (response.ok) {
        toast.success(editingRecipe ? 'Receita atualizada!' : 'Receita criada!');
        setShowModal(false);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao salvar receita');
      }
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      toast.error('Erro ao salvar receita');
    }
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setSelectedMenuItem(recipe.menuItem.id);
    setRecipeItems(recipe.items.map(item => ({
      ingredientId: item.ingredient.id,
      quantity: item.quantity
    })));
    setNotes(recipe.notes || '');
    setShowModal(true);
  };

  const handleDelete = async (recipe: Recipe) => {
    if (!confirm(`Deletar receita de "${recipe.menuItem.name}"?`)) return;

    try {
      const response = await fetch(`/api/recipes?id=${recipe.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Receita deletada!');
        fetchData();
      } else {
        toast.error('Erro ao deletar receita');
      }
    } catch (error) {
      console.error('Erro ao deletar receita:', error);
      toast.error('Erro ao deletar receita');
    }
  };

  const addIngredientRow = () => {
    setRecipeItems([...recipeItems, { ingredientId: '', quantity: 0 }]);
  };

  const removeIngredientRow = (index: number) => {
    setRecipeItems(recipeItems.filter((_, i) => i !== index));
  };

  const updateRecipeItem = (index: number, field: 'ingredientId' | 'quantity', value: any) => {
    const newItems = [...recipeItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setRecipeItems(newItems);
  };

  const resetForm = () => {
    setSelectedMenuItem('');
    setRecipeItems([{ ingredientId: '', quantity: 0 }]);
    setNotes('');
    setEditingRecipe(null);
  };

  const getCMVStatus = (cmv: number) => {
    if (cmv <= 28) return { color: 'bg-green-100 text-green-800', label: 'Excelente' };
    if (cmv <= 32) return { color: 'bg-blue-100 text-blue-800', label: 'Bom' };
    if (cmv <= 35) return { color: 'bg-yellow-100 text-yellow-800', label: 'Atenção' };
    return { color: 'bg-red-100 text-red-800', label: 'Crítico' };
  };

  const preview = calculatePreview();

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="pizza-loader mb-4"></div>
          <p>Carregando receitas...</p>
        </div>
      </div>
    );
  }

  // Produtos sem receita
  const itemsWithRecipes = recipes.map(r => r.menuItem.id);
  const itemsWithoutRecipes = menuItems.filter(item => !itemsWithRecipes.includes(item.id));

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
                  <ChefHat className="w-8 h-8 text-purple-600" />
                  Receitas
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Cadastre o custo de cada produto do cardápio
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Receita
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas Criadas</CardTitle>
              <ChefHat className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recipes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CMV Médio</CardTitle>
              <Percent className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recipes.length > 0
                  ? (recipes.reduce((sum, r) => sum + r.cmv, 0) / recipes.length).toFixed(1)
                  : '0'}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sem Receita</CardTitle>
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{itemsWithoutRecipes.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Produtos sem receita */}
        {itemsWithoutRecipes.length > 0 && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">
                ⚠️ Produtos sem custo cadastrado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {itemsWithoutRecipes.slice(0, 10).map(item => (
                  <Badge key={item.id} variant="outline" className="bg-white">
                    {item.name}
                  </Badge>
                ))}
                {itemsWithoutRecipes.length > 10 && (
                  <Badge variant="outline" className="bg-white">
                    +{itemsWithoutRecipes.length - 10} mais
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Receitas */}
        <Card>
          <CardHeader>
            <CardTitle>Todas as Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            {recipes.length === 0 ? (
              <div className="text-center py-12">
                <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma receita cadastrada
                </h3>
                <p className="text-gray-600 mb-4">
                  Crie receitas para calcular o CMV dos seus produtos
                </p>
                <Button
                  onClick={() => setShowModal(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Receita
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recipes.map((recipe) => {
                  const status = getCMVStatus(recipe.cmv);
                  
                  return (
                    <div
                      key={recipe.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-lg">{recipe.menuItem.name}</h4>
                          <Badge variant="outline" className="bg-white">
                            {recipe.menuItem.category.name}
                          </Badge>
                          <Badge className={status.color}>
                            {status.label}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-gray-600">Preço: </span>
                            <span className="font-semibold">
                              R$ {recipe.menuItem.price.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Custo: </span>
                            <span className="font-semibold">
                              R$ {recipe.totalCost.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">CMV: </span>
                            <span className={`font-semibold ${
                              recipe.cmv <= 28 ? 'text-green-600' :
                              recipe.cmv <= 32 ? 'text-blue-600' :
                              recipe.cmv <= 35 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {recipe.cmv.toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Lucro: </span>
                            <span className="font-semibold text-green-600">
                              R$ {(recipe.menuItem.price - recipe.totalCost).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                          {recipe.items.length} ingrediente(s)
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(recipe)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(recipe)}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-4xl my-8">
            <CardHeader>
              <CardTitle>
                {editingRecipe ? 'Editar Receita' : 'Nova Receita'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Selecionar Produto */}
                <div>
                  <Label htmlFor="menuItem">Produto do Cardápio *</Label>
                  <select
                    id="menuItem"
                    value={selectedMenuItem}
                    onChange={(e) => setSelectedMenuItem(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                    disabled={!!editingRecipe}
                  >
                    <option value="">Selecione um produto</option>
                    {menuItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} - R$ {item.price.toFixed(2)} ({item.category.name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ingredientes */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Ingredientes *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addIngredientRow}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {recipeItems.map((item, index) => (
                      <div key={index} className="flex gap-3">
                        <select
                          value={item.ingredientId}
                          onChange={(e) => updateRecipeItem(index, 'ingredientId', e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-md"
                          required
                        >
                          <option value="">Selecione um ingrediente</option>
                          {ingredients.map(ing => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name} - R$ {ing.pricePerUnit.toFixed(2)}/{ing.unit}
                            </option>
                          ))}
                        </select>

                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Qtd"
                          value={item.quantity || ''}
                          onChange={(e) => updateRecipeItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-32"
                          required
                        />

                        {recipeItems.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeIngredientRow(index)}
                            className="text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview do Cálculo */}
                {selectedMenuItem && preview.totalCost > 0 && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-base">Preview do Cálculo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Preço de Venda</div>
                          <div className="text-lg font-bold">
                            R$ {preview.price.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Custo Total</div>
                          <div className="text-lg font-bold">
                            R$ {preview.totalCost.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">CMV</div>
                          <div className={`text-lg font-bold ${
                            preview.cmv <= 28 ? 'text-green-600' :
                            preview.cmv <= 32 ? 'text-blue-600' :
                            preview.cmv <= 35 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {preview.cmv.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Lucro Bruto</div>
                          <div className="text-lg font-bold text-green-600">
                            R$ {(preview.price - preview.totalCost).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Observações */}
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md min-h-[60px]"
                    placeholder="Observações sobre a receita..."
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
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
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                    {editingRecipe ? 'Atualizar' : 'Criar'}
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
