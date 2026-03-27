'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PriceInput } from '@/components/PriceInput';
import { toast } from 'sonner';
import { Plus, Trash2, X } from 'lucide-react';

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
  const isEditing = !!item;

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
  const [simpleAdditionals, setSimpleAdditionals] = useState<Array<{ name: string; price: string }>>([
    { name: '', price: '' }
  ]);
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

  const saveSimpleAdditional = async (categoryId: string) => {
    const extrasToSave = simpleAdditionals.filter((additional) => additional.name.trim());
    if (extrasToSave.length === 0) return;

    const customizationResponse = await fetch(`/api/customization?categoryId=${categoryId}`);
    const customizationData = customizationResponse.ok ? await customizationResponse.json() : null;
    const existingCustomization = customizationData?.customization;

    const upsertResponse = await fetch('/api/customization', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoryId,
        isCustomizable: existingCustomization?.is_customizable ?? true,
        hasSizes: existingCustomization?.has_sizes ?? false,
        hasFlavors: existingCustomization?.has_flavors ?? false,
        hasExtras: true,
        maxFlavors: existingCustomization?.max_flavors ?? 1,
        flavorsRequired: existingCustomization?.flavors_required ?? false
      })
    });

    if (!upsertResponse.ok) return;

    const upsertData = await upsertResponse.json();
    if (!upsertData?.customizationId) return;

    await Promise.all(
      extrasToSave.map((additional) =>
        fetch('/api/customization/extras', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customizationId: upsertData.customizationId,
            name: additional.name.trim(),
            price: parseFloat(additional.price || '0')
          })
        })
      )
    );
  };

  const updateAdditional = (index: number, field: 'name' | 'price', value: string) => {
    setSimpleAdditionals((prev) =>
      prev.map((additional, currentIndex) =>
        currentIndex === index ? { ...additional, [field]: value } : additional
      )
    );
  };

  const addAdditionalRow = () => {
    setSimpleAdditionals((prev) => [...prev, { name: '', price: '' }]);
  };

  const removeAdditionalRow = (index: number) => {
    setSimpleAdditionals((prev) => {
      if (prev.length === 1) return [{ name: '', price: '' }];
      return prev.filter((_, currentIndex) => currentIndex !== index);
    });
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
        } catch (uploadError: unknown) {
          toast.error(uploadError instanceof Error ? uploadError.message : 'Erro ao fazer upload da imagem');
          setIsLoading(false);
          return;
        }
      }

      if (!formData.price || parseFloat(formData.price) <= 0) {
        toast.error('❌ Preço é obrigatório');
        setIsLoading(false);
        return;
      }

      const itemData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : 0,
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : undefined,
        restaurantId,
        image: imageUrl || (isEditing ? item.image : null),
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
      if (formData.categoryId && simpleAdditionals.some((additional) => additional.name.trim())) {
        try {
          await saveSimpleAdditional(formData.categoryId);
        } catch (extraError) {
          console.error('Erro ao salvar adicional simples:', extraError);
          toast.error('Produto criado, mas não foi possível salvar o adicional');
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
                <Label>Preço *</Label>
                <PriceInput
                  value={formData.price}
                  onChange={(val) => setFormData({...formData, price: val})}
                  placeholder="Ex: 4590 = R$ 45,90"
                />
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

            {formData.categoryId && (
              <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Adicionais (opcional)</h4>
                  <Button type="button" variant="outline" size="sm" onClick={addAdditionalRow}>
                    <Plus className="w-4 h-4 mr-1" />
                    Novo adicional
                  </Button>
                </div>
                <div className="space-y-3">
                  {simpleAdditionals.map((additional, index) => (
                    <div key={`additional-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr_180px_44px] gap-3">
                      <Input
                        value={additional.name}
                        onChange={(e) => updateAdditional(index, 'name', e.target.value)}
                        placeholder="Ex: Bacon extra"
                      />
                      <PriceInput
                        value={additional.price}
                        onChange={(val) => updateAdditional(index, 'price', val)}
                        placeholder="Valor"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeAdditionalRow(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
