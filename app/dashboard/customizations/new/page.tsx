'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface CustomizationOption {
  id?: string;
  name: string;
  price: number;
  image?: string;
  isActive: boolean;
  sortOrder: number;
}

export default function NewCustomizationGroupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isRequired: false,
    minSelections: 0,
    maxSelections: '',
    sortOrder: 0,
    isActive: true,
  });

  const [options, setOptions] = useState<CustomizationOption[]>([]);
  const [showAddOption, setShowAddOption] = useState(false);
  const [newOption, setNewOption] = useState<CustomizationOption>({
    name: '',
    price: 0,
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchRestaurant();
  }, [session]);

  const fetchRestaurant = async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch(`/api/restaurants?email=${session.user.email}`);
      const restaurants = await response.json();
      
      if (restaurants.length > 0) {
        setRestaurantId(restaurants[0].id);
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    }
  };

  const handleAddOption = () => {
    if (!newOption.name.trim()) {
      toast.error('Nome da opção é obrigatório');
      return;
    }

    setOptions([...options, { ...newOption, sortOrder: options.length }]);
    setNewOption({ name: '', price: 0, isActive: true, sortOrder: 0 });
    setShowAddOption(false);
    toast.success('Opção adicionada!');
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions.map((opt, i) => ({ ...opt, sortOrder: i })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome do grupo é obrigatório');
      return;
    }

    if (options.length === 0) {
      toast.error('Adicione pelo menos uma opção');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/customizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxSelections: formData.maxSelections ? parseInt(formData.maxSelections) : null,
          options,
        }),
      });

      if (response.ok) {
        toast.success('Grupo criado com sucesso!');
        router.push('/dashboard/customizations');
      } else {
        toast.error('Erro ao criar grupo');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Erro ao criar grupo');
    } finally {
      setLoading(false);
    }
  };

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
              <h1 className="text-3xl font-bold text-gray-900">Novo Grupo de Customização</h1>
              <p className="text-gray-600 mt-1">
                Crie um grupo com opções para seus produtos
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informações Básicas</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Grupo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Sabores de Pizza"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Escolha até 2 sabores para sua pizza"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Selection Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Configurações de Seleção</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={formData.isRequired}
                  onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                  className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="isRequired" className="text-sm font-medium text-gray-700">
                  Seleção obrigatória
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mínimo de seleções
                  </label>
                  <input
                    type="number"
                    value={formData.minSelections}
                    onChange={(e) => setFormData({ ...formData, minSelections: parseInt(e.target.value) })}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo de seleções
                  </label>
                  <input
                    type="number"
                    value={formData.maxSelections}
                    onChange={(e) => setFormData({ ...formData, maxSelections: e.target.value })}
                    min="1"
                    placeholder="Deixe vazio para ilimitado"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              {formData.minSelections > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    ℹ️ O cliente deverá escolher{' '}
                    {formData.maxSelections
                      ? `de ${formData.minSelections} a ${formData.maxSelections}`
                      : `no mínimo ${formData.minSelections}`}{' '}
                    {formData.minSelections > 1 ? 'opções' : 'opção'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Opções do Grupo</h2>
              <button
                type="button"
                onClick={() => setShowAddOption(true)}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus size={18} />
                Adicionar Opção
              </button>
            </div>

            {/* Add Option Form */}
            {showAddOption && (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newOption.name}
                    onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                    placeholder="Nome da opção (ex: Calabresa)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={newOption.price}
                      onChange={(e) => setNewOption({ ...newOption, price: parseFloat(e.target.value) })}
                      placeholder="Preço adicional (R$)"
                      step="0.01"
                      min="0"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Adicionar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddOption(false)}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Options List */}
            {options.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-2">📝</div>
                <p>Nenhuma opção adicionada ainda</p>
                <p className="text-sm mt-1">Clique em "Adicionar Opção" para começar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="font-medium text-gray-900">{option.name}</span>
                      {option.price > 0 && (
                        <span className="text-sm text-red-600 font-semibold">
                          + R$ {option.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || options.length === 0}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando...' : 'Criar Grupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
