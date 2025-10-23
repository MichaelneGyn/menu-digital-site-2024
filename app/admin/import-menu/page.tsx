'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, CheckCircle, AlertCircle, ArrowLeft, Plus, X, Eye, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import { PriceInput } from '@/components/PriceInput';

type ImportResult = {
  success: number;
  errors: Array<{ line: number; error: string }>;
  items: Array<{ name: string; price: number }>;
};

type CustomizationGroup = {
  id: string;
  name: string; // Ex: "Sabores", "Tamanho", "Cremes", etc.
  description: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  options: Array<{
    name: string;
    price: string;
  }>;
};

type ItemForm = {
  id: string;
  name: string;
  description: string;
  price: string;
  categoryId: string;
  categoryName: string;
  image: File | null;
  imagePreview: string;
  isPromo: boolean;
  originalPrice: string;
  // Customizations - NOVO SISTEMA FLEXÍVEL
  hasCustomizations: boolean;
  customizationGroups: CustomizationGroup[];
  // Legacy (manter compatibilidade)
  hasFlavors: boolean;
  flavors: string[];
  maxFlavors: string;
  hasBorders: boolean;
  borders: Array<{name: string; price: string}>;
  hasExtras: boolean;
  extras: Array<{name: string; price: string}>;
};

type Category = {
  id: string;
  name: string;
  icon: string;
};

