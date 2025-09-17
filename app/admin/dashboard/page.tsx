'use client';

import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useTheme } from 'next-themes';

// Modal Components (these would need to be created or imported from existing files)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreateRestaurantModalProps extends ModalProps {
  onSuccess: (restaurant: Restaurant) => void;
}

interface AddItemModalProps extends ModalProps {
  restaurantId: string;
  categories: Category[];
  onSuccess: () => void;
}

interface AddCategoryModalProps extends ModalProps {
  restaurantId: string;
  onSuccess: () => void;
}

interface EditRestaurantModalProps extends ModalProps {
  restaurant: Restaurant;
  onSuccess: () => void;
}

interface PersonalizeModalProps extends ModalProps {
  restaurant: Restaurant;
  onSuccess: () => void;
}

interface ReportsModalProps extends ModalProps {
  restaurant: Restaurant;
}

interface ImportCatalogModalProps extends ModalProps {
  restaurantId: string;
  onSuccess: () => void;
}

// Placeholder Modal Components
function CreateRestaurantModal({ isOpen, onClose, onSuccess }: CreateRestaurantModalProps) {
  const [formData, setFormData] = useState(() => {
    // Recuperar dados do localStorage se existirem
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('createRestaurantForm');
      if (savedData) {
        try {
          return JSON.parse(savedData);
        } catch (e) {
          console.error('Erro ao recuperar dados salvos:', e);
        }
      }
    }
    return {
      name: '',
      slug: '',
      phone: '',
      address: '',
      whatsapp: ''
    };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Salvar dados no localStorage sempre que formData mudar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('createRestaurantForm', JSON.stringify(formData));
    }
  }, [formData]);

  // Limpar localStorage quando modal fechar com sucesso
  const clearSavedData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('createRestaurantForm');
    }
  };

  if (!isOpen) return null;

  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Tipo de arquivo não permitido. Use apenas imagens.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 5MB.');
        return;
      }
      // Need to declare setSelectedLogoFile state first
      const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
      setSelectedLogoFile(file);
    }
  };

  const handleBannerFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Tipo de arquivo não permitido. Use apenas imagens.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 5MB.');
        return;
      }
      const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(null);
      setSelectedBannerFile(file);
    }
  };

  const uploadFile = async (file: File, setUploading: (loading: boolean) => void): Promise<string> => {
    setUploading(true);
    try {
      // Primeiro, obter URL pré-assinada
      const presignedResponse = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });
      
      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json();
        throw new Error(errorData.error || 'Erro ao gerar URL de upload');
      }
      
      const { uploadUrl, cloud_storage_path } = await presignedResponse.json();
      
      // Fazer upload direto para S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Erro no upload da imagem para S3');
      }
      
      return cloud_storage_path;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit chamado');
    console.log('formData atual:', formData);
    
    // Validação manual dos campos obrigatórios
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'URL é obrigatória';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    setErrors({});
    
    setIsSubmitting(true);

    try {
      console.log('Enviando requisição para /api/restaurant');
      const response = await fetch('/api/restaurant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const restaurant = await response.json();
        console.log('Restaurante criado:', restaurant);
        toast.success('Restaurante criado com sucesso!');
        clearSavedData(); // Limpar dados salvos
        onSuccess(restaurant);
        onClose();
      } else {
        // Tentar obter mensagem de erro específica da API
        let errorMessage = 'Erro ao criar restaurante';
        try {
          const errorData = await response.json();
          console.error('Erro da API:', errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Erro ao parsear resposta de erro:', parseError);
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      toast.error(`Erro de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Criar Restaurante</h2>
        <form onSubmit={(e) => { console.log('Form submit event triggered'); handleSubmit(e); }} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Restaurante</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                const slug = name
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '') // Remove acentos
                  .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
                  .trim()
                  .replace(/\s+/g, '-') // Substitui espaços por hífens
                  .replace(/-+/g, '-'); // Remove hífens duplicados
                setFormData({ ...formData, name, slug });
                if (errors.name) {
                  setErrors({ ...errors, name: '' });
                }
              }}
              className={errors.name ? 'border-red-500' : ''}
              required
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="slug">URL (Slug)</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => {
                setFormData({ ...formData, slug: e.target.value });
                if (errors.slug) {
                  setErrors({ ...errors, slug: '' });
                }
              }}
              className={errors.slug ? 'border-red-500' : ''}
              required
            />
            {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                if (errors.phone) {
                  setErrors({ ...errors, phone: '' });
                }
              }}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => {
                setFormData({ ...formData, address: e.target.value });
                if (errors.address) {
                  setErrors({ ...errors, address: '' });
                }
              }}
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Criando...' : 'Criar Restaurante'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddItemModal({ isOpen, onClose, restaurantId, categories, onSuccess }: AddItemModalProps) {
  console.log('AddItemModal renderizado, isOpen:', isOpen);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    promoPrice: '',
    isPromo: false,
    categoryId: '',
    image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState<any[]>([]);

  // Carregar categorias dinamicamente da API
  useEffect(() => {
    async function loadCategories() {
      if (!isOpen) return;
      
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (Array.isArray(data)) {
          setDynamicCategories(data);
        }
      } catch (err) {
        console.error("Erro carregando categorias:", err);
        toast.error("Erro ao carregar categorias");
      }
    }
    loadCategories();
  }, [isOpen]);

  // Função para aplicar máscara de preço brasileiro
  const formatPrice = (value: string) => {
    // Remove tudo que não é número
    const numericValue = value.replace(/\D/g, '');
    
    if (numericValue === '') {
      return '';
    }
    
    // Converte para formato decimal e depois para formato brasileiro
    const decimalValue = (parseFloat(numericValue) / 100).toFixed(2);
    return decimalValue.replace('.', ',');
  };

  // Função para converter preço brasileiro para número
  const parsePrice = (value: string) => {
    if (!value) return 0;
    return parseFloat(value.replace(',', '.'));
  };

  const handlePriceChange = (field: 'price' | 'promoPrice', value: string) => {
    const formattedValue = formatPrice(value);
    setFormData({ ...formData, [field]: formattedValue });
  };

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Tipo de arquivo não permitido. Use apenas imagens.');
        return;
      }
      
      // Validar tamanho (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 10MB.');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!selectedFile) return '';
    
    setIsUploading(true);
    try {
      // Usar FormData para upload tradicional
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData, // Não definir Content-Type, deixar o browser definir automaticamente
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no upload da imagem');
      }
      
      const { cloud_storage_path } = await response.json();
      return cloud_storage_path;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('AddItemModal handleSubmit chamada!');
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validações básicas
      if (!formData.name.trim()) {
        toast.error('Nome do item é obrigatório');
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.categoryId) {
        toast.error('Categoria é obrigatória');
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.price || parsePrice(formData.price) <= 0) {
        toast.error('Preço deve ser maior que zero');
        setIsSubmitting(false);
        return;
      }
      
      if (!restaurantId) {
        toast.error('Restaurante não identificado');
        setIsSubmitting(false);
        return;
      }

      console.log('Validações passaram, iniciando upload...');
      
      // Upload da imagem se houver arquivo selecionado
      let imagePath = formData.image;
      if (selectedFile) {
        console.log('Fazendo upload da imagem...');
        imagePath = await uploadImage();
        console.log('Upload concluído:', imagePath);
      }
      
      const requestData = {
        ...formData,
        image: imagePath,
        price: parsePrice(formData.price),
        promoPrice: formData.isPromo ? parsePrice(formData.promoPrice) : null,
        originalPrice: formData.isPromo ? parsePrice(formData.price) : null,
        restaurantId
      };
      
      console.log('Dados que serão enviados:', requestData);
      
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Status da resposta:', response.status);
      
      const responseText = await response.text();
      console.log('Resposta completa:', responseText);

      if (response.ok) {
        toast.success('Item adicionado com sucesso!');
        onSuccess();
        onClose();
        setFormData({ name: '', description: '', price: '', promoPrice: '', isPromo: false, categoryId: '', image: '' });
        setSelectedFile(null);
      } else {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: 'Erro desconhecido do servidor' };
        }
        console.error('Erro da API:', errorData);
        toast.error(errorData.error || 'Erro ao adicionar item');
      }
    } catch (error) {
      console.error('Erro completo:', error);
      toast.error('Erro ao adicionar item: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Adicionar Novo Item</h2>
        <form onSubmit={(e) => { console.log('AddItemModal form submit event triggered'); handleSubmit(e); }} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Item</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="price">Preço (R$)</Label>
            <Input
              id="price"
              type="text"
              value={formData.price}
              onChange={(e) => handlePriceChange('price', e.target.value)}
              placeholder="0,00"
              required
              style={{
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'border-color 0.2s'
              }}
            />
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2" style={{
              marginTop: '15px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <input
                type="checkbox"
                id="isPromo"
                checked={formData.isPromo}
                onChange={(e) => setFormData({ ...formData, isPromo: e.target.checked, promoPrice: e.target.checked ? formData.promoPrice : '' })}
                className="rounded"
                style={{ marginRight: '8px' }}
              />
              <Label htmlFor="isPromo" style={{ margin: '0', fontWeight: 'normal' }}>Item em promoção</Label>
            </div>
            {formData.isPromo && (
              <div style={{ display: 'block' }}>
                <Label htmlFor="promoPrice">Preço Promocional (R$)</Label>
                <Input
                  id="promoPrice"
                  type="text"
                  value={formData.promoPrice}
                  onChange={(e) => handlePriceChange('promoPrice', e.target.value)}
                  placeholder="0,00"
                  required={formData.isPromo}
                  style={{
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="categoryId">Categoria</Label>
            <select
              id="categoryId"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Selecione uma categoria</option>
              {dynamicCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="image">Imagem do Item</Label>
            <div className="space-y-2">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full p-2 border rounded cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {selectedFile && (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <span className="text-sm text-green-700">📷 {selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Formatos aceitos: JPG, PNG, GIF, WebP (máx. 5MB)
              </p>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isUploading} 
              className="flex-1"
            >
              {isUploading ? 'Enviando imagem...' : isSubmitting ? 'Adicionando...' : 'Adicionar Item'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddCategoryModal({ isOpen, onClose, restaurantId, onSuccess }: AddCategoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    icon: '🍽️'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log('🔍 [FRONTEND] Dados do formulário:', formData);
    console.log('🔍 [FRONTEND] RestaurantId recebido:', restaurantId);
    
    const requestData = {
      ...formData,
      restaurant_id: restaurantId
    };
    
    console.log('🔍 [FRONTEND] Dados que serão enviados:', requestData);

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        toast.success('Categoria adicionada com sucesso!');
        onSuccess();
        onClose();
        setFormData({ name: '', icon: '🍽️' });
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Erro ao adicionar categoria';
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error('Erro ao adicionar categoria');
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonIcons = ['🍽️', '🍕', '🍔', '🍟', '🥗', '🍖', '🍗', '🥤', '🍰', '🍦', '☕', '🍺', '🏷️', '💥', '🔥', '⭐'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Adicionar Nova Categoria</h2>
        
        {/* Categoria Promoção Pré-definida */}
        <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">🏷️ Categoria Especial</h3>
          <Button
            type="button"
            onClick={() => setFormData({ name: 'Promoções', icon: '🏷️' })}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            🏷️ Criar Categoria "Promoções"
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Categoria</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Ícone</Label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {commonIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`p-2 text-2xl border rounded hover:bg-gray-100 ${
                    formData.icon === icon ? 'bg-blue-100 border-blue-500' : ''
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
            <Input
              className="mt-2"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="Ou digite um emoji personalizado"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Adicionando...' : 'Adicionar Categoria'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditRestaurantModal({ isOpen, onClose, restaurant, onSuccess }: EditRestaurantModalProps) {
  const [formData, setFormData] = useState(() => {
    // Recuperar dados do localStorage se existirem
    if (typeof window !== 'undefined' && restaurant?.id) {
      const savedData = localStorage.getItem(`editRestaurantForm_${restaurant.id}`);
      if (savedData) {
        try {
          return JSON.parse(savedData);
        } catch (e) {
          console.error('Erro ao recuperar dados salvos:', e);
        }
      }
    }
    return {
      name: restaurant?.name || '',
      slug: restaurant?.slug || '',
      phone: restaurant?.phone || '',
      whatsapp: restaurant?.whatsapp || '',
      address: restaurant?.address || '',
      description: restaurant?.description || '',
      deliveryFee: restaurant?.deliveryFee || 0,
      minOrderValue: restaurant?.minOrderValue || 0,
      openTime: restaurant?.openTime || '',
      closeTime: restaurant?.closeTime || '',
      workingDays: restaurant?.workingDays || '',
      facebook: restaurant?.facebook || '',
      instagram: restaurant?.instagram || '',
      twitter: restaurant?.twitter || ''
    };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Salvar dados no localStorage sempre que formData mudar
  useEffect(() => {
    if (typeof window !== 'undefined' && restaurant?.id && isOpen) {
      localStorage.setItem(`editRestaurantForm_${restaurant.id}`, JSON.stringify(formData));
    }
  }, [formData, restaurant?.id, isOpen]);

  useEffect(() => {
    if (restaurant) {
      // Verificar se há dados salvos no localStorage
      if (typeof window !== 'undefined') {
        const savedData = localStorage.getItem(`editRestaurantForm_${restaurant.id}`);
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            setFormData(parsedData);
            return;
          } catch (e) {
            console.error('Erro ao recuperar dados salvos:', e);
          }
        }
      }
      
      // Se não há dados salvos, usar dados do restaurant
      setFormData({
        name: restaurant.name || '',
        slug: restaurant.slug || '',
        phone: restaurant.phone || '',
        whatsapp: restaurant.whatsapp || '',
        address: restaurant.address || '',
        description: restaurant.description || '',
        deliveryFee: restaurant.deliveryFee || 0,
        minOrderValue: restaurant.minOrderValue || 0,
        openTime: restaurant.openTime || '',
        closeTime: restaurant.closeTime || '',
        workingDays: restaurant.workingDays || '',
        facebook: restaurant.facebook || '',
        instagram: restaurant.instagram || '',
        twitter: restaurant.twitter || ''
      });
    }
  }, [restaurant]);

  // Limpar localStorage quando modal fechar com sucesso
  const clearSavedData = () => {
    if (typeof window !== 'undefined' && restaurant?.id) {
      localStorage.removeItem(`editRestaurantForm_${restaurant.id}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/restaurant/${restaurant?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar restaurante');
      }

      clearSavedData(); // Limpar dados salvos após sucesso
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao atualizar informações do restaurante');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Editar Informações do Restaurante</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name">Nome do Restaurante *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
                  setFormData({ ...formData, name, slug });
                }}
                required
                placeholder="Nome do seu restaurante"
              />
            </div>
            <div>
              <Label htmlFor="edit-slug">URL (Slug) *</Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                placeholder="url-do-restaurante"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-description">Descrição</Label>
            <textarea
              id="edit-description"
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva seu restaurante..."
            />
          </div>

          <div>
            <Label htmlFor="edit-address">Endereço Completo</Label>
            <Input
              id="edit-address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Rua, número, bairro, cidade - CEP"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 3333-4444"
              />
            </div>
            <div>
              <Label htmlFor="edit-whatsapp">WhatsApp</Label>
              <Input
                id="edit-whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="(11) 99999-8888"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-deliveryFee">Taxa de Entrega (R$)</Label>
              <Input
                id="edit-deliveryFee"
                type="number"
                step="0.01"
                min="0"
                value={formData.deliveryFee}
                onChange={(e) => setFormData({ ...formData, deliveryFee: parseFloat(e.target.value) || 0 })}
                placeholder="5.00"
              />
            </div>
            <div>
              <Label htmlFor="edit-minOrderValue">Pedido Mínimo (R$)</Label>
              <Input
                id="edit-minOrderValue"
                type="number"
                step="0.01"
                min="0"
                value={formData.minOrderValue}
                onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) || 0 })}
                placeholder="20.00"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-workingDays">Dias de Funcionamento</Label>
              <Input
                id="edit-workingDays"
                value={formData.workingDays}
                onChange={(e) => setFormData({ ...formData, workingDays: e.target.value })}
                placeholder="Segunda a Domingo"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-openTime">Horário de Abertura</Label>
                <Input
                  id="edit-openTime"
                  type="time"
                  value={formData.openTime}
                  onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-closeTime">Horário de Fechamento</Label>
                <Input
                  id="edit-closeTime"
                  type="time"
                  value={formData.closeTime}
                  onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3 dark:text-white">Redes Sociais</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="edit-facebook">Facebook</Label>
                <Input
                  id="edit-facebook"
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  placeholder="https://facebook.com/seurestaurante"
                />
              </div>
              <div>
                <Label htmlFor="edit-instagram">Instagram</Label>
                <Input
                  id="edit-instagram"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="https://instagram.com/seurestaurante"
                />
              </div>
              <div>
                <Label htmlFor="edit-twitter">Twitter</Label>
                <Input
                  id="edit-twitter"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  placeholder="https://twitter.com/seurestaurante"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Opção: limpar dados salvos ao cancelar
                // clearSavedData();
                onClose();
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                // Salvar como rascunho (dados já são salvos automaticamente)
                alert('Rascunho salvo! Você pode continuar editando depois.');
              }}
              className="flex-1"
            >
              Salvar Rascunho
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PersonalizeModal({ isOpen, onClose, restaurant, onSuccess }: PersonalizeModalProps) {
  const [formData, setFormData] = useState({
    primaryColor: restaurant?.primaryColor || '#dc2626',
    secondaryColor: restaurant?.secondaryColor || '#f97316',
    logoUrl: restaurant?.logoUrl || '',
    bannerUrl: restaurant?.bannerUrl || '',
    theme: restaurant?.theme || 'light',
    showDeliveryTime: restaurant?.showDeliveryTime ?? true,
    showRatings: restaurant?.showRatings ?? true
  });
  
  // Atualizar formData quando restaurant mudar
  useEffect(() => {
    if (restaurant) {
      setFormData({
        primaryColor: restaurant.primaryColor || '#dc2626',
        secondaryColor: restaurant.secondaryColor || '#f97316',
        logoUrl: restaurant.logoUrl || '',
        bannerUrl: restaurant.bannerUrl || '',
        theme: restaurant.theme || 'light',
        showDeliveryTime: restaurant.showDeliveryTime ?? true,
        showRatings: restaurant.showRatings ?? true
      });
    }
  }, [restaurant]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('colors');
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload das imagens se houver arquivos selecionados
      let logoPath = formData.logoUrl;
      let bannerPath = formData.bannerUrl;
      
      if (selectedLogoFile) {
        // Primeiro, obter URL pré-assinada para logo
        const presignedResponse = await fetch('/api/upload/presigned', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: selectedLogoFile.name,
            fileType: selectedLogoFile.type,
            fileSize: selectedLogoFile.size,
          }),
        });
        
        if (!presignedResponse.ok) {
          const errorData = await presignedResponse.json();
          throw new Error(errorData.error || 'Erro ao gerar URL de upload do logo');
        }
        
        const { uploadUrl, cloud_storage_path } = await presignedResponse.json();
        
        // Fazer upload direto para S3
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: selectedLogoFile,
          headers: {
            'Content-Type': selectedLogoFile.type,
          },
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Erro no upload do logo para S3');
        }
        
        logoPath = cloud_storage_path;
      }
      
      if (selectedBannerFile) {
        // Primeiro, obter URL pré-assinada para banner
        const presignedResponse = await fetch('/api/upload/presigned', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: selectedBannerFile.name,
            fileType: selectedBannerFile.type,
            fileSize: selectedBannerFile.size,
          }),
        });
        
        if (!presignedResponse.ok) {
          const errorData = await presignedResponse.json();
          throw new Error(errorData.error || 'Erro ao gerar URL de upload do banner');
        }
        
        const { uploadUrl, cloud_storage_path } = await presignedResponse.json();
        
        // Fazer upload direto para S3
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: selectedBannerFile,
          headers: {
            'Content-Type': selectedBannerFile.type,
          },
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Erro no upload do banner para S3');
        }
        
        bannerPath = cloud_storage_path;
      }
      
      console.log('Sending theme data:', formData.theme);
      const response = await fetch(`/api/restaurant/${restaurant.id}/customize`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          logoUrl: logoPath,
          bannerUrl: bannerPath
        }),
      });

      if (response.ok) {
        toast.success('Personalização salva com sucesso!');
        onSuccess();
        onClose();
        setSelectedLogoFile(null);
        setSelectedBannerFile(null);
      } else {
        toast.error('Erro ao salvar personalização');
      }
    } catch (error) {
      toast.error('Erro ao salvar personalização');
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorPresets = [
    { name: 'Vermelho', primary: '#dc2626', secondary: '#f97316' },
    { name: 'Azul', primary: '#2563eb', secondary: '#0ea5e9' },
    { name: 'Verde', primary: '#16a34a', secondary: '#22c55e' },
    { name: 'Roxo', primary: '#9333ea', secondary: '#a855f7' },
    { name: 'Rosa', primary: '#e11d48', secondary: '#f43f5e' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Personalizar Restaurante</h2>
        
        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab('colors')}
            className={`px-4 py-2 ${activeTab === 'colors' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          >
            Cores
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`px-4 py-2 ${activeTab === 'images' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          >
            Imagens
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 ${activeTab === 'settings' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          >
            Configurações
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'colors' && (
            <div className="space-y-4">
              <div>
                <Label>Presets de Cores</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, primaryColor: preset.primary, secondaryColor: preset.secondary })}
                      className="p-2 border rounded text-center hover:bg-gray-50"
                    >
                      <div className="flex gap-1 justify-center mb-1">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.primary }}></div>
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.secondary }}></div>
                      </div>
                      <span className="text-xs">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              
              {/* Preview das cores */}
              <div className="mt-4 p-4 border rounded-lg">
                <Label className="text-sm font-medium mb-2 block">Preview das Cores</Label>
                <div className="space-y-2">
                  <div 
                    className="p-3 rounded text-white font-medium"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    Cor Primária - Botões e destaques
                  </div>
                  <div 
                    className="p-3 rounded text-white font-medium"
                    style={{ backgroundColor: formData.secondaryColor }}
                  >
                    Cor Secundária - Acentos e ícones
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="logo">Logo do Restaurante</Label>
                <div className="space-y-2">
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                        if (!allowedTypes.includes(file.type)) {
                          toast.error('Tipo de arquivo não permitido. Use apenas imagens.');
                          return;
                        }
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error('Arquivo muito grande. Máximo 5MB.');
                          return;
                        }
                        setSelectedLogoFile(file);
                      }
                    }}
                    className="w-full p-2 border rounded cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {selectedLogoFile && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <span className="text-sm text-green-700">🖼️ {selectedLogoFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedLogoFile(null)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Formatos aceitos: JPG, PNG, GIF, WebP (máx. 5MB)
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="banner">Banner do Restaurante</Label>
                <div className="space-y-2">
                  <input
                    type="file"
                    id="banner"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                        if (!allowedTypes.includes(file.type)) {
                          toast.error('Tipo de arquivo não permitido. Use apenas imagens.');
                          return;
                        }
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error('Arquivo muito grande. Máximo 5MB.');
                          return;
                        }
                        setSelectedBannerFile(file);
                      }
                    }}
                    className="w-full p-2 border rounded cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {selectedBannerFile && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <span className="text-sm text-green-700">🖼️ {selectedBannerFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedBannerFile(null)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Formatos aceitos: JPG, PNG, GIF, WebP (máx. 5MB)
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div>
                <Label>Tema</Label>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showDeliveryTime}
                    onChange={(e) => setFormData({ ...formData, showDeliveryTime: e.target.checked })}
                  />
                  Mostrar tempo de entrega
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showRatings}
                    onChange={(e) => setFormData({ ...formData, showRatings: e.target.checked })}
                  />
                  Mostrar avaliações
                </label>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploadingLogo || isUploadingBanner} className="flex-1">
              {isUploadingLogo || isUploadingBanner ? 'Enviando imagens...' : isSubmitting ? 'Salvando...' : 'Salvar Personalização'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReportsModal({ isOpen, onClose, restaurant }: ReportsModalProps) {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports?restaurantId=${restaurant?.id}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        toast.error('Erro ao carregar relatórios');
      }
    } catch (error) {
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel') => {
    try {
      const response = await fetch(`/api/reports/export?restaurantId=${restaurant?.id}&format=${format}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-${dateRange.startDate}-${dateRange.endDate}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Relatório exportado com sucesso!');
      } else {
        toast.error('Erro ao exportar relatório');
      }
    } catch (error) {
      toast.error('Erro ao exportar relatório');
    }
  };

  useEffect(() => {
    if (isOpen && restaurant?.id) {
      fetchReportData();
    }
  }, [isOpen, restaurant?.id, dateRange]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Relatórios - {restaurant?.name}</h2>
          <div className="flex gap-2">
            <Button onClick={() => exportReport('excel')} variant="outline" size="sm">
              📊 Excel
            </Button>
            <Button onClick={() => exportReport('pdf')} variant="outline" size="sm">
              📄 PDF
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <div>
            <Label htmlFor="startDate">Data Inicial</Label>
            <Input
              id="startDate"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="endDate">Data Final</Label>
            <Input
              id="endDate"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={fetchReportData} disabled={loading}>
              {loading ? 'Carregando...' : 'Atualizar'}
            </Button>
          </div>
        </div>

        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 ${activeTab === 'sales' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          >
            Vendas
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 ${activeTab === 'products' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          >
            Produtos
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Carregando relatórios...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800">Total de Pedidos</h3>
                  <p className="text-2xl font-bold text-blue-600">{reportData?.totalOrders || 0}</p>
                  <p className="text-sm text-blue-600">+12% vs período anterior</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800">Receita Total</h3>
                  <p className="text-2xl font-bold text-green-600">R$ {reportData?.totalRevenue?.toFixed(2) || '0.00'}</p>
                  <p className="text-sm text-green-600">+8% vs período anterior</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-800">Ticket Médio</h3>
                  <p className="text-2xl font-bold text-orange-600">R$ {reportData?.averageTicket?.toFixed(2) || '0.00'}</p>
                  <p className="text-sm text-orange-600">-3% vs período anterior</p>
                </div>
              </div>
            )}

            {activeTab === 'sales' && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Vendas por Dia</h3>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Gráfico de vendas por dia (implementar com Chart.js)
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Horários de Pico</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>12:00 - 14:00</span>
                        <span className="font-semibold">35%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>19:00 - 21:00</span>
                        <span className="font-semibold">28%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>18:00 - 19:00</span>
                        <span className="font-semibold">22%</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Métodos de Pagamento</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>PIX</span>
                        <span className="font-semibold">45%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cartão de Crédito</span>
                        <span className="font-semibold">35%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dinheiro</span>
                        <span className="font-semibold">20%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-4">Produtos Mais Vendidos</h3>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div key={item} className="flex justify-between items-center p-2 bg-white rounded">
                        <div>
                          <span className="font-medium">Pizza Margherita #{item}</span>
                          <p className="text-sm text-gray-600">Categoria: Pizzas</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{50 - item * 8} vendas</p>
                          <p className="text-sm text-gray-600">R$ {(25.90 * (50 - item * 8)).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
}

function ImportCatalogModal({ isOpen, onClose, restaurantId, onSuccess }: ImportCatalogModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<any>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'results'>('upload');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
        setValidationErrors([]);
      } else {
        toast.error('Formato de arquivo não suportado. Use CSV ou Excel.');
      }
    }
  };

  const processFile = async () => {
    if (!file || !restaurantId) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('restaurantId', restaurantId);

    try {
      const response = await fetch('/api/catalog/preview', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewData(data.products || []);
        setValidationErrors(data.errors || []);
        setStep('preview');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erro ao processar arquivo');
      }
    } catch (error) {
      toast.error('Erro ao processar arquivo');
    } finally {
      setUploading(false);
    }
  };

  const confirmImport = async () => {
    if (!file || !restaurantId) return;
    
    setStep('importing');
    setImportProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('restaurantId', restaurantId);

    try {
      const response = await fetch('/api/catalog/import', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setImportResults(data);
        setStep('results');
        toast.success('Catálogo importado com sucesso!');
        if (onSuccess) onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erro ao importar catálogo');
        setStep('preview');
      }
    } catch (error) {
      toast.error('Erro ao importar catálogo');
      setStep('preview');
    }
  };

  const downloadTemplate = () => {
    const csvContent = "nome,descricao,preco,categoria,disponivel,imagem_url\nPizza Margherita,Pizza com molho de tomate e mussarela,25.90,Pizzas,true,\nHamburguer Clássico,Hamburguer com carne e queijo,18.50,Lanches,true,";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-catalogo.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const resetModal = () => {
    setFile(null);
    setStep('upload');
    setPreviewData([]);
    setValidationErrors([]);
    setImportResults(null);
    setImportProgress(0);
  };

  useEffect(() => {
    if (step === 'importing') {
      const interval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [step]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Importar Catálogo</h2>
          <Button onClick={downloadTemplate} variant="outline" size="sm">
            📥 Baixar Template
          </Button>
        </div>

        {step === 'upload' && (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="space-y-4">
                <div className="text-4xl">📁</div>
                <div>
                  <h3 className="text-lg font-semibold">Selecione um arquivo</h3>
                  <p className="text-gray-600">Formatos aceitos: CSV, Excel (.xlsx)</p>
                </div>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button type="button" className="mt-2">
                    Escolher Arquivo
                  </Button>
                </label>
                {file && (
                  <div className="mt-4 p-3 bg-blue-50 rounded">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-600">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">📋 Instruções:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Use o template fornecido para garantir a formatação correta</li>
                <li>• Colunas obrigatórias: nome, preço, categoria</li>
                <li>• Preços devem usar ponto como separador decimal (ex: 25.90)</li>
                <li>• Campo 'disponivel' deve ser 'true' ou 'false'</li>
              </ul>
            </div>

            <div className="flex justify-between">
              <Button onClick={onClose} variant="outline">Cancelar</Button>
              <Button onClick={processFile} disabled={!file || uploading}>
                {uploading ? 'Processando...' : 'Continuar'}
              </Button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            {validationErrors.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">⚠️ Erros encontrados:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-3">Prévia dos Produtos ({previewData.length} itens)</h3>
              <div className="max-h-64 overflow-y-auto border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Nome</th>
                      <th className="p-2 text-left">Preço</th>
                      <th className="p-2 text-left">Categoria</th>
                      <th className="p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 10).map((product, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{product.nome}</td>
                        <td className="p-2">R$ {product.preco}</td>
                        <td className="p-2">{product.categoria}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            product.disponivel ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.disponivel ? 'Disponível' : 'Indisponível'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 10 && (
                  <div className="p-2 text-center text-gray-500 text-sm">
                    ... e mais {previewData.length - 10} produtos
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <Button onClick={resetModal} variant="outline">Voltar</Button>
              <Button 
                onClick={confirmImport} 
                disabled={validationErrors.length > 0}
                className={validationErrors.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Importar Catálogo
              </Button>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="space-y-6 text-center">
            <div className="text-4xl">⏳</div>
            <div>
              <h3 className="text-lg font-semibold">Importando catálogo...</h3>
              <p className="text-gray-600">Por favor, aguarde enquanto processamos seus produtos</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${importProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">{importProgress}% concluído</p>
          </div>
        )}

        {step === 'results' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-semibold text-green-600">Importação Concluída!</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h4 className="font-semibold text-green-800">Produtos Importados</h4>
                <p className="text-2xl font-bold text-green-600">{importResults?.imported || 0}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <h4 className="font-semibold text-yellow-800">Produtos Atualizados</h4>
                <p className="text-2xl font-bold text-yellow-600">{importResults?.updated || 0}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <h4 className="font-semibold text-red-800">Erros</h4>
                <p className="text-2xl font-bold text-red-600">{importResults?.errors || 0}</p>
              </div>
            </div>

            {importResults?.errorDetails && importResults.errorDetails.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Detalhes dos Erros:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {importResults.errorDetails.map((error: string, index: number) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-center">
              <Button onClick={() => { resetModal(); onClose(); }}>
                Concluir
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  description?: string;
  deliveryFee?: number;
  minOrderValue?: number;
  openTime?: string;
  closeTime?: string;
  workingDays?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  categories?: Category[];
  menuItems?: MenuItem[];
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  bannerUrl?: string;
  theme?: string;
  showDeliveryTime?: boolean;
  showRatings?: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  menuItems: MenuItem[];
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isPromo?: boolean;
  originalPrice?: number;
  category: Category;
}

interface Order {
  id: string;
  customerName?: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  createdAt: string;
  address?: string;
  phone?: string;
  paymentMethod?: string;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  customizations?: string[];
}

export default function AdminDashboard() {
  const { user, session, loading } = useAuth();
  
  // Debug da sessão
  useEffect(() => {
    console.log('Loading:', loading);
    console.log('Dados da sessão:', session);
    console.log('Usuário:', user);
    console.log('Email do usuário:', user?.email);
  }, [session, loading, user]);
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalCategories: 0,
    promoItems: 0
  });
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showCreateRestaurantModal, setShowCreateRestaurantModal] = useState(false);
  const [showEditRestaurantModal, setShowEditRestaurantModal] = useState(false);
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    // Aguarda o carregamento completo da autenticação
    if (loading) {
      console.log('Aguardando carregamento da autenticação...');
      return;
    }

    // Verifica se há sessão e usuário após o carregamento
    if (!session || !user) {
      console.log('Sem sessão ou usuário, redirecionando para login...');
      console.log('Session:', session);
      console.log('User:', user);
      router.push('/auth/login');
      return;
    }

    console.log('Usuário autenticado, carregando dados do dashboard...');
    fetchRestaurantData();
    fetchOrders();
    fetchItems();
  }, [session, loading, user, router]);

  // Apply theme when restaurant theme changes
  useEffect(() => {
    if (restaurant?.theme) {
      setTheme(restaurant.theme);
      document.documentElement.className = restaurant.theme === 'dark' ? 'dark' : '';
    }
  }, [restaurant?.theme, setTheme]);

  const fetchRestaurantData = async () => {
    try {
      const response = await fetch('/api/restaurant');
      if (response.ok) {
        const data = await response.json();
        // A API retorna um array, então pegamos o primeiro restaurante
        const restaurantData = Array.isArray(data) ? data[0] : data;
        setRestaurant(restaurantData);
        // Calcular estatísticas usando dados reais das APIs
        await calculateStats();
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados do restaurante');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = async () => {
    try {
      // Buscar dados reais das APIs
      const [itemsResponse, categoriesResponse] = await Promise.all([
        fetch('/api/items'),
        fetch('/api/categories')
      ]);

      let totalItems = 0;
      let totalCategories = 0;
      let promoItems = 0;

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        totalItems = itemsData.length || 0;
        promoItems = itemsData.filter((item: any) => item.is_promo).length || 0;
      }

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        totalCategories = categoriesData.length || 0;
      }

      setStats({
        totalItems,
        totalCategories,
        promoItems
      });
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      // Fallback para valores zerados em caso de erro
      setStats({
        totalItems: 0,
        totalCategories: 0,
        promoItems: 0
      });
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: status.toUpperCase() }),
      });
      
      if (response.ok) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        ));
        toast.success('Status do pedido atualizado!');
        // Recarregar pedidos para garantir sincronização
        fetchOrders();
      }
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      toast.error('Erro ao atualizar status do pedido');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Tem certeza que deseja remover este item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/items?id=${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('🗑️ Item removido com sucesso!');
        fetchRestaurantData(); // Recarregar dados do restaurante
        fetchItems(); // Recarregar lista de itens
        await calculateStats(); // Atualizar contadores
      } else {
        const errorData = await response.json();
        toast.error(`Erro ao remover item: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast.error('Erro ao remover item');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    if (!confirm(`Tem certeza que deseja remover ${selectedItems.length} ${selectedItems.length === 1 ? 'item' : 'itens'}?`)) return;
    
    try {
      const deletePromises = selectedItems.map(itemId => 
        fetch(`/api/items?id=${itemId}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      
      toast.success(`🗑️ ${selectedItems.length} ${selectedItems.length === 1 ? 'item removido' : 'itens removidos'} com sucesso!`);
      setSelectedItems([]);
      setShowBulkActions(false);
      fetchRestaurantData();
      fetchItems(); // Recarregar lista de itens
      await calculateStats(); // Atualizar contadores
    } catch (error) {
      console.error('Erro ao remover itens:', error);
      toast.error('Erro ao remover itens');
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newSelection = prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];
      
      setShowBulkActions(newSelection.length > 0);
      return newSelection;
    });
  };

  const handleSelectAllInCategory = (categoryItems: any[]) => {
    const categoryItemIds = categoryItems.map(item => item.id);
    const allSelected = categoryItemIds.every(id => selectedItems.includes(id));
    
    if (allSelected) {
      setSelectedItems(prev => prev.filter(id => !categoryItemIds.includes(id)));
    } else {
      setSelectedItems(prev => [...new Set([...prev, ...categoryItemIds])]);
    }
  };

  const clearSelection = () => {
    setSelectedItems([]);
    setShowBulkActions(false);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="pizza-loader mb-4"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Painel Administrativo
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Bem-vindo, {user?.name || user?.email}!
              </p>
            </div>
            <div className="flex gap-3">
              {restaurant && (
                <Link href={`/cardapio/${restaurant.slug}`}>
                  <Button variant="outline" className="animated-button">
                    <span className="mr-2">👁️</span>
                    Ver Cardápio
                  </Button>
                </Link>
              )}
              <Link href="/auth/logout">
                <Button variant="destructive" className="animated-button">
                  Sair
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
              <span className="text-2xl">🍕</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.totalItems}</div>
              <p className="text-xs text-muted-foreground">
                Itens no cardápio
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
              <span className="text-2xl">📁</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalCategories}</div>
              <p className="text-xs text-muted-foreground">
                Categorias ativas
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promoções</CardTitle>
              <span className="text-2xl">🎉</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.promoItems}</div>
              <p className="text-xs text-muted-foreground">
                Itens em promoção
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo Principal */}
        <div className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ações Rápidas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button 
                    className="h-20 flex flex-col items-center justify-center space-y-2 animated-button hover-float"
                    onClick={() => { console.log('Botão Adicionar Item clicado'); setShowAddItemModal(true); }}
                    disabled={!restaurant}
                  >
                    <span className="text-2xl">➕</span>
                    <span>Adicionar Item</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2 animated-button hover-float"
                    onClick={() => setShowAddCategoryModal(true)}
                    disabled={!restaurant}
                  >
                    <span className="text-2xl">📁</span>
                    <span>Nova Categoria</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2 animated-button hover-float bg-gradient-to-r from-green-50 to-blue-50 border-green-200 hover:from-green-100 hover:to-blue-100"
                    onClick={() => setShowImportModal(true)}
                    disabled={!restaurant}
                  >
                    <span className="text-2xl">📥</span>
                    <span className="text-center">Importar do<br/>iFood</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2 animated-button hover-float"
                    onClick={() => setShowPersonalizeModal(true)}
                    disabled={!restaurant}
                  >
                    <span className="text-2xl">🎨</span>
                    <span>Personalizar</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2 animated-button hover-float bg-gradient-to-r from-red-50 to-orange-50 border-red-200 hover:from-red-100 hover:to-orange-100"
                    onClick={() => {
                      // Filtrar para mostrar apenas itens em promoção
                      setSelectedCategoryFilter('all');
                      setSearchTerm('');
                      // Scroll para a seção de gerenciamento
                      setTimeout(() => {
                        const element = document.querySelector('[data-section="category-management"]');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                    disabled={!restaurant}
                  >
                    <span className="text-2xl">🏷️</span>
                    <span>Promoções</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2 animated-button hover-float"
                    onClick={() => setShowReportsModal(true)}
                    disabled={!restaurant}
                  >
                    <span className="text-2xl">📊</span>
                    <span>Relatórios</span>
                  </Button>
                  
                  <Link href="/admin/dashboard/comandas">
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col items-center justify-center space-y-2 animated-button hover-float w-full"
                      disabled={!restaurant}
                    >
                      <span className="text-2xl">📋</span>
                      <span>Comandas</span>
                    </Button>
                  </Link>
                  
                  {/* Botões de administração - apenas para michaeldouglasqueiroz@gmail.com */}
                  {user?.email === "michaeldouglasqueiroz@gmail.com" && (
                    <>
                      <Link href="/admin/dashboard/usuarios">
                        <Button 
                          variant="outline" 
                          className="h-20 flex flex-col items-center justify-center space-y-2 animated-button hover-float w-full bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100"
                        >
                          <span className="text-2xl">👥</span>
                          <span>Usuários</span>
                        </Button>
                      </Link>
                      
                      <Link href="/admin/dashboard/assinaturas">
                        <Button 
                          variant="outline" 
                          className="h-20 flex flex-col items-center justify-center space-y-2 animated-button hover-float w-full bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200 hover:from-indigo-100 hover:to-blue-100"
                        >
                          <span className="text-2xl">💳</span>
                          <span>Assinaturas</span>
                        </Button>
                      </Link>
                      
                      <Link href="/admin/dashboard/logs">
                        <Button 
                          variant="outline" 
                          className="h-20 flex flex-col items-center justify-center space-y-2 animated-button hover-float w-full bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 hover:from-gray-100 hover:to-slate-100"
                        >
                          <span className="text-2xl">📋</span>
                          <span>Logs</span>
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informações do Restaurante */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent>
                {restaurant ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Nome</label>
                      <p className="text-lg font-semibold dark:text-white">{restaurant.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">URL</label>
                      <p className="text-sm text-blue-600 dark:text-blue-400">/{restaurant.slug}</p>
                    </div>
                    {restaurant.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Telefone</label>
                        <p className="dark:text-white">{restaurant.phone}</p>
                      </div>
                    )}
                    <div className="pt-3">
                      <Button 
                        className="w-full animated-button" 
                        variant="outline"
                        onClick={() => setShowEditRestaurantModal(true)}
                      >
                        Editar Informações
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400 mb-3">Nenhum restaurante cadastrado</p>
                    <Button 
                      className="animated-button"
                      onClick={() => setShowCreateRestaurantModal(true)}
                    >
                      Criar Restaurante
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gerenciamento de Itens por Categoria */}
        <Card className="mt-6" data-section="category-management">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Gerenciar Cardápio por Categoria</CardTitle>
            <div className="flex gap-2">
              {showBulkActions && (
                <div className="flex items-center gap-2 mr-4">
                  <Badge variant="secondary">
                    {selectedItems.length} {selectedItems.length === 1 ? 'item selecionado' : 'itens selecionados'}
                  </Badge>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    🗑️ Remover Selecionados
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearSelection}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddItemModal(true)}
                disabled={!restaurant}
              >
                <span className="mr-2">➕</span>
                Novo Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtros e Busca */}
            {restaurant?.categories && restaurant.categories.length > 0 && (
              <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="🔍 Buscar itens do cardápio..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="sm:w-48">
                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">📁 Todas as categorias</option>
                      {restaurant.categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {(searchTerm || selectedCategoryFilter !== 'all') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategoryFilter('all');
                      }}
                    >
                      🗑️ Limpar
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            {/* Mostrar itens cadastrados */}
            {items.length > 0 ? (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Itens Cadastrados</h3>
                {items
                  .filter(item => {
                    // Filtrar por categoria selecionada
                    if (selectedCategoryFilter !== 'all' && item.category?.id !== selectedCategoryFilter) {
                      return false;
                    }
                    
                    // Filtrar por termo de busca
                    if (searchTerm) {
                      return item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             item.description?.toLowerCase().includes(searchTerm.toLowerCase());
                    }
                    
                    return true;
                  })
                  .map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">{item.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {item.category?.icon} {item.category?.name}
                              </Badge>
                              <span className="text-sm font-medium text-green-600">
                                R$ {item.price?.toFixed(2)}
                              </span>
                              {item.is_promo && item.promo_price && (
                                <span className="text-sm font-medium text-red-600">
                                  Promoção: R$ {item.promo_price?.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            🗑️
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : restaurant?.categories && restaurant.categories.length > 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhum item cadastrado ainda</p>
                <p className="text-sm text-gray-400 mb-4">Adicione itens ao seu cardápio para começar</p>
                <Button 
                  className="animated-button"
                  onClick={() => setShowAddItemModal(true)}
                  disabled={!restaurant}
                >
                  <span className="mr-2">➕</span>
                  Adicionar Primeiro Item
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhuma categoria criada ainda</p>
                <p className="text-sm text-gray-400 mb-4">Crie categorias primeiro para organizar seus itens</p>
                <Button 
                  className="animated-button"
                  onClick={() => setShowAddCategoryModal(true)}
                  disabled={!restaurant}
                >
                  <span className="mr-2">📁</span>
                  Criar Primeira Categoria
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
          </div>
      </div>

      {/* Modals */}
      {showCreateRestaurantModal && (
        <CreateRestaurantModal 
          isOpen={showCreateRestaurantModal}
          onClose={() => setShowCreateRestaurantModal(false)}
          onSuccess={(restaurant) => {
            setRestaurant(restaurant);
            setShowCreateRestaurantModal(false);
            toast.success('🏪 Restaurante criado com sucesso!');
            fetchRestaurantData();
          }}
        />
      )}

      {showAddItemModal && (
        <AddItemModal 
          isOpen={showAddItemModal}
          onClose={() => setShowAddItemModal(false)}
          restaurantId={restaurant?.id || ''}
          categories={restaurant?.categories || []}
          onSuccess={async () => {
            setShowAddItemModal(false);
            toast.success('🍕 Item adicionado com sucesso!');
            fetchRestaurantData();
            fetchItems();
            await calculateStats(); // Atualizar contadores
          }}
        />
      )}

      {showAddCategoryModal && (
        <AddCategoryModal 
          isOpen={showAddCategoryModal}
          onClose={() => setShowAddCategoryModal(false)}
          restaurantId={restaurant?.id || ''}
          onSuccess={async () => {
            setShowAddCategoryModal(false);
            toast.success('📁 Categoria criada com sucesso!');
            fetchRestaurantData();
            await calculateStats(); // Atualizar contadores
          }}
        />
      )}

      {showEditRestaurantModal && restaurant && (
        <EditRestaurantModal 
          isOpen={showEditRestaurantModal}
          onClose={() => setShowEditRestaurantModal(false)}
          restaurant={restaurant!}
          onSuccess={() => {
            setShowEditRestaurantModal(false);
            toast.success('✏️ Informações atualizadas com sucesso!');
            fetchRestaurantData();
          }}
        />
      )}

      {showPersonalizeModal && restaurant && (
        <PersonalizeModal 
          isOpen={showPersonalizeModal}
          onClose={() => setShowPersonalizeModal(false)}
          restaurant={restaurant!}
          onSuccess={() => {
            setShowPersonalizeModal(false);
            toast.success('🎨 Personalização salva com sucesso!');
            fetchRestaurantData();
          }}
        />
      )}

      {showReportsModal && restaurant && (
        <ReportsModal 
          isOpen={showReportsModal}
          onClose={() => setShowReportsModal(false)}
          restaurant={restaurant!}
        />
      )}

      {showImportModal && restaurant && (
        <ImportCatalogModal 
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          restaurantId={restaurant.id}
          onSuccess={() => {
            setShowImportModal(false);
            toast.success('📥 Catálogo importado com sucesso!');
            fetchRestaurantData();
          }}
        />
      )}
    </div>
  );
}