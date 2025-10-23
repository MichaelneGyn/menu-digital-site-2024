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
  const [hasFlavors, setHasFlavors] = useState(false);
  const [hasBorders, setHasBorders] = useState(false);
  const [hasExtras, setHasExtras] = useState(false);
  
  const [maxFlavors, setMaxFlavors] = useState('2');
  const [flavors, setFlavors] = useState<string[]>([]);
  const [newFlavor, setNewFlavor] = useState('');
  
  const [borders, setBorders] = useState<Array<{name: string; price: string}>>([]);
  const [newBorder, setNewBorder] = useState({name: '', price: ''});
  
  const [extras, setExtras] = useState<Array<{name: string; price: string}>>([]);
  const [newExtra, setNewExtra] = useState({name: '', price: ''});
  
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

  const addFlavor = () => {
    if (newFlavor.trim()) {
      setFlavors([...flavors, newFlavor.trim()]);
      setNewFlavor('');
    }
  };

  const addBorder = () => {
    if (newBorder.name.trim() && newBorder.price && parseFloat(newBorder.price) > 0) {
      setBorders([...borders, newBorder]);
      setNewBorder({name: '', price: ''});
    } else if (newBorder.name.trim() && (!newBorder.price || parseFloat(newBorder.price) === 0)) {
      toast.error('Por favor, digite o preço da borda');
    } else if (!newBorder.name.trim()) {
      toast.error('Por favor, digite o nome da borda');
    }
  };

  const addExtra = () => {
    if (newExtra.name.trim() && newExtra.price && parseFloat(newExtra.price) > 0) {
      setExtras([...extras, newExtra]);
      setNewExtra({name: '', price: ''});
    } else if (newExtra.name.trim() && (!newExtra.price || parseFloat(newExtra.price) === 0)) {
      toast.error('Por favor, digite o preço do extra');
    } else if (!newExtra.name.trim()) {
      toast.error('Por favor, digite o nome do extra');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Imagens padrão variadas
      const defaultImages = [
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800', // Pizza
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', // Burger  
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', // Pizza 2
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800', // Salad
        'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800', // Sandwich
        'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800', // Pasta
      ];
      
      let imageUrl = defaultImages[Math.floor(Math.random() * defaultImages.length)];

      // Tentar upload da imagem (falha silenciosamente)
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
            }
          } else {
            // Falha no upload - continua com imagem padrão
            console.warn('⚠️ Upload falhou (status:', uploadResponse.status, '), usando imagem padrão');
          }
        } catch (uploadError) {
          // Exceção no upload - continua com imagem padrão
          console.warn('⚠️ Erro no upload, usando imagem padrão:', uploadError);
        }
      }

      // Create item
      const itemData = {
        ...formData,
        price: parseFloat(formData.price),
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : undefined,
        restaurantId,
        image: imageUrl
      };

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
      if (hasCustomizations && (hasFlavors || hasBorders || hasExtras)) {
        const groups = [];

        // Flavors group
        if (hasFlavors && flavors.length > 0) {
          groups.push({
            name: 'Sabores',
            description: `Escolha até ${maxFlavors} ${parseInt(maxFlavors) > 1 ? 'sabores' : 'sabor'}`,
            isRequired: true,
            minSelections: 1,
            maxSelections: parseInt(maxFlavors),
            sortOrder: 0,
            isActive: true,
            options: flavors.map((flavor, index) => ({
              name: flavor,
              price: 0,
              isActive: true,
              sortOrder: index
            }))
          });
        }

        // Borders group
        if (hasBorders && borders.length > 0) {
          groups.push({
            name: 'Bordas',
            description: 'Escolha uma borda',
            isRequired: false,
            minSelections: 0,
            maxSelections: 1,
            sortOrder: 1,
            isActive: true,
            options: borders.map((border, index) => ({
              name: border.name,
              price: parseFloat(border.price || '0'),
              isActive: true,
              sortOrder: index
            }))
          });
        }

        // Extras group
        if (hasExtras && extras.length > 0) {
          groups.push({
            name: 'Extras',
            description: 'Adicione extras ao seu pedido',
            isRequired: false,
            minSelections: 0,
            maxSelections: 10, // Fix: não pode ser null
            sortOrder: 2,
            isActive: true,
            options: extras.map((extra, index) => ({
              name: extra.name,
              price: parseFloat(extra.price || '0'),
              isActive: true,
              sortOrder: index
            }))
          });
        }

        // Create groups and link to item
        const createdGroupIds = [];
        
        console.log('🚀 [MODAL] Creating customization groups...');
        console.log('📋 [MODAL] Groups to create:', groups.length);
        console.log('🏪 [MODAL] Restaurant ID:', restaurantId);
        console.log('🏪 [MODAL] Restaurant ID type:', typeof restaurantId);
        console.log('🏪 [MODAL] Restaurant ID length:', restaurantId?.length);
        
        for (const groupData of groups) {
          console.log('📦 [MODAL] Sending group:', groupData);
          console.log('🔗 [MODAL] URL:', `/api/restaurants/${restaurantId}/customizations`);
          
          const groupResponse = await fetch(`/api/restaurants/${restaurantId}/customizations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(groupData),
          });

          console.log('📡 [MODAL] Response status:', groupResponse.status);

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

            {/* Image */}
            <div>
              <Label>Imagem</Label>
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-2 border rounded-md"
                />
              )}
            </div>

            {/* Customizations Section */}
            <div className="border-t-2 border-dashed pt-4 mt-4">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="hasCustomizations"
                  checked={hasCustomizations}
                  onChange={(e) => setHasCustomizations(e.target.checked)}
                  className="w-5 h-5"
                />
                <Label htmlFor="hasCustomizations" className="text-lg font-semibold cursor-pointer">
                  🍕 Este produto tem opções de personalização?
                </Label>
              </div>

              {hasCustomizations && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  {/* Flavors */}
                  <div className="border-b pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="hasFlavors"
                        checked={hasFlavors}
                        onChange={(e) => setHasFlavors(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="hasFlavors" className="font-semibold cursor-pointer">
                        Cliente pode escolher sabores
                      </Label>
                    </div>

                    {hasFlavors && (
                      <div className="ml-6 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newFlavor}
                            onChange={(e) => setNewFlavor(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFlavor())}
                            placeholder="Nome do sabor"
                            className="flex-1 p-2 border rounded"
                          />
                          <input
                            type="number"
                            value={maxFlavors}
                            onChange={(e) => setMaxFlavors(e.target.value)}
                            placeholder="Máx"
                            className="w-20 p-2 border rounded text-center"
                            min="1"
                          />
                          <Button type="button" onClick={addFlavor} size="sm">
                            <Plus size={16} />
                          </Button>
                        </div>

                        {flavors.length > 0 && (
                          <div className="space-y-1">
                            {flavors.map((flavor, i) => (
                              <div key={i} className="flex items-center justify-between bg-white p-2 rounded">
                                <span>{flavor}</span>
                                <div className="flex gap-2">
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      const newName = prompt('Editar sabor:', flavor);
                                      if (newName && newName.trim()) {
                                        const updated = [...flavors];
                                        updated[i] = newName.trim();
                                        setFlavors(updated);
                                      }
                                    }}
                                    className="text-blue-500 hover:text-blue-700"
                                    title="Editar"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                  </button>
                                  <button type="button" onClick={() => setFlavors(flavors.filter((_, idx) => idx !== i))}>
                                    <Trash2 size={14} className="text-red-500" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Borders */}
                  <div className="border-b pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="hasBorders"
                        checked={hasBorders}
                        onChange={(e) => setHasBorders(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="hasBorders" className="font-semibold cursor-pointer">
                        Cliente pode escolher borda
                      </Label>
                    </div>

                    {hasBorders && (
                      <div className="ml-6 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newBorder.name}
                            onChange={(e) => setNewBorder({...newBorder, name: e.target.value})}
                            placeholder="Nome da borda"
                            className="flex-1 p-2 border rounded"
                          />
                          <PriceInput
                            value={newBorder.price}
                            onChange={(val) => setNewBorder({...newBorder, price: val})}
                            placeholder="Ex: 1000 = R$ 10,00"
                          />
                          <Button type="button" onClick={addBorder} size="sm">
                            <Plus size={16} />
                          </Button>
                        </div>

                        {borders.length > 0 && (
                          <div className="space-y-1">
                            {borders.map((border, i) => (
                              <div key={i} className="flex items-center justify-between bg-white p-2 rounded">
                                <span>{border.name} - +R$ {parseFloat(border.price || '0').toFixed(2)}</span>
                                <div className="flex gap-2">
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      const newName = prompt('Editar nome da borda:', border.name);
                                      const newPrice = prompt('Editar preço (em centavos):', border.price);
                                      if (newName && newPrice !== null) {
                                        const updated = [...borders];
                                        updated[i] = { name: newName.trim(), price: newPrice };
                                        setBorders(updated);
                                      }
                                    }}
                                    className="text-blue-500 hover:text-blue-700"
                                    title="Editar"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                  </button>
                                  <button type="button" onClick={() => setBorders(borders.filter((_, idx) => idx !== i))}>
                                    <Trash2 size={14} className="text-red-500" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Extras */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="hasExtras"
                        checked={hasExtras}
                        onChange={(e) => setHasExtras(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="hasExtras" className="font-semibold cursor-pointer">
                        Cliente pode adicionar extras
                      </Label>
                    </div>

                    {hasExtras && (
                      <div className="ml-6 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newExtra.name}
                            onChange={(e) => setNewExtra({...newExtra, name: e.target.value})}
                            placeholder="Nome do extra"
                            className="flex-1 p-2 border rounded"
                          />
                          <PriceInput
                            value={newExtra.price}
                            onChange={(val) => setNewExtra({...newExtra, price: val})}
                            placeholder="Ex: 200 = R$ 2,00"
                          />
                          <Button type="button" onClick={addExtra} size="sm">
                            <Plus size={16} />
                          </Button>
                        </div>

                        {extras.length > 0 && (
                          <div className="space-y-1">
                            {extras.map((extra, i) => (
                              <div key={i} className="flex items-center justify-between bg-white p-2 rounded">
                                <span>{extra.name} - +R$ {parseFloat(extra.price || '0').toFixed(2)}</span>
                                <div className="flex gap-2">
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      const newName = prompt('Editar nome do extra:', extra.name);
                                      const newPrice = prompt('Editar preço (em centavos):', extra.price);
                                      if (newName && newPrice !== null) {
                                        const updated = [...extras];
                                        updated[i] = { name: newName.trim(), price: newPrice };
                                        setExtras(updated);
                                      }
                                    }}
                                    className="text-blue-500 hover:text-blue-700"
                                    title="Editar"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                  </button>
                                  <button type="button" onClick={() => setExtras(extras.filter((_, idx) => idx !== i))}>
                                    <Trash2 size={14} className="text-red-500" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

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