export default function ImportMenuPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Estados para CSV
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  
  // Estados para Formulário Visual
  const [items, setItems] = useState<ItemForm[]>([createEmptyItem()]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  // Estados temporários para inputs de customização
  const [tempFlavorInputs, setTempFlavorInputs] = useState<Record<string, string>>({});
  const [tempBorderInputs, setTempBorderInputs] = useState<Record<string, {name: string; price: string}>>({});
  const [tempExtraInputs, setTempExtraInputs] = useState<Record<string, {name: string; price: string}>>({});
  
  // Novo sistema flexível de grupos
  const [tempGroupOptionInputs, setTempGroupOptionInputs] = useState<Record<string, {name: string; price: string}>>({});

  // Carrega categorias ao montar
  useEffect(() => {
    if (session) {
      loadCategories();
    }
  }, [session]);

  function createEmptyItem(): ItemForm {
    return {
      id: Math.random().toString(36).substring(7),
      name: '',
      description: '',
      price: '',
      categoryId: '',
      categoryName: '',
      image: null,
      imagePreview: '',
      isPromo: false,
      originalPrice: '',
      // Customizations - NOVO SISTEMA FLEXÍVEL
      hasCustomizations: false,
      customizationGroups: [],
      // Legacy (compatibilidade)
      hasFlavors: false,
      flavors: [],
      maxFlavors: '2',
      hasBorders: false,
      borders: [],
      hasExtras: false,
      extras: [],
    };
  }

  async function loadCategories() {
    try {
      const res = await fetch('/api/restaurant');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="pizza-loader mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.replace('/auth/login');
    return null;
  }

  // Funções do Formulário Visual
  const addNewItem = () => {
    setItems([...items, createEmptyItem()]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) {
      toast.error('Mantenha pelo menos 1 item');
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof ItemForm, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // Se mudou a categoria, atualiza também o categoryName
        if (field === 'categoryId' && value) {
          const selectedCategory = categories.find(cat => cat.id === value);
          if (selectedCategory) {
            updated.categoryName = selectedCategory.name;
          }
        }
        
        return updated;
      }
      return item;
    }));
  };

  // Funções para manipular grupos de customização
  const addCustomizationGroup = (itemId: string) => {
    const newGroup: CustomizationGroup = {
      id: Math.random().toString(36).substring(7),
      name: '',
      description: '',
      isRequired: false,
      minSelections: 0,
      maxSelections: 1,
      options: []
    };
    
    setItems(items.map(item => 
      item.id === itemId 
        ? { ...item, customizationGroups: [...item.customizationGroups, newGroup] }
        : item
    ));
    toast.success('Grupo de personalização adicionado!');
  };

  const removeCustomizationGroup = (itemId: string, groupId: string) => {
    setItems(items.map(item => 
      item.id === itemId 
        ? { ...item, customizationGroups: item.customizationGroups.filter(g => g.id !== groupId) }
        : item
    ));
  };

  const updateGroupField = (itemId: string, groupId: string, field: keyof CustomizationGroup, value: any) => {
    setItems(items.map(item => 
      item.id === itemId 
        ? {
            ...item,
            customizationGroups: item.customizationGroups.map(group =>
              group.id === groupId ? { ...group, [field]: value } : group
            )
          }
        : item
    ));
  };

  const addOptionToGroup = (itemId: string, groupId: string, optionName: string, optionPrice: string) => {
    if (!optionName.trim()) {
      toast.error('Digite o nome da opção');
      return;
    }

    setItems(items.map(item => 
      item.id === itemId 
        ? {
            ...item,
            customizationGroups: item.customizationGroups.map(group =>
              group.id === groupId 
                ? { ...group, options: [...group.options, { name: optionName.trim(), price: optionPrice || '0' }] }
                : group
            )
          }
        : item
    ));

    // Limpar input temporário
    setTempGroupOptionInputs({
      ...tempGroupOptionInputs,
      [groupId]: { name: '', price: '' }
    });

    toast.success('Opção adicionada!');
  };

  const editOptionInGroup = (itemId: string, groupId: string, optionIndex: number) => {
    const item = items.find(i => i.id === itemId);
    const group = item?.customizationGroups.find(g => g.id === groupId);
    const option = group?.options[optionIndex];
    
    if (!option) return;
    
    // SEMPRE mostrar os 2 prompts
    const newName = prompt('✏️ Editar NOME da opção:', option.name);
    if (newName === null) return; // Cancelou
    
    const newPrice = prompt('💰 Editar PREÇO (em centavos):\n\nExemplos:\n• 0 = Grátis\n• 500 = R$ 5,00\n• 1000 = R$ 10,00', option.price);
    if (newPrice === null) return; // Cancelou
    
    // Validar preço
    if (isNaN(Number(newPrice))) {
      toast.error('Preço inválido! Use apenas números (ex: 500)');
      return;
    }
    
    setItems(items.map(item => 
      item.id === itemId 
        ? {
            ...item,
            customizationGroups: item.customizationGroups.map(group =>
              group.id === groupId 
                ? { 
                    ...group, 
                    options: group.options.map((opt, idx) => 
                      idx === optionIndex 
                        ? { name: newName.trim(), price: newPrice }
                        : opt
                    )
                  }
                : group
            )
          }
        : item
    ));
    toast.success('✅ Opção editada com sucesso!');
  };

  const removeOptionFromGroup = (itemId: string, groupId: string, optionIndex: number) => {
    setItems(items.map(item => 
      item.id === itemId 
        ? {
            ...item,
            customizationGroups: item.customizationGroups.map(group =>
              group.id === groupId 
                ? { ...group, options: group.options.filter((_, idx) => idx !== optionIndex) }
                : group
            )
          }
        : item
    ));
  };

  const handleImageChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateItem(id, 'image', file);
        updateItem(id, 'imagePreview', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveAllItems = async () => {
    // Validação
    const invalid = items.filter(item => !item.name || !item.price || !item.categoryId);
    if (invalid.length > 0) {
      toast.error('Preencha Nome, Preço e Categoria de todos os itens');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      
      items.forEach((item, index) => {
        formData.append(`items[${index}][name]`, item.name);
        formData.append(`items[${index}][description]`, item.description);
        formData.append(`items[${index}][price]`, item.price);
        formData.append(`items[${index}][categoryId]`, item.categoryId);
        formData.append(`items[${index}][isPromo]`, String(item.isPromo));
        if (item.originalPrice) {
          formData.append(`items[${index}][originalPrice]`, item.originalPrice);
        }
        if (item.image) {
          formData.append(`items[${index}][image]`, item.image);
        }
        
        // Customizations
        if (item.hasCustomizations) {
          formData.append(`items[${index}][hasCustomizations]`, 'true');
          if (item.hasFlavors && item.flavors.length > 0) {
            formData.append(`items[${index}][flavors]`, JSON.stringify(item.flavors));
            formData.append(`items[${index}][maxFlavors]`, item.maxFlavors);
          }
          if (item.hasBorders && item.borders.length > 0) {
            formData.append(`items[${index}][borders]`, JSON.stringify(item.borders));
          }
          if (item.hasExtras && item.extras.length > 0) {
            formData.append(`items[${index}][extras]`, JSON.stringify(item.extras));
          }
        }
      });

      const res = await fetch('/api/menu/bulk-create', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Erro ao salvar itens');
      }

      const data = await res.json();
      toast.success(`✅ ${data.count} itens adicionados com sucesso!`);
      
      // Redireciona para o dashboard
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar itens');
    } finally {
      setIsSaving(false);
    }
  };

  // Funções do CSV
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar extensão
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (extension !== 'csv' && extension !== 'xlsx') {
        toast.error('Formato inválido! Use CSV ou XLSX');
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Selecione um arquivo primeiro');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/menu/import', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Erro ao importar');
      }

      const data: ImportResult = await res.json();
      setResult(data);

      if (data.success > 0) {
        toast.success(`✅ ${data.success} itens importados com sucesso!`);
      }

      if (data.errors.length > 0) {
        toast.error(`⚠️ ${data.errors.length} erros encontrados`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao importar arquivo');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `Nome,Descrição,Preço,Categoria,Imagem (URL),É Promoção?,Preço Original
Pizza Margherita,Molho de tomate e queijo mussarela,35.90,Pizzas,https://exemplo.com/pizza.jpg,não,
Pizza Calabresa,Molho e calabresa fatiada,39.90,Pizzas,https://exemplo.com/calabresa.jpg,sim,45.90
Hambúrguer Clássico,Pão hambúrguer e carne bovina,25.00,Lanches,https://exemplo.com/burger.jpg,não,
Refrigerante Lata,Coca-Cola 350ml,5.00,Bebidas,,não,`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template-cardapio.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">📤 Adicionar Itens em Massa</CardTitle>
            <CardDescription>
              Escolha a forma mais conveniente para adicionar vários itens ao seu cardápio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="visual" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="visual" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Formulário Visual
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">Recomendado</span>
                </TabsTrigger>
                <TabsTrigger value="csv" className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  Importar Planilha
                </TabsTrigger>
              </TabsList>

              {/* ABA 1: FORMULÁRIO VISUAL */}
              <TabsContent value="visual" className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                  <p className="text-sm text-blue-800">
                    ✨ <strong>Forma mais fácil!</strong> Preencha os formulários abaixo e adicione quantos itens quiser.
                  </p>
                </div>

                {isLoadingCategories ? (
                  <div className="text-center py-8">
                    <div className="pizza-loader mb-4 mx-auto"></div>
                    <p>Carregando categorias...</p>
                  </div>
                ) : (
                  <>
                    {/* Lista de Itens */}
                    <div className="space-y-4">
                      {items.map((item, index) => (
                        <Card key={item.id} className="border-2">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">Item {index + 1}</CardTitle>
                              {items.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(item.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Remover
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Nome */}
                              <div>
                                <Label>Nome do Item *</Label>
                                <Input
                                  placeholder="Ex: Pizza Calabresa"
                                  value={item.name}
                                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                />
                              </div>

                              {/* Preço */}
                              <div>
                                <Label>Preço (R$) *</Label>
                                <PriceInput
                                  value={item.price}
                                  onChange={(val) => updateItem(item.id, 'price', val)}
                                  placeholder="Digite: 1490 = R$ 14,90"
                                />
                              </div>
                            </div>

                            {/* Descrição */}
                            <div>
                              <Label>Descrição</Label>
                              <Textarea
                                placeholder="Descreva o item..."
                                value={item.description}
                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                rows={2}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Categoria */}
                              <div>
                                <Label>Categoria *</Label>
                                <select
                                  className="w-full p-2 border rounded-md"
                                  value={item.categoryId}
                                  onChange={(e) => updateItem(item.id, 'categoryId', e.target.value)}
                                >
                                  <option value="">Selecione...</option>
                                  {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                      {cat.icon} {cat.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Imagem */}
                              <div>
                                <Label>Imagem (opcional)</Label>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageChange(item.id, e)}
                                />
                                {item.imagePreview && (
                                  <img 
                                    src={item.imagePreview} 
                                    alt="Preview" 
                                    className="mt-2 h-20 w-20 object-cover rounded"
                                  />
                                )}
                              </div>
                            </div>

                            {/* Promoção */}
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={item.isPromo}
                                  onChange={(e) => updateItem(item.id, 'isPromo', e.target.checked)}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm">É uma promoção?</span>
                              </label>

                              {item.isPromo && (
                                <div className="flex-1">
                                  <PriceInput
                                    value={item.originalPrice}
                                    onChange={(val) => updateItem(item.id, 'originalPrice', val)}
                                    placeholder="Digite: 5590 = R$ 55,90"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Customizações */}
                            <div className="border-t-2 border-dashed pt-4 mt-4">
                              <label className="flex items-center gap-2 mb-4">
                                <input
                                  type="checkbox"
                                  checked={item.hasCustomizations}
                                  onChange={(e) => updateItem(item.id, 'hasCustomizations', e.target.checked)}
                                  className="w-5 h-5"
                                />
                                <span className="text-base font-semibold">🍕 Este produto tem opções de personalização?</span>
                              </label>

                              {item.hasCustomizations && (
                                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                                  
                                  {/* BOTÃO MÁGICO DE PREENCHIMENTO AUTOMÁTICO */}
                                  {(() => {
                                    const categoryLower = item.categoryName.toLowerCase();
                                    
                                    const autoFillComplete = () => {
                                      console.log('🔍 Botão Mágico clicado! Categoria:', item.categoryName, '| Lowercase:', categoryLower);
                                      const baseGroups: CustomizationGroup[] = [];
                                      
                                      if (categoryLower.includes('pizza')) {
                                        // Pizza completa com opções preenchidas
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Sabores',
                                          description: 'Escolha até 2 sabores',
                                          isRequired: true,
                                          minSelections: 1,
                                          maxSelections: 2,
                                          options: [
                                            { name: 'Calabresa', price: '0' },
                                            { name: 'Mussarela', price: '0' },
                                            { name: 'Portuguesa', price: '0' },
                                            { name: 'Frango', price: '0' },
                                            { name: 'Marguerita', price: '0' }
                                          ]
                                        });
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Bordas',
                                          description: 'Escolha a borda',
                                          isRequired: false,
                                          minSelections: 0,
                                          maxSelections: 1,
                                          options: [
                                            { name: 'Catupiry', price: '800' },
                                            { name: 'Cheddar', price: '800' },
                                            { name: 'Chocolate', price: '600' }
                                          ]
                                        });
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Extras',
                                          description: 'Adicione extras',
                                          isRequired: false,
                                          minSelections: 0,
                                          maxSelections: 5,
                                          options: [
                                            { name: 'Bacon', price: '500' },
                                            { name: 'Azeitona', price: '300' },
                                            { name: 'Cebola', price: '200' }
                                          ]
                                        });
                                        toast.success('🍕 Pizza completa configurada!');
                                      } else if (categoryLower.includes('sanduí') || categoryLower.includes('lanche') || categoryLower.includes('burger') || categoryLower.includes('hambur')) {
                                        // Hambúrguer completo: PONTO DA CARNE + Pão + Extras
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Ponto da Carne',
                                          description: 'Escolha o ponto',
                                          isRequired: true,
                                          minSelections: 1,
                                          maxSelections: 1,
                                          options: [
                                            { name: 'Ao ponto', price: '0' },
                                            { name: 'Mal passado', price: '0' },
                                            { name: 'Bem passado', price: '0' }
                                          ]
                                        });
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Pão',
                                          description: 'Escolha o pão',
                                          isRequired: true,
                                          minSelections: 1,
                                          maxSelections: 1,
                                          options: [
                                            { name: 'Pão Tradicional', price: '0' },
                                            { name: 'Pão Australiano', price: '0' },
                                            { name: 'Pão Integral', price: '0' }
                                          ]
                                        });
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Extras',
                                          description: 'Adicione extras',
                                          isRequired: false,
                                          minSelections: 0,
                                          maxSelections: 5,
                                          options: [
                                            { name: 'Queijo Extra', price: '300' },
                                            { name: 'Bacon', price: '500' },
                                            { name: 'Ovo', price: '200' },
                                            { name: 'Salada', price: '150' }
                                          ]
                                        });
                                        toast.success('🍔 Hambúrguer completo: Ponto da Carne + Pão + Extras!');
                                      } else if (categoryLower.includes('açaí') || categoryLower.includes('acai')) {
                                        // Açaí completo
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Tamanho',
                                          description: 'Escolha o tamanho',
                                          isRequired: true,
                                          minSelections: 1,
                                          maxSelections: 1,
                                          options: [
                                            { name: '300ml', price: '0' },
                                            { name: '500ml', price: '0' },
                                            { name: '700ml', price: '0' }
                                          ]
                                        });
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Extras',
                                          description: 'Adicione complementos',
                                          isRequired: false,
                                          minSelections: 0,
                                          maxSelections: 5,
                                          options: [
                                            { name: 'Leite Ninho', price: '400' },
                                            { name: 'Nutella', price: '600' },
                                            { name: 'Morango', price: '300' },
                                            { name: 'Banana', price: '200' },
                                            { name: 'Granola', price: '200' }
                                          ]
                                        });
                                        toast.success('🍇 Açaí completo configurado!');
                                      } else if (categoryLower.includes('pastel')) {
                                        // Pastel completo
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Sabores',
                                          description: 'Escolha até 2 sabores',
                                          isRequired: true,
                                          minSelections: 1,
                                          maxSelections: 2,
                                          options: [
                                            { name: 'Carne', price: '0' },
                                            { name: 'Queijo', price: '0' },
                                            { name: 'Pizza', price: '0' },
                                            { name: 'Frango', price: '0' },
                                            { name: 'Palmito', price: '0' }
                                          ]
                                        });
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Extras',
                                          description: 'Adicione extras',
                                          isRequired: false,
                                          minSelections: 0,
                                          maxSelections: 2,
                                          options: [
                                            { name: 'Catupiry', price: '300' },
                                            { name: 'Azeitona', price: '200' }
                                          ]
                                        });
                                        toast.success('🥟 Pastel completo configurado!');
                                      } else if (categoryLower.includes('bebida') || categoryLower.includes('suco') || categoryLower.includes('refri')) {
                                        // Bebida completa
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Tamanho',
                                          description: 'Escolha o tamanho',
                                          isRequired: true,
                                          minSelections: 1,
                                          maxSelections: 1,
                                          options: [
                                            { name: '300ml', price: '0' },
                                            { name: '500ml', price: '0' },
                                            { name: '1L', price: '0' }
                                          ]
                                        });
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Opções',
                                          description: 'Personalize',
                                          isRequired: false,
                                          minSelections: 0,
                                          maxSelections: 3,
                                          options: [
                                            { name: 'Com Gelo', price: '0' },
                                            { name: 'Sem Açúcar', price: '0' },
                                            { name: 'Açúcar Extra', price: '0' }
                                          ]
                                        });
                                        toast.success('🥤 Bebida completa configurada!');
                                      } else if (categoryLower.includes('sobremesa') || categoryLower.includes('doce')) {
                                        // Sobremesa completa
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Sabores',
                                          description: 'Escolha o sabor',
                                          isRequired: true,
                                          minSelections: 1,
                                          maxSelections: 1,
                                          options: [
                                            { name: 'Chocolate', price: '0' },
                                            { name: 'Morango', price: '0' },
                                            { name: 'Baunilha', price: '0' },
                                            { name: 'Doce de Leite', price: '0' }
                                          ]
                                        });
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Extras',
                                          description: 'Adicione extras',
                                          isRequired: false,
                                          minSelections: 0,
                                          maxSelections: 3,
                                          options: [
                                            { name: 'Cobertura Extra', price: '300' },
                                            { name: 'Granulado', price: '200' }
                                          ]
                                        });
                                        toast.success('🍰 Sobremesa completa configurada!');
                                      } else if (categoryLower.includes('taco') || categoryLower.includes('mexican') || categoryLower.includes('burrito')) {
                                        // Tacos/Mexicano completo
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Proteína',
                                          description: 'Escolha a proteína',
                                          isRequired: true,
                                          minSelections: 1,
                                          maxSelections: 1,
                                          options: [
                                            { name: 'Carne', price: '0' },
                                            { name: 'Frango', price: '0' },
                                            { name: 'Porco', price: '0' },
                                            { name: 'Vegetariano', price: '0' }
                                          ]
                                        });
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Molhos',
                                          description: 'Escolha o molho',
                                          isRequired: false,
                                          minSelections: 0,
                                          maxSelections: 2,
                                          options: [
                                            { name: 'Molho Picante', price: '0' },
                                            { name: 'Guacamole', price: '300' },
                                            { name: 'Sour Cream', price: '200' }
                                          ]
                                        });
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Extras',
                                          description: 'Adicione extras',
                                          isRequired: false,
                                          minSelections: 0,
                                          maxSelections: 5,
                                          options: [
                                            { name: 'Queijo Extra', price: '300' },
                                            { name: 'Jalapeño', price: '200' },
                                            { name: 'Nachos', price: '400' }
                                          ]
                                        });
                                        toast.success('🌮 Mexicano completo: Proteína + Molhos + Extras!');
                                      } else if (categoryLower.includes('massa') || categoryLower.includes('macarrão') || categoryLower.includes('espaguete') || categoryLower.includes('penne')) {
                                        // Massas completo
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Tipo de Massa',
                                          description: 'Escolha a massa',
                                          isRequired: true,
                                          minSelections: 1,
                                          maxSelections: 1,
                                          options: [
                                            { name: 'Espaguete', price: '0' },
                                            { name: 'Penne', price: '0' },
                                            { name: 'Fettuccine', price: '0' },
                                            { name: 'Parafuso', price: '0' }
                                          ]
                                        });
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Molho',
                                          description: 'Escolha o molho',
                                          isRequired: true,
                                          minSelections: 1,
                                          maxSelections: 1,
                                          options: [
                                            { name: 'Molho Bolonhesa', price: '0' },
                                            { name: 'Molho Branco', price: '0' },
                                            { name: 'Molho 4 Queijos', price: '300' },
                                            { name: 'Molho Pesto', price: '400' }
                                          ]
                                        });
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Extras',
                                          description: 'Adicione extras',
                                          isRequired: false,
                                          minSelections: 0,
                                          maxSelections: 5,
                                          options: [
                                            { name: 'Queijo Ralado Extra', price: '200' },
                                            { name: 'Bacon', price: '500' },
                                            { name: 'Azeitona', price: '300' }
                                          ]
                                        });
                                        toast.success('🍝 Massa completa: Tipo + Molho + Extras!');
                                      } else if (categoryLower.includes('salada')) {
                                        // Saladas completo
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Base',
                                          description: 'Escolha a base',
                                          isRequired: true,
                                          minSelections: 1,
                                          maxSelections: 1,
                                          options: [
                                            { name: 'Alface', price: '0' },
                                            { name: 'Mix de Folhas', price: '0' },
                                            { name: 'Rúcula', price: '0' },
                                            { name: 'Agrião', price: '0' }
                                          ]
                                        });
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Proteína',
                                          description: 'Escolha a proteína',
                                          isRequired: false,
                                          minSelections: 0,
                                          maxSelections: 1,
                                          options: [
                                            { name: 'Sem Proteína', price: '0' },
                                            { name: 'Frango Grelhado', price: '600' },
                                            { name: 'Atum', price: '700' },
                                            { name: 'Camarão', price: '1000' }
                                          ]
                                        });
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Extras',
                                          description: 'Adicione extras',
                                          isRequired: false,
                                          minSelections: 0,
                                          maxSelections: 5,
                                          options: [
                                            { name: 'Tomate Cereja', price: '200' },
                                            { name: 'Queijo Feta', price: '400' },
                                            { name: 'Croutons', price: '200' },
                                            { name: 'Molho Extra', price: '150' }
                                          ]
                                        });
                                        toast.success('🥗 Salada completa: Base + Proteína + Extras!');
                                      } else if (categoryLower.includes('sushi') || categoryLower.includes('japonês') || categoryLower.includes('japones') || categoryLower.includes('temaki')) {
                                        // Sushi/Japonês completo
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Tipo',
                                          description: 'Escolha o tipo',
                                          isRequired: true,
                                          minSelections: 1,
                                          maxSelections: 1,
                                          options: [
                                            { name: 'Salmão', price: '0' },
                                            { name: 'Atum', price: '0' },
                                            { name: 'Philadelphia', price: '0' },
                                            { name: 'Hot Roll', price: '0' },
                                            { name: 'Skin', price: '0' }
                                          ]
                                        });
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Adicionais',
                                          description: 'Adicione extras',
                                          isRequired: false,
                                          minSelections: 0,
                                          maxSelections: 5,
                                          options: [
                                            { name: 'Cream Cheese Extra', price: '300' },
                                            { name: 'Cebolinha', price: '0' },
                                            { name: 'Gergelim', price: '0' },
                                            { name: 'Shoyu Extra', price: '0' },
                                            { name: 'Wasabi Extra', price: '0' }
                                          ]
                                        });
                                        toast.success('🍣 Japonês completo: Tipos + Adicionais!');
                                      } else if (categoryLower.includes('wrap')) {
                                        // Wraps completo
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Recheio',
                                          description: 'Escolha o recheio',
                                          isRequired: true,
                                          minSelections: 1,
                                          maxSelections: 1,
                                          options: [
                                            { name: 'Frango', price: '0' },
                                            { name: 'Carne', price: '0' },
                                            { name: 'Vegetariano', price: '0' },
                                            { name: 'Caesar', price: '0' }
                                          ]
                                        });
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Molhos',
                                          description: 'Escolha o molho',
                                          isRequired: false,
                                          minSelections: 0,
                                          maxSelections: 2,
                                          options: [
                                            { name: 'Molho Caesar', price: '0' },
                                            { name: 'Molho Barbecue', price: '0' },
                                            { name: 'Molho Ranch', price: '0' }
                                          ]
                                        });
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Extras',
                                          description: 'Adicione extras',
                                          isRequired: false,
                                          minSelections: 0,
                                          maxSelections: 5,
                                          options: [
                                            { name: 'Queijo Extra', price: '300' },
                                            { name: 'Bacon', price: '500' },
                                            { name: 'Alface/Tomate', price: '150' }
                                          ]
                                        });
                                        toast.success('🌯 Wrap completo: Recheio + Molhos + Extras!');
                                      } else if (categoryLower.includes('prato') || categoryLower.includes('executivo') || categoryLower.includes('refeição')) {
                                        // Pratos Executivos completo
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Proteína',
                                          description: 'Escolha a proteína',
                                          isRequired: true,
                                          minSelections: 1,
                                          maxSelections: 1,
                                          options: [
                                            { name: 'Frango Grelhado', price: '0' },
                                            { name: 'Bife Acebolado', price: '0' },
                                            { name: 'Peixe Grelhado', price: '0' },
                                            { name: 'Feijoada', price: '0' },
                                            { name: 'Picanha', price: '0' }
                                          ]
                                        });
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Acompanhamentos',
                                          description: 'Escolha o acompanhamento',
                                          isRequired: true,
                                          minSelections: 1,
                                          maxSelections: 1,
                                          options: [
                                            { name: 'Arroz e Feijão', price: '0' },
                                            { name: 'Arroz e Salada', price: '0' },
                                            { name: 'Purê', price: '0' },
                                            { name: 'Batata Frita', price: '300' }
                                          ]
                                        });
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Extras',
                                          description: 'Adicione extras',
                                          isRequired: false,
                                          minSelections: 0,
                                          maxSelections: 5,
                                          options: [
                                            { name: 'Farofa', price: '200' },
                                            { name: 'Vinagrete', price: '150' },
                                            { name: 'Molho Extra', price: '200' }
                                          ]
                                        });
                                        toast.success('🍽️ Prato Executivo: Proteína + Acompanhamentos!');
                                      } else if (categoryLower.includes('bolo') || categoryLower.includes('torta') || categoryLower.includes('confeitaria')) {
                                        // Bolos/Confeitaria completo
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Sabor',
                                          description: 'Escolha o sabor',
                                          isRequired: true,
                                          minSelections: 1,
                                          maxSelections: 1,
                                          options: [
                                            { name: 'Chocolate', price: '0' },
                                            { name: 'Morango', price: '0' },
                                            { name: 'Limão', price: '0' },
                                            { name: 'Red Velvet', price: '0' },
                                            { name: 'Cenoura', price: '0' }
                                          ]
                                        });
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Recheio',
                                          description: 'Escolha o recheio',
                                          isRequired: true,
                                          minSelections: 1,
                                          maxSelections: 1,
                                          options: [
                                            { name: 'Recheio Brigadeiro', price: '0' },
                                            { name: 'Recheio Doce de Leite', price: '0' },
                                            { name: 'Recheio Frutas', price: '300' }
                                          ]
                                        });
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Extras',
                                          description: 'Adicione extras',
                                          isRequired: false,
                                          minSelections: 0,
                                          maxSelections: 3,
                                          options: [
                                            { name: 'Cobertura Extra', price: '400' },
                                            { name: 'Granulado', price: '200' },
                                            { name: 'Chantilly', price: '300' }
                                          ]
                                        });
                                        toast.success('🧁 Confeitaria: Sabores + Recheios + Coberturas!');
                                      } else {
                                        // Genérico
                                        baseGroups.push({
                                          id: Math.random().toString(36).substring(7),
                                          name: 'Extras',
                                          description: 'Adicione extras',
                                          isRequired: false,
                                          minSelections: 0,
                                          maxSelections: 5,
                                          options: [
                                            { name: 'Extra 1', price: '300' },
                                            { name: 'Extra 2', price: '500' }
                                          ]
                                        });
                                        toast.success('✅ Opções básicas adicionadas! Você pode editá-las.');
                                      }
                                      
                                      console.log('📦 Grupos criados:', baseGroups.length, baseGroups);
                                      
                                      if (baseGroups.length === 0) {
                                        toast.error('❌ Nenhum grupo foi criado! Categoria não reconhecida: ' + item.categoryName);
                                        return;
                                      }
                                      
                                      const updatedItems = items.map(i => {
                                        if (i.id === item.id) {
                                          const newGroups = [...i.customizationGroups, ...baseGroups];
                                          console.log('🔄 Atualizando item:', i.id);
                                          console.log('📦 Grupos anteriores:', i.customizationGroups.length);
                                          console.log('➕ Adicionando:', baseGroups.length);
                                          console.log('✅ Total final:', newGroups.length);
                                          console.log('📝 Grupos finais:', newGroups);
                                          return { ...i, customizationGroups: newGroups };
                                        }
                                        return i;
                                      });
                                      
                                      setItems(updatedItems);
                                      console.log('✅ Estado atualizado!');
                                    };

                                    return (
                                      <div className="mb-4">
                                        <button
                                          type="button"
                                          onClick={autoFillComplete}
                                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center gap-3 transition-all"
                                        >
                                          <span className="text-3xl">⚡</span>
                                          <span className="text-lg">PREENCHER AUTOMATICAMENTE PARA {item.categoryName.toUpperCase()}</span>
                                        </button>
                                        <p className="text-xs text-gray-600 mt-2 text-center">
                                          Clique para adicionar TODOS os grupos com opções já preenchidas! Você pode editar depois.
                                        </p>
                                      </div>
                                    );
                                  })()}
                                  
                                  {/* NOVO SISTEMA FLEXÍVEL DE GRUPOS - SIMPLIFICADO */}
                                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl p-5 mb-4 shadow-sm">
                                    <div className="mb-4">
                                      <div className="flex items-start justify-between mb-3">
                                        <div>
                                          <h4 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                                            <span className="text-2xl">✨</span>
                                            Opções Personalizadas
                                          </h4>
                                          <p className="text-xs text-purple-600 mt-1">
                                            💡 Ou adicione manualmente grupo por grupo
                                          </p>
                                        </div>
                                        <Button
                                          type="button"
                                          onClick={() => addCustomizationGroup(item.id)}
                                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md hover:shadow-lg transition-all"
                                          size="lg"
                                        >
                                          <Plus className="w-5 h-5 mr-2" />
                                          Criar Grupo Personalizado
                                        </Button>
                                      </div>

                                      {/* SUGESTÕES INTELIGENTES BASEADAS NA CATEGORIA */}
                                      {(() => {
                                        const categoryLower = item.categoryName.toLowerCase();
                                        let suggestions: Array<{name: string; emoji: string; description: string; maxSelections: number; isRequired: boolean}> = [];

                                        // Pizza, Pizzas, Pizza Doce, etc
                                        if (categoryLower.includes('pizza')) {
                                          suggestions = [
                                            {name: 'Sabores', emoji: '🍕', description: 'Escolha até 2 sabores', maxSelections: 2, isRequired: true},
                                            {name: 'Bordas', emoji: '🥖', description: 'Escolha a borda', maxSelections: 1, isRequired: false},
                                            {name: 'Extras', emoji: '🧀', description: 'Adicione extras', maxSelections: 5, isRequired: false}
                                          ];
                                        }
                                        // Açaí, Açai
                                        else if (categoryLower.includes('açaí') || categoryLower.includes('acai')) {
                                          suggestions = [
                                            {name: 'Tamanho', emoji: '📏', description: 'Escolha o tamanho', maxSelections: 1, isRequired: true},
                                            {name: 'Cremes', emoji: '🍫', description: 'Até 2 cremes', maxSelections: 2, isRequired: false},
                                            {name: 'Frutas', emoji: '🍓', description: 'Adicione frutas', maxSelections: 3, isRequired: false},
                                            {name: 'Complementos', emoji: '🥜', description: 'Granola, paçoca, etc', maxSelections: 3, isRequired: false}
                                          ];
                                        }
                                        // Sorvete, Sorvetes
                                        else if (categoryLower.includes('sorvete')) {
                                          suggestions = [
                                            {name: 'Sabores', emoji: '🍦', description: 'Escolha os sabores', maxSelections: 3, isRequired: true},
                                            {name: 'Caldas', emoji: '🍯', description: 'Adicione caldas', maxSelections: 2, isRequired: false},
                                            {name: 'Coberturas', emoji: '🍬', description: 'Confete, biscoito, etc', maxSelections: 3, isRequired: false}
                                          ];
                                        }
                                        // Bebida, Bebidas, Suco, Sucos
                                        else if (categoryLower.includes('bebida') || categoryLower.includes('suco') || categoryLower.includes('drink')) {
                                          suggestions = [
                                            {name: 'Sabor', emoji: '🍹', description: 'Escolha o sabor', maxSelections: 1, isRequired: true},
                                            {name: 'Tamanho', emoji: '🥤', description: 'Escolha o tamanho', maxSelections: 1, isRequired: true},
                                            {name: 'Adicionais', emoji: '🥛', description: 'Leite em pó, etc', maxSelections: 2, isRequired: false}
                                          ];
                                        }
                                        // Sanduíche, Lanche, Hamburguer, Burger
                                        else if (categoryLower.includes('sanduí') || categoryLower.includes('lanche') || categoryLower.includes('burger') || categoryLower.includes('hambur')) {
                                          suggestions = [
                                            {name: 'Pão', emoji: '🍞', description: 'Escolha o pão', maxSelections: 1, isRequired: true},
                                            {name: 'Molhos', emoji: '🥫', description: 'Até 2 molhos', maxSelections: 2, isRequired: false},
                                            {name: 'Salada', emoji: '🥬', description: 'Alface, tomate, etc', maxSelections: 3, isRequired: false},
                                            {name: 'Extras', emoji: '🧀', description: 'Queijo, bacon, etc', maxSelections: 5, isRequired: false}
                                          ];
                                        }
                                        // Pastel, Salgado, Esfiha
                                        else if (categoryLower.includes('pastel') || categoryLower.includes('salgad') || categoryLower.includes('esfiha') || categoryLower.includes('coxinha')) {
                                          suggestions = [
                                            {name: 'Sabores', emoji: '🥟', description: 'Escolha o sabor', maxSelections: 1, isRequired: true},
                                            {name: 'Molhos', emoji: '🥫', description: 'Ketchup, mostarda, etc', maxSelections: 2, isRequired: false}
                                          ];
                                        }
                                        // Genérico - qualquer categoria
                                        else {
                                          suggestions = [
                                            {name: 'Opções', emoji: '⭐', description: 'Personalize este produto', maxSelections: 1, isRequired: false}
                                          ];
                                        }

                                        return suggestions.length > 0 && (
                                          <div className="bg-white rounded-lg p-3 mb-3 border border-purple-200">
                                            <div className="text-xs font-bold text-purple-900 mb-2">🎯 Sugestões Rápidas:</div>
                                            <div className="flex flex-wrap gap-2">
                                              {suggestions.map((suggestion, idx) => (
                                                <button
                                                  key={idx}
                                                  type="button"
                                                  onClick={() => {
                                                    const newGroup: CustomizationGroup = {
                                                      id: Math.random().toString(36).substring(7),
                                                      name: suggestion.name,
                                                      description: suggestion.description,
                                                      isRequired: suggestion.isRequired,
                                                      minSelections: suggestion.isRequired ? 1 : 0,
                                                      maxSelections: suggestion.maxSelections,
                                                      options: []
                                                    };
                                                    
                                                    setItems(items.map(i => 
                                                      i.id === item.id 
                                                        ? { ...i, customizationGroups: [...i.customizationGroups, newGroup] }
                                                        : i
                                                    ));
                                                    toast.success(`${suggestion.emoji} Grupo "${suggestion.name}" adicionado!`);
                                                  }}
                                                  className="px-3 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-300 rounded-lg text-xs font-semibold text-purple-900 transition-all flex items-center gap-2"
                                                >
                                                  <span className="text-base">{suggestion.emoji}</span>
                                                  {suggestion.name}
                                                </button>
                                              ))}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">💡 Clique para adicionar rapidamente, ou crie um grupo personalizado</p>
                                          </div>
                                        );
                                      })()}
                                    </div>

                                    {item.customizationGroups.length === 0 && (
                                      <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-purple-200">
                                        <span className="text-4xl mb-2 block">👆</span>
                                        <p className="text-purple-600 font-semibold">Clique em "Novo Grupo" para começar</p>
                                        <p className="text-xs text-gray-500 mt-1">Você pode criar quantos grupos quiser!</p>
                                      </div>
                                    )}

                                    {item.customizationGroups.map((group) => (
                                      <div key={group.id} className="bg-white border-2 border-purple-100 rounded-lg p-4 mb-3">
                                        <div className="flex items-start justify-between mb-3">
                                          <div className="flex-1 space-y-3">
                                            {/* Nome do Grupo - SIMPLES */}
                                            <div>
                                              <Label className="text-sm font-bold text-purple-900">📝 Nome do Grupo *</Label>
                                              <Input
                                                placeholder="Ex: Sabores, Tamanhos, Cremes..."
                                                value={group.name}
                                                onChange={(e) => updateGroupField(item.id, group.id, 'name', e.target.value)}
                                                className="border-purple-200 mt-1 text-base"
                                              />
                                              <p className="text-xs text-gray-500 mt-1">💡 Dica: Use nomes simples como "Sabores", "Tamanho", "Extras"</p>
                                            </div>

                                            {/* Quantos pode escolher - SIMPLES */}
                                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                              <Label className="text-sm font-bold text-purple-900 flex items-center gap-2">
                                                🔢 Quantos o cliente pode escolher?
                                              </Label>
                                              <div className="flex items-center gap-3 mt-2">
                                                <div className="flex items-center gap-2">
                                                  <input
                                                    type="checkbox"
                                                    checked={group.isRequired}
                                                    onChange={(e) => updateGroupField(item.id, group.id, 'isRequired', e.target.checked)}
                                                    className="w-5 h-5"
                                                  />
                                                  <Label className="text-sm font-semibold">Obrigatório?</Label>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  <Label className="text-sm">Até</Label>
                                                  <Input
                                                    type="number"
                                                    min="1"
                                                    value={group.maxSelections}
                                                    onChange={(e) => {
                                                      const val = parseInt(e.target.value) || 1;
                                                      updateGroupField(item.id, group.id, 'maxSelections', val);
                                                      if (group.isRequired && group.minSelections === 0) {
                                                        updateGroupField(item.id, group.id, 'minSelections', 1);
                                                      }
                                                    }}
                                                    className="border-purple-200 w-20 text-center font-bold"
                                                  />
                                                  <Label className="text-sm">opções</Label>
                                                </div>
                                              </div>
                                              <p className="text-xs text-purple-600 mt-2">
                                                💡 Exemplo: Pizza com até <strong>2 sabores</strong>, ou Tamanho <strong>obrigatório</strong> (cliente deve escolher 1)
                                              </p>
                                            </div>

                                            {/* Adicionar opções ao grupo - SIMPLES */}
                                            <div className="border-t-2 border-dashed border-purple-200 pt-4 mt-3">
                                              <Label className="text-sm font-bold text-purple-900 mb-3 block">➕ Adicionar Opções</Label>
                                              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                                <div className="flex gap-2 items-end">
                                                  <div className="flex-1">
                                                    <Label className="text-sm font-semibold">Nome da Opção</Label>
                                                    <Input
                                                      placeholder="Ex: Calabresa, 500ml, Chocolate..."
                                                      value={tempGroupOptionInputs[group.id]?.name || ''}
                                                      onChange={(e) => setTempGroupOptionInputs({
                                                        ...tempGroupOptionInputs,
                                                        [group.id]: {
                                                          name: e.target.value,
                                                          price: tempGroupOptionInputs[group.id]?.price || ''
                                                        }
                                                      })}
                                                      className="border-2 mt-1 text-base"
                                                    />
                                                  </div>
                                                  <div className="w-32">
                                                    <Label className="text-sm font-semibold">+ Preço</Label>
                                                    <PriceInput
                                                      value={tempGroupOptionInputs[group.id]?.price || ''}
                                                      onChange={(val) => setTempGroupOptionInputs({
                                                        ...tempGroupOptionInputs,
                                                        [group.id]: {
                                                          name: tempGroupOptionInputs[group.id]?.name || '',
                                                          price: val
                                                        }
                                                      })}
                                                      placeholder="Ex: 500"
                                                      className="mt-1"
                                                    />
                                                  </div>
                                                  <Button
                                                    type="button"
                                                    size="lg"
                                                    onClick={() => addOptionToGroup(
                                                      item.id,
                                                      group.id,
                                                      tempGroupOptionInputs[group.id]?.name || '',
                                                      tempGroupOptionInputs[group.id]?.price || ''
                                                    )}
                                                    className="bg-green-500 hover:bg-green-600 text-white font-bold h-11"
                                                  >
                                                    <Plus className="w-5 h-5" />
                                                  </Button>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2">💰 Deixe o preço em 0 se não tiver custo adicional</p>
                                              </div>

                                              {/* Lista de opções adicionadas - VISUAL */}
                                              {group.options.length > 0 ? (
                                                <div className="space-y-2">
                                                  <div className="text-sm font-bold text-purple-900">✅ Opções ({group.options.length}):</div>
                                                  <div className="space-y-2">
                                                    {group.options.map((option, optionIdx) => (
                                                      <div key={optionIdx} className="flex justify-between items-center bg-white p-3 rounded-lg text-sm border-2 border-purple-100 hover:border-purple-300 transition-all">
                                                        <span className="font-semibold">
                                                          {option.name} 
                                                          {parseFloat(option.price) > 0 && (
                                                            <span className="text-green-600 ml-2 font-bold">+R$ {parseFloat(option.price).toFixed(2)}</span>
                                                          )}
                                                          {parseFloat(option.price) === 0 && (
                                                            <span className="text-gray-400 ml-2 text-xs">(grátis)</span>
                                                          )}
                                                        </span>
                                                        <div className="flex gap-2">
                                                          <button
                                                            type="button"
                                                            onClick={() => editOptionInGroup(item.id, group.id, optionIdx)}
                                                            className="bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full w-7 h-7 flex items-center justify-center transition-all"
                                                            title="Editar"
                                                          >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                          </button>
                                                          <button
                                                            type="button"
                                                            onClick={() => removeOptionFromGroup(item.id, group.id, optionIdx)}
                                                            className="bg-red-100 hover:bg-red-200 text-red-600 rounded-full w-7 h-7 flex items-center justify-center font-bold transition-all"
                                                            title="Remover"
                                                          >
                                                            ✕
                                                          </button>
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              ) : (
                                                <div className="text-center py-4 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                                                  👆 Adicione as opções acima
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (confirm('❌ Tem certeza que deseja remover este grupo?')) {
                                                removeCustomizationGroup(item.id, group.id);
                                              }
                                            }}
                                            className="ml-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg p-2 transition-all"
                                            title="Remover grupo"
                                          >
                                            <X className="w-5 h-5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* SISTEMA LEGADO (manter compatibilidade) */}
                                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800 mb-3">
                                    ⚠️ <strong>Sistema Antigo:</strong> Use o sistema de "Grupos de Personalização" acima (mais flexível!)
                                  </div>

                                  {/* Sabores */}
                                  <div className="border-b pb-3">
                                    <label className="flex items-center gap-2 mb-2">
                                      <input
                                        type="checkbox"
                                        checked={item.hasFlavors}
                                        onChange={(e) => updateItem(item.id, 'hasFlavors', e.target.checked)}
                                        className="w-4 h-4"
                                      />
                                      <span className="text-sm font-semibold">Cliente pode escolher sabores</span>
                                    </label>
                                    {item.hasFlavors && (
                                      <div className="ml-6 space-y-2">
                                        <div className="text-xs text-gray-600 mb-1">Digite o nome do sabor</div>
                                        <div className="flex gap-2 items-end">
                                          <div className="flex-1">
                                            <Label className="text-xs">Nome do Sabor</Label>
                                            <Input
                                              placeholder="Ex: Calabresa, Mussarela, Frango"
                                              value={tempFlavorInputs[item.id] || ''}
                                              onChange={(e) => setTempFlavorInputs({
                                                ...tempFlavorInputs,
                                                [item.id]: e.target.value
                                              })}
                                            />
                                          </div>
                                          <div className="w-24">
                                            <Label className="text-xs">Máx. Sabores</Label>
                                            <Input
                                              type="number"
                                              placeholder="2"
                                              value={item.maxFlavors}
                                              onChange={(e) => updateItem(item.id, 'maxFlavors', e.target.value)}
                                            />
                                          </div>
                                          <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => {
                                              const flavorName = tempFlavorInputs[item.id];
                                              if (flavorName?.trim()) {
                                                updateItem(item.id, 'flavors', [...item.flavors, flavorName.trim()]);
                                                setTempFlavorInputs({
                                                  ...tempFlavorInputs,
                                                  [item.id]: ''
                                                });
                                                toast.success('Sabor adicionado!');
                                              } else {
                                                toast.error('Digite o nome do sabor');
                                              }
                                            }}
                                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
                                          >
                                            <Plus className="w-4 h-4" />
                                          </Button>
                                        </div>
                                        {item.flavors.length > 0 && (
                                          <div className="space-y-1">
                                            <div className="text-xs font-semibold text-gray-700">Sabores adicionados ({item.flavors.length}):</div>
                                            {item.flavors.map((f, i) => (
                                              <div key={i} className="flex justify-between bg-white p-2 rounded text-sm border">
                                                <span>🍕 {f}</span>
                                                <button
                                                  type="button"
                                                  onClick={() => updateItem(item.id, 'flavors', item.flavors.filter((_, idx) => idx !== i))}
                                                  className="text-red-500 hover:text-red-700 font-bold"
                                                >
                                                  ✕
                                                </button>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Bordas */}
                                  <div className="border-b pb-3">
                                    <label className="flex items-center gap-2 mb-2">
                                      <input
                                        type="checkbox"
                                        checked={item.hasBorders}
                                        onChange={(e) => updateItem(item.id, 'hasBorders', e.target.checked)}
                                        className="w-4 h-4"
                                      />
                                      <span className="text-sm font-semibold">Cliente pode escolher borda</span>
                                    </label>
                                    {item.hasBorders && (
                                      <div className="ml-6 space-y-2">
                                        <div className="text-xs text-gray-600 mb-1">Adicione opções de borda com nome e preço</div>
                                        <div className="flex gap-2 items-end">
                                          <div className="flex-1">
                                            <Label className="text-xs">Nome da Borda *</Label>
                                            <Input
                                              placeholder="Ex: Catupiry, Cheddar, Chocolate"
                                              value={tempBorderInputs[item.id]?.name || ''}
                                              onChange={(e) => setTempBorderInputs({
                                                ...tempBorderInputs,
                                                [item.id]: { 
                                                  name: e.target.value, 
                                                  price: tempBorderInputs[item.id]?.price || '' 
                                                }
                                              })}
                                            />
                                          </div>
                                          <div className="w-32">
                                            <Label className="text-xs">Preço +R$</Label>
                                            <PriceInput
                                              value={tempBorderInputs[item.id]?.price || ''}
                                              onChange={(val) => setTempBorderInputs({
                                                ...tempBorderInputs,
                                                [item.id]: { 
                                                  name: tempBorderInputs[item.id]?.name || '', 
                                                  price: val 
                                                }
                                              })}
                                              placeholder="Ex: 500"
                                            />
                                          </div>
                                          <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => {
                                              const temp = tempBorderInputs[item.id];
                                              if (temp?.name.trim()) {
                                                updateItem(item.id, 'borders', [...item.borders, {
                                                  name: temp.name, 
                                                  price: temp.price || '0'
                                                }]);
                                                setTempBorderInputs({
                                                  ...tempBorderInputs,
                                                  [item.id]: { name: '', price: '' }
                                                });
                                                toast.success('Borda adicionada!');
                                              } else {
                                                toast.error('Preencha o nome da borda');
                                              }
                                            }}
                                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
                                          >
                                            <Plus className="w-4 h-4" />
                                          </Button>
                                        </div>
                                        {item.borders.length > 0 && (
                                          <div className="space-y-1">
                                            <div className="text-xs font-semibold text-gray-700">Bordas adicionadas ({item.borders.length}):</div>
                                            {item.borders.map((b, i) => (
                                              <div key={i} className="flex justify-between bg-white p-2 rounded text-sm border">
                                                <span>🍕 {b.name} - <strong className="text-green-600">+R$ {parseFloat(b.price || '0').toFixed(2)}</strong></span>
                                                <button
                                                  type="button"
                                                  onClick={() => updateItem(item.id, 'borders', item.borders.filter((_, idx) => idx !== i))}
                                                  className="text-red-500 hover:text-red-700 font-bold"
                                                >
                                                  ✕
                                                </button>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Extras */}
                                  <div>
                                    <label className="flex items-center gap-2 mb-2">
                                      <input
                                        type="checkbox"
                                        checked={item.hasExtras}
                                        onChange={(e) => updateItem(item.id, 'hasExtras', e.target.checked)}
                                        className="w-4 h-4"
                                      />
                                      <span className="text-sm font-semibold">Cliente pode adicionar extras</span>
                                    </label>
                                    {item.hasExtras && (
                                      <div className="ml-6 space-y-2">
                                        <div className="text-xs text-gray-600 mb-1">Adicione ingredientes extras com nome e preço</div>
                                        <div className="flex gap-2 items-end">
                                          <div className="flex-1">
                                            <Label className="text-xs">Nome do Extra *</Label>
                                            <Input
                                              placeholder="Ex: Bacon Extra, Queijo, Azeitona"
                                              value={tempExtraInputs[item.id]?.name || ''}
                                              onChange={(e) => setTempExtraInputs({
                                                ...tempExtraInputs,
                                                [item.id]: { 
                                                  name: e.target.value, 
                                                  price: tempExtraInputs[item.id]?.price || '' 
                                                }
                                              })}
                                            />
                                          </div>
                                          <div className="w-32">
                                            <Label className="text-xs">Preço +R$</Label>
                                            <PriceInput
                                              value={tempExtraInputs[item.id]?.price || ''}
                                              onChange={(val) => setTempExtraInputs({
                                                ...tempExtraInputs,
                                                [item.id]: { 
                                                  name: tempExtraInputs[item.id]?.name || '', 
                                                  price: val 
                                                }
                                              })}
                                              placeholder="Ex: 300"
                                            />
                                          </div>
                                          <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => {
                                              const temp = tempExtraInputs[item.id];
                                              if (temp?.name.trim()) {
                                                updateItem(item.id, 'extras', [...item.extras, {
                                                  name: temp.name, 
                                                  price: temp.price || '0'
                                                }]);
                                                setTempExtraInputs({
                                                  ...tempExtraInputs,
                                                  [item.id]: { name: '', price: '' }
                                                });
                                                toast.success('Extra adicionado!');
                                              } else {
                                                toast.error('Preencha o nome do extra');
                                              }
                                            }}
                                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
                                          >
                                            <Plus className="w-4 h-4" />
                                          </Button>
                                        </div>
                                        {item.extras.length > 0 && (
                                          <div className="space-y-1">
                                            <div className="text-xs font-semibold text-gray-700">Extras adicionados ({item.extras.length}):</div>
                                            {item.extras.map((e, i) => (
                                              <div key={i} className="flex justify-between bg-white p-2 rounded text-sm border">
                                                <span>🍔 {e.name} - <strong className="text-green-600">+R$ {parseFloat(e.price || '0').toFixed(2)}</strong></span>
                                                <button
                                                  type="button"
                                                  onClick={() => updateItem(item.id, 'extras', item.extras.filter((_, idx) => idx !== i))}
                                                  className="text-red-500 hover:text-red-700 font-bold"
                                                >
                                                  ✕
                                                </button>
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
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-3 justify-between items-center pt-4">
                      <Button
                        variant="outline"
                        onClick={addNewItem}
                        className="flex-1"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Mais um Item
                      </Button>

                      <Button
                        onClick={saveAllItems}
                        disabled={isSaving}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        size="lg"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Salvando...
                          </>
                        ) : (
                          <>
                            💾 Salvar Todos ({items.length} {items.length === 1 ? 'item' : 'itens'})
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* ABA 2: IMPORTAR CSV */}
              <TabsContent value="csv" className="space-y-6">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                  <p className="text-sm text-yellow-800">
                    📊 <strong>Para quem tem planilha pronta!</strong> Se já possui um cardápio em Excel, importe aqui.
                  </p>
                </div>

                {/* Download Template */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">
                📋 Passo 1: Baixe o Template
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                Baixe nosso modelo de exemplo e preencha com seus produtos
              </p>
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="bg-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Template CSV
              </Button>
            </div>

            {/* Upload File */}
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
              <h3 className="font-semibold text-gray-900 mb-2">
                📁 Passo 2: Selecione o Arquivo
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Formatos aceitos: CSV ou XLSX
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Escolher Arquivo
                    </span>
                  </Button>
                </label>
                {file && (
                  <span className="text-sm text-gray-700">
                    ✓ {file.name}
                  </span>
                )}
              </div>
            </div>

            {/* Import Button */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">
                🚀 Passo 3: Importar
              </h3>
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Importar Cardápio
                  </>
                )}
              </Button>
            </div>

            {/* Results */}
            {result && (
              <div className="space-y-4">
                {result.success > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-green-900">
                        {result.success} itens importados com sucesso!
                      </h4>
                    </div>
                    <div className="text-sm text-green-800 space-y-1">
                      {result.items.slice(0, 5).map((item, idx) => (
                        <div key={idx}>
                          • {item.name} - R$ {item.price.toFixed(2)}
                        </div>
                      ))}
                      {result.items.length > 5 && (
                        <div className="text-xs text-green-700 mt-2">
                          ... e mais {result.items.length - 5} itens
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {result.errors.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <h4 className="font-semibold text-red-900">
                        {result.errors.length} erro(s) encontrado(s)
                      </h4>
                    </div>
                    <div className="text-sm text-red-800 space-y-1 max-h-40 overflow-y-auto">
                      {result.errors.map((error, idx) => (
                        <div key={idx}>
                          • Linha {error.line}: {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => router.push('/admin/dashboard')}
                  variant="outline"
                >
                  Voltar para Dashboard
                </Button>
              </div>
            )}

                {/* Instructions */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>📖 Como usar o CSV</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-700 space-y-2">
                      <p><strong>1.</strong> Baixe o template CSV clicando no botão azul</p>
                      <p><strong>2.</strong> Abra o arquivo no Excel ou Google Sheets</p>
                      <p><strong>3.</strong> Preencha com os dados dos seus produtos:</p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li><strong>Nome:</strong> Nome do produto (obrigatório)</li>
                        <li><strong>Descrição:</strong> Descrição do produto</li>
                        <li><strong>Preço:</strong> Preço em reais (ex: 35.90)</li>
                        <li><strong>Categoria:</strong> Nome da categoria (será criada se não existir)</li>
                        <li><strong>Imagem (URL):</strong> Link da imagem (opcional)</li>
                        <li><strong>É Promoção?:</strong> "sim" ou "não"</li>
                        <li><strong>Preço Original:</strong> Preço antes da promoção (se aplicável)</li>
                      </ul>
                      <p><strong>4.</strong> Salve o arquivo como CSV</p>
                      <p><strong>5.</strong> Faça o upload aqui</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
