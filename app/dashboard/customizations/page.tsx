'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Power, ChevronDown, ChevronUp } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface CustomizationOption {
  id: string;
  name: string;
  price: number;
  image?: string;
  isActive: boolean;
  sortOrder: number;
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
  menuItems?: Array<{ id: string; name: string }>;
}

export default function CustomizationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<CustomizationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [restaurantId, setRestaurantId] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchRestaurantAndGroups();
  }, [session]);

  const fetchRestaurantAndGroups = async () => {
    if (!session?.user?.email) return;

    try {
      // Buscar restaurante do usuário
      const resResponse = await fetch(`/api/restaurants?email=${session.user.email}`);
      const restaurants = await resResponse.json();
      
      if (restaurants.length === 0) {
        toast.error('Nenhum restaurante encontrado');
        return;
      }

      const restaurantId = restaurants[0].id;
      setRestaurantId(restaurantId);

      // Buscar grupos de customização
      const groupsResponse = await fetch(`/api/restaurants/${restaurantId}/customizations`);
      const groupsData = await groupsResponse.json();
      
      setGroups(groupsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar customizações');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Tem certeza que deseja excluir este grupo?')) return;

    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/customizations/${groupId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Grupo excluído com sucesso!');
        fetchRestaurantAndGroups();
      } else {
        toast.error('Erro ao excluir grupo');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Erro ao excluir grupo');
    }
  };

  const handleToggleGroupActive = async (group: CustomizationGroup) => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/customizations/${group.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...group, isActive: !group.isActive }),
      });

      if (response.ok) {
        toast.success(`Grupo ${!group.isActive ? 'ativado' : 'desativado'}!`);
        fetchRestaurantAndGroups();
      } else {
        toast.error('Erro ao atualizar grupo');
      }
    } catch (error) {
      console.error('Error toggling group:', error);
      toast.error('Erro ao atualizar grupo');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando customizações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customizações</h1>
              <p className="text-gray-600 mt-2">
                Gerencie sabores, bordas, extras e outras opções para seus produtos
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/customizations/new')}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus size={20} />
              Novo Grupo
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Buscar grupos de customização..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Groups List */}
        {groups.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🍕</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum grupo de customização criado
            </h3>
            <p className="text-gray-600 mb-6">
              Crie seu primeiro grupo para começar a oferecer opções aos seus clientes
            </p>
            <button
              onClick={() => router.push('/dashboard/customizations/new')}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Criar Primeiro Grupo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-white rounded-lg shadow-sm border-2 border-gray-200 hover:border-red-500 transition-colors"
              >
                {/* Group Header */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        🍕 {group.name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          group.isRequired
                            ? 'bg-red-100 text-red-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {group.isRequired ? 'Obrigatório' : 'Opcional'}
                      </span>
                      {!group.isActive && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                          Inativo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/dashboard/customizations/${group.id}/edit`)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={18} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleToggleGroupActive(group)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title={group.isActive ? 'Desativar' : 'Ativar'}
                      >
                        <Power
                          size={18}
                          className={group.isActive ? 'text-green-600' : 'text-gray-400'}
                        />
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                      <button
                        onClick={() => toggleExpand(group.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {expandedGroups.has(group.id) ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    {group.maxSelections
                      ? `Máximo ${group.maxSelections} ${group.maxSelections > 1 ? 'seleções' : 'seleção'}`
                      : 'Sem limite'}{' '}
                    • {group.options.length} {group.options.length === 1 ? 'opção' : 'opções'}
                  </div>

                  {/* Options Grid */}
                  {expandedGroups.has(group.id) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                      {group.options.map((option) => (
                        <div
                          key={option.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            option.isActive
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                option.isActive ? 'bg-green-500' : 'bg-gray-400'
                              }`}
                            />
                            <span className="font-medium text-gray-900">{option.name}</span>
                          </div>
                          <span
                            className={`text-sm font-semibold ${
                              option.price > 0 ? 'text-red-600' : 'text-gray-600'
                            }`}
                          >
                            {option.price > 0 ? `+ ${formatPrice(option.price)}` : formatPrice(0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {expandedGroups.has(group.id) && group.options.length > 6 && (
                    <div className="text-center mt-4">
                      <button className="text-red-600 text-sm font-semibold hover:underline">
                        Ver todas as opções ({group.options.length})
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
