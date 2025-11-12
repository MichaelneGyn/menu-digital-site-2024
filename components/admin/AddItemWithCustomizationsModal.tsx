'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PriceInput } from '@/components/PriceInput';
import { toast } from 'sonner';
import { X, Plus, Trash2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface EditItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  isPromo?: boolean;
  originalPrice?: number;
  promoTag?: string | null;
  category: {
    id: string;
  };
}

interface AddItemWithCustomizationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  categories: Category[];
  onSuccess: () => void;
  item?: EditItem; // Opcional: se fornecido, entra em modo de edição
}

export default function AddItemWithCustomizationsModal({
  isOpen,
  onClose,
  restaurantId,
  categories,
  onSuccess,
  item
}: AddItemWithCustomizationsModalProps) {
  const isEditing = !!item; // Modo de edição se item estiver presente
  
  // Basic info
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price?.toString() || '',
    categoryId: item?.category.id || '',
    isPromo: item?.isPromo || false,
    oldPrice: item?.originalPrice?.toString() || '',
    promoTag: item?.promoTag || ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(item?.image || null);
  
  // Customizations
  const [hasCustomizations, setHasCustomizations] = useState(false);
  const [customizationGroups, setCustomizationGroups] = useState<Array<{
    id: string;
    name: string;
    description?: string;
    isRequired: boolean;
    minSelections: number;
    maxSelections: number;
    options: Array<{id: string; name: string; price: string}>;
  }>>([]);
  
  const [tempGroupInputs, setTempGroupInputs] = useState<Record<string, {optionName: string; optionPrice: string}>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addCustomizationGroup = () => {
    const newGroup = {
      id: `temp-${Date.now()}`,
      name: '',
      description: '',
      isRequired: false,
      minSelections: 0,
      maxSelections: 1,
      options: []
    };
    setCustomizationGroups([...customizationGroups, newGroup]);
  };

  const removeCustomizationGroup = (groupId: string) => {
    setCustomizationGroups(customizationGroups.filter(g => g.id !== groupId));
  };

  const updateGroupField = (groupId: string, field: string, value: any) => {
    setCustomizationGroups(groups =>
      groups.map(g =>
        g.id === groupId ? { ...g, [field]: value } : g
      )
    );
  };

  const addOptionToGroup = (groupId: string) => {
    const input = tempGroupInputs[groupId];
    if (!input?.optionName?.trim()) {
      toast.error('Digite o nome da opção');
      return;
    }

    const newOption = {
      id: `temp-opt-${Date.now()}`,
      name: input.optionName.trim(),
      price: input.optionPrice || '0'
    };

    setCustomizationGroups(groups =>
      groups.map(g =>
        g.id === groupId
          ? { ...g, options: [...g.options, newOption] }
          : g
      )
    );

    setTempGroupInputs({
      ...tempGroupInputs,
      [groupId]: { optionName: '', optionPrice: '' }
    });
  };

  const removeOptionFromGroup = (groupId: string, optionId: string) => {
    setCustomizationGroups(groups =>
      groups.map(g =>
        g.id === groupId
          ? { ...g, options: g.options.filter(o => o.id !== optionId) }
          : g
      )
    );
  };

  const applyQuickSuggestions = () => {
    const selectedCategory = categories.find(c => c.id === formData.categoryId);
    const categoryName = selectedCategory?.name?.toLowerCase() || '';
    
    let suggestedGroups: typeof customizationGroups = [];

    if (categoryName.includes('pizza')) {
      suggestedGroups = [
        {
          id: `temp-${Date.now()}-1`,
          name: 'Escolha o sabor',
          description: '',
          isRequired: true,
          minSelections: 1,
          maxSelections: 2,
          options: []
        },
        {
          id: `temp-${Date.now()}-2`,
          name: 'Borda recheada',
          description: '',
          isRequired: false,
          minSelections: 0,
          maxSelections: 1,
          options: []
        },
        {
          id: `temp-${Date.now()}-3`,
          name: 'Adicionais',
          description: '',
          isRequired: false,
          minSelections: 0,
          maxSelections: 10,
          options: []
        }
      ];
    } else if (categoryName.includes('hambur') || categoryName.includes('lanche')) {
      suggestedGroups = [
        {
          id: `temp-${Date.now()}-1`,
          name: 'Ponto da carne',
          description: '',
          isRequired: true,
          minSelections: 1,
          maxSelections: 1,
          options: []
        },
        {
          id: `temp-${Date.now()}-2`,
          name: 'Adicionais',
          description: '',
          isRequired: false,
          minSelections: 0,
          maxSelections: 10,
          options: []
        }
      ];
    } else {
      suggestedGroups = [
        {
          id: `temp-${Date.now()}-1`,
          name: 'Opções',
          description: '',
          isRequired: false,
          minSelections: 0,
          maxSelections: 5,
          options: []
        }
      ];
    }

    setCustomizationGroups(suggestedGroups);
    toast.success(`✨ ${suggestedGroups.length} grupo(s) criado(s) para ${categoryName}!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl: string | null = null;

      // Upload da imagem (se o usuário escolheu uma)
      if (selectedImage) {
        try {
          const uploadData = new FormData();
          uploadData.append('file', selectedImage);

          console.log('📸 Tentando upload...', selectedImage.name);

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: uploadData
          });

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            if (uploadResult.image_url) {
              imageUrl = uploadResult.image_url;
              console.log('✅ Upload bem-sucedido:', imageUrl);
              toast.success('📸 Imagem enviada com sucesso!');
            } else {
              console.error('❌ Upload retornou OK mas sem image_url:', uploadResult);
              toast.error('Erro: Upload não retornou URL da imagem');
              setIsLoading(false);
              return;
            }
          } else {
            // Se o usuário escolheu uma imagem mas o upload falhou, mostra erro
            const errorData = await uploadResponse.json();
            toast.error(errorData.error || 'Erro ao fazer upload da imagem');
            setIsLoading(false);
            return;
          }
        } catch (uploadError: any) {
          // Se o upload falhou, mostra erro ao usuário
          toast.error(uploadError?.message || 'Erro ao fazer upload da imagem');
          setIsLoading(false);
          return;
        }
      }

      // Validação: Se não tem personalização, preço é obrigatório
      if (!hasCustomizations && (!formData.price || parseFloat(formData.price) <= 0)) {
        toast.error('❌ Preço é obrigatório quando o produto não tem personalização');
        setIsLoading(false);
        return;
      }

      // Create item
      const itemData = {
        ...formData,
        // Se tem personalização e preço vazio, define como 0
        price: formData.price ? parseFloat(formData.price) : 0,
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : undefined,
        restaurantId,
        // ✅ Se editando e não escolheu nova imagem, mantém a antiga
        image: imageUrl || (isEditing ? item.image : null),
        // ✅ Adicionar flag de personalização
        hasCustomizations: hasCustomizations
      };

      console.log('💾 [MODAL] Salvando item com dados:', itemData);
      console.log('📸 [MODAL] URL da imagem:', itemData.image);

      const itemResponse = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });

      if (!itemResponse.ok) {
        toast.error('Erro ao criar produto');
        return;
      }

      const createdItem = await itemResponse.json();

      // Create customization groups if needed
      if (hasCustomizations && customizationGroups.length > 0) {
        const createdGroupIds = [];
        
        console.log('🚀 [MODAL] Creating customization groups...');
        console.log('📋 [MODAL] Groups to create:', customizationGroups.length);
        
        for (const group of customizationGroups) {
          const groupData = {
            name: group.name,
            description: group.description || '',
            isRequired: group.isRequired,
            minSelections: group.minSelections,
            maxSelections: group.maxSelections,
            sortOrder: 0,
            isActive: true,
            options: group.options.map((opt, index) => ({
              name: opt.name,
              price: parseFloat(opt.price || '0'),
              isActive: true,
              sortOrder: index
            }))
          };
          
          const groupResponse = await fetch(`/api/restaurants/${restaurantId}/customizations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(groupData),
          });

          if (groupResponse.ok) {
            const createdGroup = await groupResponse.json();
            console.log('✅ [MODAL] Group created:', createdGroup.id, createdGroup.name);
            createdGroupIds.push(createdGroup.id);
          } else {
            const errorData = await groupResponse.json();
            console.error('❌ [MODAL] Failed to create group:', errorData);
          }
        }
        
        console.log('✅ [MODAL] All groups created. IDs:', createdGroupIds);
        
        // Link ALL groups to item at once
        if (createdGroupIds.length > 0) {
          await fetch(`/api/menu-items/${createdItem.id}/link-customizations`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              groupIds: createdGroupIds
            }),
          });
        }
      }

      toast.success(`✅ Produto "${createdItem.name}" criado com sucesso!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao criar produto');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Adicionar Produto</CardTitle>
          <button onClick={onClose} className="hover:bg-gray-100 p-2 rounded">
            <X size={20} />
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div>
              <Label>Nome do Produto *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Pizza Calabresa"
                required
              />
            </div>

            <div>
              <Label>Descrição</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descreva o produto"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>
                  {hasCustomizations ? 'Preço (opcional se varia por sabor)' : 'Preço *'}
                </Label>
                <PriceInput
                  value={formData.price}
                  onChange={(val) => setFormData({...formData, price: val})}
                  placeholder={hasCustomizations ? "Deixe vazio se o preço varia" : "Ex: 4590 = R$ 45,90"}
                />
                {hasCustomizations && (
                  <p className="text-xs text-orange-600 mt-1">
                    💡 Se deixar vazio, o preço virá das opções de personalização
                  </p>
                )}
              </div>

              <div>
                <Label>Categoria *</Label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  required
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Selecione...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image - PREVIEW MELHORADO */}
            <div>
              <Label>Imagem do Produto</Label>
              {imagePreview ? (
                <div className="relative border-2 border-green-500 rounded-lg overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-0 left-0 bg-green-500 text-white px-3 py-1 text-xs font-bold">
                    ✓ IMAGEM ANEXADA
                  </div>
                  <button
                    type="button"
                    onClick={() => { 
                      setSelectedImage(null); 
                      setImagePreview(null); 
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <div className="mb-2">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <Label htmlFor="imageInput" className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                    📸 Clique para escolher imagem
                  </Label>
                  <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG até 10MB</p>
                </div>
              )}
            </div>

            {/* Customizations Section - NOVO SISTEMA */}
            <div className="border-t-2 border-dashed pt-4 mt-4">
              <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">💡</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-blue-900 text-lg mb-2">✨ Novo Sistema de Personalização!</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Agora você pode configurar personalização por <strong>categoria inteira</strong> de forma mais simples e rápida!
                    </p>
                    <Button
                      type="button"
                      onClick={() => window.open('/dashboard/customization', '_blank')}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg"
                    >
                      🎨 Acessar Personalização por Categoria
                    </Button>
                    <p className="text-xs text-blue-600 mt-3 flex items-center gap-1">
                      <span>💡</span>
                      <span>Configure uma vez e todos os produtos da categoria herdam as opções!</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sistema antigo removido - usar apenas o novo sistema por categoria */}
            {false && hasCustomizations && (
                <div className="space-y-4 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
                  {/* Header com botões */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                        ✨ Grupos de Personalização
                      </h4>
                      <p className="text-xs text-purple-600 mt-1">Configure sabores, bordas, tamanhos, extras, etc.</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={applyQuickSuggestions}
                        className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold shadow-lg"
                        size="sm"
                        disabled={!formData.categoryId}
                      >
                        <span className="mr-2">⚡</span>
                        Sugestões Rápidas
                      </Button>
                      <Button
                        type="button"
                        onClick={addCustomizationGroup}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Grupo
                      </Button>
                    </div>
                  </div>

                  {/* Empty state */}
                  {customizationGroups.length === 0 && (
                    <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-purple-200">
                      <span className="text-4xl mb-3 block">⚡</span>
                      <p className="text-purple-900 font-bold text-lg mb-2">Use "Sugestões Rápidas"!</p>
                      <p className="text-purple-600 text-sm mb-1">
                        O sistema cria grupos automaticamente baseado na categoria
                      </p>
                      <p className="text-xs text-gray-500 mt-3">
                        💡 Ou clique em "Criar Grupo" para fazer manualmente
                      </p>
                    </div>
                  )}

                  {/* Grupos */}
                  {customizationGroups.map((group) => (
                    <div key={group.id} className="bg-white border-2 border-purple-100 rounded-lg p-4 mb-3">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 space-y-3">
                          {/* Nome do Grupo */}
                          <div>
                            <Label className="text-sm font-bold text-purple-900">📝 Nome do Grupo *</Label>
                            <Input
                              placeholder="Ex: Escolha o sabor, Bordas Irresistíveis"
                              value={group.name}
                              onChange={(e) => updateGroupField(group.id, 'name', e.target.value)}
                              className="border-purple-200 mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">💡 Esse nome aparecerá para o cliente</p>
                          </div>

                          {/* Configurações */}
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <Label className="text-sm font-bold text-purple-900 flex items-center gap-2">
                              ⚙️ Configurações
                            </Label>
                            <div className="flex items-center gap-4 mt-2">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={group.isRequired}
                                  onChange={(e) => {
                                    updateGroupField(group.id, 'isRequired', e.target.checked);
                                    if (e.target.checked && group.minSelections === 0) {
                                      updateGroupField(group.id, 'minSelections', 1);
                                    }
                                  }}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm font-semibold">Obrigatório?</span>
                              </label>
                              <div className="flex items-center gap-2">
                                <Label className="text-sm">Máximo:</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={group.maxSelections}
                                  onChange={(e) => updateGroupField(group.id, 'maxSelections', parseInt(e.target.value) || 1)}
                                  className="w-20 text-center"
                                />
                                <span className="text-sm">opções</span>
                              </div>
                            </div>
                            <p className="text-xs text-purple-600 mt-2">
                              💡 Ex: Pizza com até <strong>2 sabores</strong> ou Tamanho <strong>obrigatório</strong>
                            </p>
                          </div>

                          {/* Adicionar Opções */}
                          <div className="border-t-2 border-dashed border-purple-200 pt-3">
                            <Label className="text-sm font-bold text-purple-900 mb-2 block">➕ Opções do Grupo</Label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Nome (ex: Calabresa, Catupiry)"
                                value={tempGroupInputs[group.id]?.optionName || ''}
                                onChange={(e) => setTempGroupInputs({
                                  ...tempGroupInputs,
                                  [group.id]: { 
                                    ...tempGroupInputs[group.id], 
                                    optionName: e.target.value 
                                  }
                                })}
                                className="flex-1"
                              />
                              <PriceInput
                                placeholder="Preço"
                                value={tempGroupInputs[group.id]?.optionPrice || ''}
                                onChange={(val) => setTempGroupInputs({
                                  ...tempGroupInputs,
                                  [group.id]: { 
                                    ...tempGroupInputs[group.id], 
                                    optionPrice: val 
                                  }
                                })}
                                className="w-32"
                              />
                              <Button
                                type="button"
                                onClick={() => addOptionToGroup(group.id)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            {!formData.price || parseFloat(formData.price) === 0 ? (
                              <p className="text-xs text-orange-600 mt-1 font-semibold">
                                🎯 Produto sem preço base: O preço da opção será o preço final do produto
                              </p>
                            ) : (
                              <p className="text-xs text-gray-500 mt-1">
                                💰 Deixe em 0 se não cobrar adicional. Ex: Calabresa (R$ 0), Bacon (+R$ 3)
                              </p>
                            )}

                            {/* Lista de Opções */}
                            {group.options.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {group.options.map((option) => (
                                  <div key={option.id} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                                    <span className="font-medium">{option.name}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-gray-600">
                                        {parseFloat(option.price) > 0 
                                          ? (!formData.price || parseFloat(formData.price) === 0 
                                            ? `R$ ${parseFloat(option.price).toFixed(2)}` 
                                            : `+R$ ${parseFloat(option.price).toFixed(2)}`)
                                          : (!formData.price || parseFloat(formData.price) === 0 ? 'Sem preço' : 'Grátis')}
                                      </span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeOptionFromGroup(group.id, option.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Botão Remover Grupo */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomizationGroup(group.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Salvando...' : 'Salvar Produto'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
