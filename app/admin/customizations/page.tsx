'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, ArrowLeft, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  hasCustomizations: boolean;
  category: { name: string };
}

interface CustomizationOption {
  id: string;
  name: string;
  price: number;
  sortOrder: number;
  isActive: boolean;
}

interface CustomizationGroup {
  id: string;
  name: string;
  description?: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections?: number;
  sortOrder: number;
  isActive: boolean;
  options: CustomizationOption[];
}

export default function CustomizationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [groups, setGroups] = useState<CustomizationGroup[]>([]);
  const [editingGroup, setEditingGroup] = useState<CustomizationGroup | null>(null);
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionPrice, setNewOptionPrice] = useState('0');
  const [restaurantId, setRestaurantId] = useState<string>('');

  useEffect(() => {
    fetchRestaurantAndMenuItems();
  }, []);

  const fetchRestaurantAndMenuItems = async () => {
    try {
      // Buscar o restaurante do usuário
      const restaurantResponse = await fetch('/api/restaurant');
      if (restaurantResponse.ok) {
        const restaurantData = await restaurantResponse.json();
        setRestaurantId(restaurantData.id);
      }

      // Buscar os itens do menu
      const response = await fetch('/api/menu-items');
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data.filter((item: MenuItem) => item.hasCustomizations));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupsForItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/menu-items/${itemId}/customizations`);
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Erro ao carregar personalizações');
    }
  };

  const handleSelectItem = async (item: MenuItem) => {
    setSelectedItem(item);
    await fetchGroupsForItem(item.id);
  };

  const handleCreateGroup = () => {
    const newGroup: CustomizationGroup = {
      id: `temp-${Date.now()}`,
      name: '',
      description: '',
      isRequired: false,
      minSelections: 0,
      maxSelections: 1,
      sortOrder: groups.length,
      isActive: true,
      options: [],
    };
    setEditingGroup(newGroup);
  };

  const handleSaveGroup = async () => {
    if (!editingGroup || !selectedItem || !restaurantId) return;

    if (!editingGroup.name.trim()) {
      toast.error('Digite um nome para o grupo');
      return;
    }

    if (editingGroup.options.length === 0) {
      toast.error('Adicione pelo menos uma opção');
      return;
    }

    try {
      const isNew = editingGroup.id.startsWith('temp-');
      
      if (isNew) {
        // Criar novo grupo
        const response = await fetch(`/api/restaurants/${restaurantId}/customizations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingGroup),
        });

        if (response.ok) {
          const newGroup = await response.json();
          
          // Vincular o grupo ao produto
          const linkResponse = await fetch(`/api/menu-items/${selectedItem.id}/link-customizations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupIds: [newGroup.id] }),
          });

          if (linkResponse.ok) {
            toast.success('Grupo criado e vinculado com sucesso!');
            setEditingGroup(null);
            await fetchGroupsForItem(selectedItem.id);
          } else {
            toast.error('Grupo criado mas falha ao vincular');
          }
        } else {
          const error = await response.json();
          toast.error(error.error || 'Erro ao salvar grupo');
        }
      } else {
        // Atualizar grupo existente
        const response = await fetch(`/api/restaurants/${restaurantId}/customizations/${editingGroup.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingGroup),
        });

        if (response.ok) {
          toast.success('Grupo atualizado!');
          setEditingGroup(null);
          await fetchGroupsForItem(selectedItem.id);
        } else {
          toast.error('Erro ao atualizar grupo');
        }
      }
    } catch (error) {
      console.error('Error saving group:', error);
      toast.error('Erro ao salvar grupo');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Tem certeza que deseja excluir este grupo?')) return;

    try {
      const response = await fetch(`/api/restaurants/customizations/${groupId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Grupo excluído!');
        if (selectedItem) {
          await fetchGroupsForItem(selectedItem.id);
        }
      } else {
        toast.error('Erro ao excluir grupo');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Erro ao excluir grupo');
    }
  };

  const handleAddOption = () => {
    if (!editingGroup) return;

    if (!newOptionName.trim()) {
      toast.error('Digite um nome para a opção');
      return;
    }

    const newOption: CustomizationOption = {
      id: `temp-option-${Date.now()}`,
      name: newOptionName.trim(),
      price: parseFloat(newOptionPrice) || 0,
      sortOrder: editingGroup.options.length,
      isActive: true,
    };

    setEditingGroup({
      ...editingGroup,
      options: [...editingGroup.options, newOption],
    });

    setNewOptionName('');
    setNewOptionPrice('0');
  };

  const handleRemoveOption = (optionId: string) => {
    if (!editingGroup) return;

    setEditingGroup({
      ...editingGroup,
      options: editingGroup.options.filter((opt) => opt.id !== optionId),
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
      </div>
    );
  }

  if (!selectedItem) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">🎨 Gerenciar Personalizações</h1>
          <p className="text-gray-600 mt-2">
            Configure grupos de personalização para seus produtos (sabores, bordas, tamanhos, etc.)
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">
                  Nenhum produto com "Opções de Personalização" habilitadas.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Vá em "Adicionar Itens em Massa" e marque a opção "Este produto tem opções de personalização?"
                </p>
              </CardContent>
            </Card>
          ) : (
            menuItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleSelectItem(item)}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <p className="text-sm text-gray-500">{item.category.name}</p>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Edit className="w-4 h-4 mr-2" />
                    Gerenciar Personalizações
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" onClick={() => setSelectedItem(null)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{selectedItem.name}</h1>
          <p className="text-gray-600">Grupos de Personalização</p>
        </div>
      </div>

      {editingGroup ? (
        <Card className="mb-6 border-2 border-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{editingGroup.id.startsWith('temp-') ? '✨ Novo Grupo' : '✏️ Editando Grupo'}</span>
              <Button variant="ghost" size="sm" onClick={() => setEditingGroup(null)}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nome do Grupo */}
            <div>
              <Label>📝 Nome do Grupo *</Label>
              <Input
                placeholder="Ex: Escolha o sabor da Pizza Salgada G, Bordas Irresistíveis"
                value={editingGroup.name}
                onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Esse nome aparecerá para o cliente na hora da compra
              </p>
            </div>

            {/* Descrição (opcional) */}
            <div>
              <Label>📄 Descrição (opcional)</Label>
              <Input
                placeholder="Ex: Escolha até 2 sabores para sua pizza"
                value={editingGroup.description || ''}
                onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Configurações */}
            <div className="bg-purple-50 p-4 rounded-lg space-y-3">
              <Label className="font-bold">⚙️ Configurações</Label>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingGroup.isRequired}
                    onChange={(e) =>
                      setEditingGroup({
                        ...editingGroup,
                        isRequired: e.target.checked,
                        minSelections: e.target.checked ? (editingGroup.minSelections || 1) : 0,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold">Obrigatório?</span>
                </label>

                <div className="flex items-center gap-2">
                  <Label className="text-sm">Máximo:</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editingGroup.maxSelections || 1}
                    onChange={(e) =>
                      setEditingGroup({ ...editingGroup, maxSelections: parseInt(e.target.value) || 1 })
                    }
                    className="w-20 text-center"
                  />
                  <span className="text-sm">opções</span>
                </div>
              </div>

              <p className="text-xs text-purple-600">
                💡 Exemplo: Pizza com até <strong>2 sabores</strong> (máximo 2) ou Tamanho <strong>obrigatório</strong> (cliente deve escolher)
              </p>
            </div>

            {/* Adicionar Opções */}
            <div className="border-t-2 border-dashed pt-4">
              <Label className="font-bold">➕ Opções do Grupo</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Nome da opção (ex: Calabresa, Catupiry)"
                  value={newOptionName}
                  onChange={(e) => setNewOptionName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Preço"
                  value={newOptionPrice}
                  onChange={(e) => setNewOptionPrice(e.target.value)}
                  className="w-28"
                  step="0.01"
                />
                <Button onClick={handleAddOption} className="bg-green-500 hover:bg-green-600">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                💰 Digite o preço ADICIONAL (ex: 15.90 para borda de catupiry). Use 0 se não tiver custo.
              </p>

              {/* Lista de Opções */}
              {editingGroup.options.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label className="text-sm font-bold">✅ Opções adicionadas ({editingGroup.options.length}):</Label>
                  {editingGroup.options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center justify-between bg-white p-3 rounded-lg border"
                    >
                      <span className="font-semibold">
                        {option.name}
                        {option.price > 0 && (
                          <span className="text-green-600 ml-2">
                            +R$ {option.price.toFixed(2)}
                          </span>
                        )}
                        {option.price === 0 && (
                          <span className="text-gray-400 ml-2 text-xs">(grátis)</span>
                        )}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOption(option.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setEditingGroup(null)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSaveGroup} className="flex-1 bg-purple-600 hover:bg-purple-700">
                <Save className="w-4 h-4 mr-2" />
                Salvar Grupo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={handleCreateGroup} className="mb-6 bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Criar Novo Grupo
        </Button>
      )}

      {/* Lista de Grupos Existentes */}
      <div className="space-y-4">
        {groups.length === 0 && !editingGroup && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Nenhum grupo de personalização criado ainda.</p>
              <p className="text-sm text-gray-400 mt-2">
                Clique em "Criar Novo Grupo" para começar
              </p>
            </CardContent>
          </Card>
        )}

        {groups.map((group) => (
          <Card key={group.id} className="border-2 border-purple-100">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <span>{group.name}</span>
                  <span className={`ml-3 text-xs px-2 py-1 rounded ${group.isRequired ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                    {group.isRequired ? 'Obrigatório' : 'Opcional'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingGroup(group)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteGroup(group.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
              {group.description && (
                <p className="text-sm text-gray-600">{group.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-semibold">
                  Máximo: {group.maxSelections || '∞'} {(group.maxSelections || 0) > 1 ? 'opções' : 'opção'}
                </p>
                <div className="space-y-1">
                  {group.options.map((option) => (
                    <div key={option.id} className="text-sm bg-gray-50 p-2 rounded flex justify-between">
                      <span>{option.name}</span>
                      {option.price > 0 && (
                        <span className="text-green-600 font-semibold">
                          +R$ {option.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
