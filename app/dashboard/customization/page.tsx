'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, X, Edit2, Save, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Size {
  id?: string;
  name: string;
  description: string;
  price_multiplier: number;
  display_order: number;
}

interface Flavor {
  id?: string;
  name: string;
  price: number;
  description?: string;
  display_order: number;
}

interface Extra {
  id?: string;
  name: string;
  price: number;
  description?: string;
  display_order: number;
}

interface Customization {
  id?: string;
  is_customizable: boolean;
  has_sizes: boolean;
  has_flavors: boolean;
  has_extras: boolean;
  max_flavors: number;
  flavors_required: boolean;
}

export default function CustomizationPage() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Configuração
  const [customization, setCustomization] = useState<Customization>({
    is_customizable: false,
    has_sizes: false,
    has_flavors: false,
    has_extras: false,
    max_flavors: 1,
    flavors_required: false
  });
  
  // Listas
  const [sizes, setSizes] = useState<Size[]>([]);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  
  // Novos itens
  const [newSize, setNewSize] = useState<Size>({ name: '', description: '', price_multiplier: 1.0, display_order: 0 });
  const [newFlavor, setNewFlavor] = useState<Flavor>({ name: '', price: 0, display_order: 0 });
  const [newExtra, setNewExtra] = useState<Extra>({ name: '', price: 0, display_order: 0 });

  // Carregar categorias
  useEffect(() => {
    loadCategories();
  }, []);

  // Carregar personalização quando categoria mudar
  useEffect(() => {
    if (selectedCategory) {
      loadCustomization();
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomization = async () => {
    if (!selectedCategory) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/customization?categoryId=${selectedCategory}`);
      const data = await res.json();
      
      if (data.customization) {
        setCustomization(data.customization);
        setSizes(data.sizes || []);
        setFlavors(data.flavors || []);
        setExtras(data.extras || []);
      } else {
        // Reset para valores padrão
        setCustomization({
          is_customizable: false,
          has_sizes: false,
          has_flavors: false,
          has_extras: false,
          max_flavors: 1,
          flavors_required: false
        });
        setSizes([]);
        setFlavors([]);
        setExtras([]);
      }
    } catch (error) {
      console.error('Erro ao carregar personalização:', error);
      toast.error('Erro ao carregar personalização');
    } finally {
      setLoading(false);
    }
  };

  const saveCustomization = async () => {
    if (!selectedCategory) {
      toast.error('Selecione uma categoria');
      return;
    }
    
    try {
      const res = await fetch('/api/customization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: selectedCategory,
          isCustomizable: customization.is_customizable,
          hasSizes: customization.has_sizes,
          hasFlavors: customization.has_flavors,
          hasExtras: customization.has_extras,
          maxFlavors: customization.max_flavors,
          flavorsRequired: customization.flavors_required
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        toast.success('Configuração salva com sucesso!');
        // Recarregar para pegar o ID criado
        await loadCustomization();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erro ao salvar');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar configuração');
    }
  };

  const addSize = async () => {
    if (!customization.id) {
      toast.error('Salve a configuração primeiro!');
      return;
    }
    if (!newSize.name) {
      toast.error('Preencha o nome do tamanho');
      return;
    }
    
    try {
      const res = await fetch('/api/customization/sizes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customizationId: customization.id,
          ...newSize,
          displayOrder: sizes.length
        })
      });
      
      if (res.ok) {
        toast.success('Tamanho adicionado!');
        setNewSize({ name: '', description: '', price_multiplier: 1.0, display_order: 0 });
        loadCustomization();
      }
    } catch (error) {
      toast.error('Erro ao adicionar tamanho');
    }
  };

  const addFlavor = async () => {
    if (!customization.id) {
      toast.error('Salve a configuração primeiro!');
      return;
    }
    if (!newFlavor.name) {
      toast.error('Preencha o nome do sabor');
      return;
    }
    
    try {
      const res = await fetch('/api/customization/flavors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customizationId: customization.id,
          ...newFlavor,
          displayOrder: flavors.length
        })
      });
      
      if (res.ok) {
        toast.success('Sabor adicionado!');
        setNewFlavor({ name: '', price: 0, display_order: 0 });
        loadCustomization();
      }
    } catch (error) {
      toast.error('Erro ao adicionar sabor');
    }
  };

  const addExtra = async () => {
    if (!customization.id) {
      toast.error('Salve a configuração primeiro!');
      return;
    }
    if (!newExtra.name) {
      toast.error('Preencha o nome do adicional');
      return;
    }
    
    try {
      const res = await fetch('/api/customization/extras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customizationId: customization.id,
          ...newExtra,
          displayOrder: extras.length
        })
      });
      
      if (res.ok) {
        toast.success('Adicional adicionado!');
        setNewExtra({ name: '', price: 0, display_order: 0 });
        loadCustomization();
      }
    } catch (error) {
      toast.error('Erro ao adicionar adicional');
    }
  };

  const deleteSize = async (id: string) => {
    if (!confirm('Remover este tamanho?')) return;
    
    try {
      const res = await fetch(`/api/customization/sizes?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Tamanho removido!');
        loadCustomization();
      }
    } catch (error) {
      toast.error('Erro ao remover');
    }
  };

  const deleteFlavor = async (id: string) => {
    if (!confirm('Remover este sabor?')) return;
    
    try {
      const res = await fetch(`/api/customization/flavors?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Sabor removido!');
        loadCustomization();
      }
    } catch (error) {
      toast.error('Erro ao remover');
    }
  };

  const deleteExtra = async (id: string) => {
    if (!confirm('Remover este adicional?')) return;
    
    try {
      const res = await fetch(`/api/customization/extras?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Adicional removido!');
        loadCustomization();
      }
    } catch (error) {
      toast.error('Erro ao remover');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ⚙️ Personalização de Produtos
          </h1>
          <p className="text-gray-600">
            Configure opções de personalização para suas categorias (tamanhos, sabores, adicionais)
          </p>
        </div>

        {/* Seletor de Categoria */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            📁 Selecione uma Categoria
          </label>
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
          >
            <option value="">Escolha uma categoria...</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Configuração */}
        {selectedCategory && (
          <>
            {/* Toggle Personalizável */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customization.is_customizable}
                  onChange={(e) => setCustomization({ ...customization, is_customizable: e.target.checked })}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                />
                <span className="text-lg font-bold text-gray-900">
                  ✨ Esta categoria é personalizável
                </span>
              </label>
              
              {customization.is_customizable && (
                <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-800">
                    💡 <strong>Ativo!</strong> Configure abaixo os tamanhos, sabores e adicionais disponíveis.
                  </p>
                </div>
              )}
              
              <button
                onClick={saveCustomization}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save size={18} />
                Salvar Configuração
              </button>
            </div>

            {customization.is_customizable && customization.id && (
              <>
                {/* TAMANHOS */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        📏 Tamanhos
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Ex: Pequena, Média, Grande (opcional)
                      </p>
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={customization.has_sizes}
                        onChange={(e) => {
                          setCustomization({ ...customization, has_sizes: e.target.checked });
                          saveCustomization();
                        }}
                        className="w-4 h-4 text-orange-500 rounded"
                      />
                      <span className="text-sm font-medium">Ativar</span>
                    </label>
                  </div>

                  {customization.has_sizes && (
                    <>
                      {/* Lista de Tamanhos */}
                      <div className="space-y-2 mb-4">
                        {sizes.map((size) => (
                          <div key={size.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <GripVertical size={18} className="text-gray-400" />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{size.name}</div>
                              <div className="text-sm text-gray-600">{size.description}</div>
                            </div>
                            <div className="text-sm font-bold text-orange-600">
                              {size.price_multiplier}x
                            </div>
                            <button
                              onClick={() => deleteSize(size.id!)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Adicionar Tamanho */}
                      <div className="grid grid-cols-12 gap-3">
                        <input
                          type="text"
                          placeholder="Nome (ex: Média)"
                          value={newSize.name}
                          onChange={(e) => setNewSize({ ...newSize, name: e.target.value })}
                          className="col-span-4 p-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Descrição (ex: 6 fatias)"
                          value={newSize.description}
                          onChange={(e) => setNewSize({ ...newSize, description: e.target.value })}
                          className="col-span-4 p-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        />
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Multiplicador"
                          value={newSize.price_multiplier}
                          onChange={(e) => setNewSize({ ...newSize, price_multiplier: parseFloat(e.target.value) })}
                          className="col-span-3 p-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        />
                        <button
                          onClick={addSize}
                          className="col-span-1 p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* SABORES */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        🍕 Sabores/Opções
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Ex: Calabresa, Marguerita, Portuguesa
                      </p>
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={customization.has_flavors}
                        onChange={(e) => {
                          setCustomization({ ...customization, has_flavors: e.target.checked });
                          saveCustomization();
                        }}
                        className="w-4 h-4 text-orange-500 rounded"
                      />
                      <span className="text-sm font-medium">Ativar</span>
                    </label>
                  </div>

                  {customization.has_flavors && (
                    <>
                      {/* Configuração de Sabores */}
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Máximo de sabores permitidos:
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={customization.max_flavors}
                          onChange={(e) => {
                            setCustomization({ ...customization, max_flavors: parseInt(e.target.value) });
                            saveCustomization();
                          }}
                          className="w-24 p-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      {/* Lista de Sabores */}
                      <div className="space-y-2 mb-4">
                        {flavors.map((flavor) => (
                          <div key={flavor.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <GripVertical size={18} className="text-gray-400" />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{flavor.name}</div>
                            </div>
                            <div className="text-lg font-bold text-green-600">
                              R$ {flavor.price.toFixed(2)}
                            </div>
                            <button
                              onClick={() => deleteFlavor(flavor.id!)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Adicionar Sabor */}
                      <div className="grid grid-cols-12 gap-3">
                        <input
                          type="text"
                          placeholder="Nome do sabor"
                          value={newFlavor.name}
                          onChange={(e) => setNewFlavor({ ...newFlavor, name: e.target.value })}
                          className="col-span-8 p-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Preço"
                          value={newFlavor.price}
                          onChange={(e) => setNewFlavor({ ...newFlavor, price: parseFloat(e.target.value) })}
                          className="col-span-3 p-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        />
                        <button
                          onClick={addFlavor}
                          className="col-span-1 p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* ADICIONAIS */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        ➕ Adicionais
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Ex: Borda Catupiry, Extra Bacon (opcional)
                      </p>
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={customization.has_extras}
                        onChange={(e) => {
                          setCustomization({ ...customization, has_extras: e.target.checked });
                          saveCustomization();
                        }}
                        className="w-4 h-4 text-orange-500 rounded"
                      />
                      <span className="text-sm font-medium">Ativar</span>
                    </label>
                  </div>

                  {customization.has_extras && (
                    <>
                      {/* Lista de Adicionais */}
                      <div className="space-y-2 mb-4">
                        {extras.map((extra) => (
                          <div key={extra.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <GripVertical size={18} className="text-gray-400" />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{extra.name}</div>
                            </div>
                            <div className="text-lg font-bold text-orange-600">
                              + R$ {extra.price.toFixed(2)}
                            </div>
                            <button
                              onClick={() => deleteExtra(extra.id!)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Adicionar Adicional */}
                      <div className="grid grid-cols-12 gap-3">
                        <input
                          type="text"
                          placeholder="Nome do adicional"
                          value={newExtra.name}
                          onChange={(e) => setNewExtra({ ...newExtra, name: e.target.value })}
                          className="col-span-8 p-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Preço"
                          value={newExtra.price}
                          onChange={(e) => setNewExtra({ ...newExtra, price: parseFloat(e.target.value) })}
                          className="col-span-3 p-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        />
                        <button
                          onClick={addExtra}
                          className="col-span-1 p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
