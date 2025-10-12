'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';

interface CustomizationGroup {
  id: string;
  name: string;
  description?: string;
  isRequired: boolean;
  maxSelections?: number;
  options: Array<{ id: string; name: string; price: number }>;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

export default function LinkCustomizationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [allGroups, setAllGroups] = useState<CustomizationGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [restaurantId, setRestaurantId] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchData();
  }, [session, itemId]);

  const fetchData = async () => {
    if (!session?.user?.email) return;

    try {
      // Buscar restaurante
      const resResponse = await fetch(`/api/restaurants?email=${session.user.email}`);
      const restaurants = await resResponse.json();

      if (restaurants.length === 0) {
        toast.error('Nenhum restaurante encontrado');
        return;
      }

      const restaurantId = restaurants[0].id;
      setRestaurantId(restaurantId);

      // Buscar item
      const itemResponse = await fetch(`/api/items?id=${itemId}`);
      const itemData = await itemResponse.json();
      setMenuItem(itemData);

      // Buscar todos os grupos do restaurante
      const groupsResponse = await fetch(`/api/restaurants/${restaurantId}/customizations`);
      const groupsData = await groupsResponse.json();
      setAllGroups(groupsData);

      // Buscar grupos já vinculados
      const linkedResponse = await fetch(`/api/menu-items/${itemId}/link-customizations`);
      const linkedData = await linkedResponse.json();
      const linkedIds = new Set(linkedData.map((g: CustomizationGroup) => g.id));
      setSelectedGroups(linkedIds);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGroup = (groupId: string) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    setSelectedGroups(newSelected);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch(`/api/menu-items/${itemId}/link-customizations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupIds: Array.from(selectedGroups)
        })
      });

      if (response.ok) {
        toast.success('Customizações vinculadas com sucesso!');
        router.back();
      } else {
        toast.error('Erro ao vincular customizações');
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Vincular Customizações
              </h1>
              <p className="text-gray-600 mt-1">
                Produto: <span className="font-semibold">{menuItem?.name}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Groups List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Grupos de Customização Disponíveis
          </h2>

          {allGroups.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🍕</div>
              <p className="text-gray-600 mb-4">
                Nenhum grupo de customização criado ainda
              </p>
              <button
                onClick={() => router.push('/dashboard/customizations/new')}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Criar Primeiro Grupo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {allGroups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => handleToggleGroup(group.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedGroups.has(group.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            selectedGroups.has(group.id)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedGroups.has(group.id) && (
                            <Check size={16} className="text-white" />
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {group.name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            group.isRequired
                              ? 'bg-red-100 text-red-600'
                              : 'bg-blue-100 text-blue-600'
                          }`}
                        >
                          {group.isRequired ? 'Obrigatório' : 'Opcional'}
                        </span>
                      </div>

                      {group.description && (
                        <p className="text-sm text-gray-600 ml-9 mb-2">
                          {group.description}
                        </p>
                      )}

                      <div className="text-sm text-gray-500 ml-9">
                        {group.options.length} {group.options.length === 1 ? 'opção' : 'opções'}
                        {group.maxSelections && ` • Máx: ${group.maxSelections}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {allGroups.length > 0 && (
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando...' : `Salvar (${selectedGroups.size} selecionados)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
