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

type CustomizationOption = {
  id: string;
  name: string;
  price: string;
};

type CustomizationGroup = {
  id: string;
  name: string;
  description?: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  options: CustomizationOption[];
};

type ItemForm = {
  id: string;
  name: string;
  description: string;
  price: string;
  cost?: string; // Custo do produto (para cálculo de lucro)
  categoryId: string;
  categoryName: string;
  image: File | null;
  imagePreview: string;
  isPromo: boolean;
  originalPrice: string;
  // Customizations
  hasCustomizations: boolean;
  customizationGroups: CustomizationGroup[];
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
  
  // Estados para grupos de personalização
  const [tempGroupInputs, setTempGroupInputs] = useState<Record<string, {optionName: string; optionPrice: string}>>({});

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
      cost: '',
      categoryId: '',
      categoryName: '',
      image: null,
      imagePreview: '',
      isPromo: false,
      originalPrice: '',
      // Customizations
      hasCustomizations: false,
      customizationGroups: [],
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
    console.log(`📝 updateItem - campo: ${String(field)}, valor:`, value);
    // ✅ Usa função callback para garantir estado mais recente
    setItems(prevItems => prevItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Funções para gerenciar grupos de personalização
  const addCustomizationGroup = (itemId: string) => {
    const newGroup: CustomizationGroup = {
      id: `temp-${Date.now()}`,
      name: '',
      description: '',
      isRequired: false,
      minSelections: 0,
      maxSelections: 1,
      options: [],
    };
    
    setItems(items.map(item => 
      item.id === itemId 
        ? { ...item, customizationGroups: [...item.customizationGroups, newGroup] }
        : item
    ));
  };

  // Sugestões rápidas baseadas na categoria
  const applyQuickSuggestions = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    console.log('🔍 DEBUG - Item completo:', item);
    console.log('🔍 DEBUG - categoryId:', item.categoryId);
    console.log('🔍 DEBUG - categoryName:', item.categoryName);

    if (!item.categoryName) {
      toast.error('⚠️ Selecione uma CATEGORIA primeiro!');
      return;
    }

    const categoryName = item.categoryName.toLowerCase();
    console.log('✅ Categoria detectada:', item.categoryName, '→', categoryName);
    let suggestedGroups: CustomizationGroup[] = [];
    let categoryDetected = '';

    // Pizza
    if (categoryName.includes('pizza')) {
      categoryDetected = 'Pizza';
      suggestedGroups = [
        {
          id: `temp-${Date.now()}-1`,
          name: 'Escolha o sabor da Pizza',
          description: '',
          isRequired: true,
          minSelections: 1,
          maxSelections: 2,
          options: [],
        },
        {
          id: `temp-${Date.now()}-2`,
          name: 'Bordas',
          description: '',
          isRequired: false,
          minSelections: 0,
          maxSelections: 1,
          options: [],
        },
        {
          id: `temp-${Date.now()}-3`,
          name: 'Extras',
          description: '',
          isRequired: false,
          minSelections: 0,
          maxSelections: 10,
          options: [],
        },
      ];
    }
    // Hambúrguer, Lanche, Burger
    else if (categoryName.includes('hambur') || categoryName.includes('lanche') || categoryName.includes('burger') || categoryName.includes('sanduíche') || categoryName.includes('sanduiche')) {
      categoryDetected = 'Hambúrguer/Lanche';
      suggestedGroups = [
        {
          id: `temp-${Date.now()}-1`,
          name: 'Ponto da Carne',
          description: '',
          isRequired: true,
          minSelections: 1,
          maxSelections: 1,
          options: [],
        },
        {
          id: `temp-${Date.now()}-2`,
          name: 'Molhos',
          description: '',
          isRequired: false,
          minSelections: 0,
          maxSelections: 3,
          options: [],
        },
      ];
    }
    // Pastel
    else if (categoryName.includes('pastel')) {
      categoryDetected = 'Pastel';
      suggestedGroups = [
        {
          id: `temp-${Date.now()}-1`,
          name: 'Escolha o Sabor/Recheio',
          description: '',
          isRequired: true,
          minSelections: 1,
          maxSelections: 1,
          options: [],
        },
        {
          id: `temp-${Date.now()}-2`,
          name: 'Tamanho',
          description: '',
          isRequired: false,
          minSelections: 0,
          maxSelections: 1,
          options: [],
        },
      ];
    }
    // Suco, Bebida
    else if (categoryName.includes('suco') || categoryName.includes('bebida') || categoryName.includes('drink')) {
      categoryDetected = 'Bebida/Suco';
      suggestedGroups = [
        {
          id: `temp-${Date.now()}-1`,
          name: 'Sabor',
          description: '',
          isRequired: true,
          minSelections: 1,
          maxSelections: 1,
          options: [],
        },
        {
          id: `temp-${Date.now()}-2`,
          name: 'Tamanho',
          description: '',
          isRequired: false,
          minSelections: 0,
          maxSelections: 1,
          options: [],
        },
      ];
    }
    // Massa, Macarrão
    else if (categoryName.includes('massa') || categoryName.includes('macarrão') || categoryName.includes('macarrao')) {
      categoryDetected = 'Massa';
      suggestedGroups = [
        {
          id: `temp-${Date.now()}-1`,
          name: 'Escolha sua massa',
          description: '',
          isRequired: true,
          minSelections: 1,
          maxSelections: 1,
          options: [],
        },
        {
          id: `temp-${Date.now()}-2`,
          name: 'Como refogar?',
          description: '',
          isRequired: true,
          minSelections: 1,
          maxSelections: 1,
          options: [],
        },
        {
          id: `temp-${Date.now()}-3`,
          name: 'Molho extra?',
          description: '',
          isRequired: false,
          minSelections: 0,
          maxSelections: 1,
          options: [],
        },
        {
          id: `temp-${Date.now()}-4`,
          name: 'Adicionais',
          description: '',
          isRequired: false,
          minSelections: 0,
          maxSelections: 5,
          options: [],
        },
      ];
    }
    // Sorvete, Açaí, Creme
    else if (categoryName.includes('sorvete') || categoryName.includes('açaí') || categoryName.includes('acai') || categoryName.includes('creme')) {
      categoryDetected = 'Sorvete/Açaí';
      suggestedGroups = [
        {
          id: `temp-${Date.now()}-1`,
          name: 'Sabor',
          description: '',
          isRequired: true,
          minSelections: 1,
          maxSelections: 2,
          options: [],
        },
        {
          id: `temp-${Date.now()}-2`,
          name: 'Tamanho',
          description: '',
          isRequired: true,
          minSelections: 1,
          maxSelections: 1,
          options: [],
        },
        {
          id: `temp-${Date.now()}-3`,
          name: 'Adicionais/Toppings',
          description: '',
          isRequired: false,
          minSelections: 0,
          maxSelections: 10,
          options: [],
        },
      ];
    }
    // Doces, Sobremesa
    else if (categoryName.includes('doce') || categoryName.includes('sobremesa')) {
      categoryDetected = 'Doces/Sobremesa';
      suggestedGroups = [
        {
          id: `temp-${Date.now()}-1`,
          name: 'Sabor/Tipo',
          description: '',
          isRequired: true,
          minSelections: 1,
          maxSelections: 1,
          options: [],
        },
        {
          id: `temp-${Date.now()}-2`,
          name: 'Cobertura',
          description: '',
          isRequired: false,
          minSelections: 0,
          maxSelections: 1,
          options: [],
        },
        {
          id: `temp-${Date.now()}-3`,
          name: 'Adicionais',
          description: '',
          isRequired: false,
          minSelections: 0,
          maxSelections: 5,
          options: [],
        },
      ];
    }
    // Genérico - se não encontrar categoria específica
    else {
      categoryDetected = 'Genérico';
      suggestedGroups = [
        {
          id: `temp-${Date.now()}-1`,
          name: 'Opções',
          description: '',
          isRequired: true,
          minSelections: 1,
          maxSelections: 1,
          options: [],
        },
      ];
    }

    // Adicionar grupos sugeridos ao item
    setItems(items.map(i => 
      i.id === itemId 
        ? { ...i, customizationGroups: [...i.customizationGroups, ...suggestedGroups] }
        : i
    ));

    console.log('✅ Categoria reconhecida:', categoryDetected);
    console.log('📋 Grupos criados:', suggestedGroups.length);
    
    toast.success(`✅ ${suggestedGroups.length} grupos de "${categoryDetected}" adicionados! Edite conforme necessário.`, {
      duration: 4000,
    });
  };

  const removeCustomizationGroup = (itemId: string, groupId: string) => {
    setItems(items.map(item => 
      item.id === itemId 
        ? { ...item, customizationGroups: item.customizationGroups.filter(g => g.id !== groupId) }
        : item
    ));
  };

  const updateGroupField = (itemId: string, groupId: string, field: keyof CustomizationGroup, value: any) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          customizationGroups: item.customizationGroups.map(group =>
            group.id === groupId ? { ...group, [field]: value } : group
          )
        };
      }
      return item;
    }));
  };

  const addOptionToGroup = (itemId: string, groupId: string, optionName: string, optionPrice: string) => {
    if (!optionName.trim()) {
      toast.error('Digite um nome para a opção');
      return;
    }

    console.log('🔵 addOptionToGroup - optionPrice recebido:', optionPrice);
    console.log('🔵 addOptionToGroup - tipo:', typeof optionPrice);

    const newOption: CustomizationOption = {
      id: `opt-${Date.now()}`,
      name: optionName.trim(),
      price: optionPrice || '0.00',
    };

    console.log('✅ newOption criada:', newOption);

    setItems(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          customizationGroups: item.customizationGroups.map(group =>
            group.id === groupId 
              ? { ...group, options: [...group.options, newOption] }
              : group
          )
        };
      }
      return item;
    }));

    // Limpar inputs temporários
    setTempGroupInputs({
      ...tempGroupInputs,
      [groupId]: { optionName: '', optionPrice: '0.00' }
    });

    toast.success('Opção adicionada!');
  };

  const removeOptionFromGroup = (itemId: string, groupId: string, optionId: string) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          customizationGroups: item.customizationGroups.map(group =>
            group.id === groupId 
              ? { ...group, options: group.options.filter(opt => opt.id !== optionId) }
              : group
          )
        };
      }
      return item;
    }));
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
    // Validação: Nome e Categoria sempre obrigatórios
    // Preço só obrigatório se NÃO tem personalização
    const invalid = items.filter(item => {
      if (!item.name || !item.categoryId) return true;
      // Se não tem personalização, preço é obrigatório
      if (!item.hasCustomizations && (!item.price || parseFloat(item.price) <= 0)) return true;
      return false;
    });
    
    if (invalid.length > 0) {
      toast.error('Preencha Nome e Categoria de todos os itens. Preço é obrigatório apenas para itens sem personalização.');
      return;
    }

    setIsSaving(true);
    try {
      // PASSO 1: Fazer upload de todas as imagens PRIMEIRO
      console.log('📤 [Import] Iniciando upload de imagens...');
      console.log('🔍 [Import] Total de itens:', items.length);
      items.forEach((item, idx) => {
        console.log(`   Item ${idx}: "${item.name}" - Tem imagem?`, !!item.image, item.image?.name || 'N/A');
      });
      
      const itemsWithImageUrls = await Promise.all(
        items.map(async (item, index) => {
          if (!item.image) {
            console.log(`⚠️ [Import] Item ${index} "${item.name}" sem imagem`);
            return { ...item, imageUrl: null };
          }

          try {
            console.log(`📸 [Import] Fazendo upload da imagem do item "${item.name}"...`);
            const uploadFormData = new FormData();
            uploadFormData.append('file', item.image);

            const uploadRes = await fetch('/api/upload', {
              method: 'POST',
              body: uploadFormData,
            });

            if (!uploadRes.ok) {
              const errorData = await uploadRes.json();
              throw new Error(errorData.error || 'Erro no upload');
            }

            const uploadResult = await uploadRes.json();
            console.log(`✅ [Import] Upload bem-sucedido para "${item.name}":`, uploadResult.image_url);
            console.log(`🔍 [Import] Tipo da URL:`, typeof uploadResult.image_url);
            console.log(`🔍 [Import] URL começa com http?`, uploadResult.image_url?.startsWith('http'));
            return { ...item, imageUrl: uploadResult.image_url };
          } catch (error: any) {
            console.error(`❌ [Import] Erro ao fazer upload da imagem "${item.name}":`, error);
            toast.error(`Erro ao fazer upload da imagem de "${item.name}": ${error.message}`);
            throw error; // Interrompe o processo se algum upload falhar
          }
        })
      );

      // PASSO 2: Enviar dados com as URLs das imagens para bulk-create
      console.log('💾 [Import] Criando itens no banco de dados...');
      const formData = new FormData();
      
      itemsWithImageUrls.forEach((item, index) => {
        formData.append(`items[${index}][name]`, item.name);
        formData.append(`items[${index}][description]`, item.description);
        // Se tem personalização e preço vazio, envia 0
        formData.append(`items[${index}][price]`, item.price || '0');
        // Custo (opcional)
        if (item.cost) {
          formData.append(`items[${index}][cost]`, item.cost);
        }
        formData.append(`items[${index}][categoryId]`, item.categoryId);
        formData.append(`items[${index}][isPromo]`, String(item.isPromo));
        if (item.originalPrice) {
          formData.append(`items[${index}][originalPrice]`, item.originalPrice);
        }
        // Envia a URL da imagem (não o arquivo)
        if (item.imageUrl) {
          formData.append(`items[${index}][imageUrl]`, item.imageUrl);
        }
        
        // Customizations - NOVO SISTEMA DE GRUPOS
        if (item.hasCustomizations && item.customizationGroups && item.customizationGroups.length > 0) {
          formData.append(`items[${index}][hasCustomizations]`, 'true');
          formData.append(`items[${index}][customizationGroups]`, JSON.stringify(item.customizationGroups));
          console.log(`📦 [Import] Item "${item.name}" tem ${item.customizationGroups.length} grupos de personalização`);
        } else if (item.hasCustomizations) {
          console.warn(`⚠️ [Import] Item "${item.name}" marcado com personalização mas SEM GRUPOS criados!`);
        }
      });

      const res = await fetch('/api/menu/bulk-create', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao salvar itens');
      }

      const data = await res.json();
      console.log('✅ [Import] Itens criados com sucesso!', data);
      toast.success(`✅ ${data.count} itens adicionados com sucesso!`);
      
      // Redireciona para o dashboard
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('❌ [Import] Erro:', error);
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
                                <Label>
                                  {item.hasCustomizations ? 'Preço (R$) - opcional se varia por sabor' : 'Preço (R$) *'}
                                </Label>
                                <PriceInput
                                  value={item.price}
                                  onChange={(val) => updateItem(item.id, 'price', val)}
                                  placeholder={item.hasCustomizations ? "Deixe vazio se o preço varia" : "Digite: 1490 = R$ 14,90"}
                                />
                                {item.hasCustomizations && (
                                  <p className="text-xs text-orange-600 mt-1">
                                    💡 Se deixar vazio, o preço virá das opções de personalização
                                  </p>
                                )}
                              </div>

                              {/* Custo (novo campo) */}
                              <div>
                                <Label>
                                  Custo (R$) - opcional
                                  <span className="text-xs text-gray-500 ml-2">💰 Para calcular lucro</span>
                                </Label>
                                <PriceInput
                                  value={item.cost || ''}
                                  onChange={(val) => updateItem(item.id, 'cost', val)}
                                  placeholder="Digite: 890 = R$ 8,90"
                                />
                                <p className="text-xs text-blue-600 mt-1">
                                  💡 Quanto custa fazer este produto? (ingredientes + embalagem)
                                </p>
                                {item.price && item.cost && parseFloat(item.cost) > 0 && (
                                  <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                                    <p className="text-xs font-semibold text-green-800">
                                      💰 Lucro: R$ {((parseFloat(item.price) - parseFloat(item.cost)) / 100).toFixed(2)} ({(((parseFloat(item.price) - parseFloat(item.cost)) / parseFloat(item.price)) * 100).toFixed(1)}%)
                                    </p>
                                  </div>
                                )}
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
                                  onChange={(e) => {
                                    const selectedCategoryId = e.target.value;
                                    const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
                                    
                                    console.log('🔄 Categoria selecionada:');
                                    console.log('   - ID:', selectedCategoryId);
                                    console.log('   - Nome:', selectedCategory?.name);
                                    
                                    // Atualizar ambos os campos em uma única operação
                                    setItems(items.map(i => 
                                      i.id === item.id 
                                        ? { 
                                            ...i, 
                                            categoryId: selectedCategoryId,
                                            categoryName: selectedCategory?.name || ''
                                          }
                                        : i
                                    ));
                                  }}
                                >
                                  <option value="">Selecione...</option>
                                  {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                      {cat.icon} {cat.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Imagem - PREVIEW MELHORADO */}
                              <div>
                                <Label>Imagem (opcional)</Label>
                                {item.imagePreview ? (
                                  <div className="relative border-2 border-green-500 rounded-lg overflow-hidden mt-2">
                                    <img 
                                      src={item.imagePreview} 
                                      alt="Preview" 
                                      className="w-full h-32 object-cover"
                                    />
                                    <div className="absolute top-0 left-0 bg-green-500 text-white px-2 py-1 text-xs font-bold">
                                      ✓ ANEXADA
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateItem(item.id, 'image', null);
                                        updateItem(item.id, 'imagePreview', '');
                                      }}
                                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-400 transition-colors cursor-pointer">
                                    <label className="cursor-pointer block">
                                      <span className="text-sm text-blue-600 hover:text-blue-700">📸 Escolher imagem</span>
                                      <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(item.id, e)}
                                        className="hidden"
                                      />
                                    </label>
                                  </div>
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

                            {/* Customizações - NOVO SISTEMA */}
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
                                      onClick={() => window.open('/admin/customization', '_blank')}
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
                            {false && item.hasCustomizations && (
                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl p-5 mb-4">
                                  <div className="flex items-center justify-between mb-4">
                                    <div>
                                      <h4 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                                        <span className="text-2xl">✨</span>
                                        Grupos de Personalização
                                      </h4>
                                      <p className="text-xs text-purple-600 mt-1">Configure sabores, bordas, tamanhos, extras, etc.</p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        onClick={() => applyQuickSuggestions(item.id)}
                                        className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold shadow-lg"
                                        size="sm"
                                      >
                                        <span className="mr-2">⚡</span>
                                        Sugestões Rápidas
                                      </Button>
                                      <Button
                                        type="button"
                                        onClick={() => addCustomizationGroup(item.id)}
                                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md"
                                        size="sm"
                                      >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Criar Grupo
                                      </Button>
                                    </div>
                                  </div>

                                  {item.customizationGroups.length === 0 && (
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

                                  {item.customizationGroups.map((group) => (
                                    <div key={group.id} className="bg-white border-2 border-purple-100 rounded-lg p-4 mb-3">
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 space-y-3">
                                          {/* Nome do Grupo */}
                                          <div>
                                            <Label className="text-sm font-bold text-purple-900">📝 Nome do Grupo *</Label>
                                            <Input
                                              placeholder="Ex: Escolha o sabor da Pizza Salgada G, Bordas Irresistíveis"
                                              value={group.name}
                                              onChange={(e) => updateGroupField(item.id, group.id, 'name', e.target.value)}
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
                                                    updateGroupField(item.id, group.id, 'isRequired', e.target.checked);
                                                    if (e.target.checked && group.minSelections === 0) {
                                                      updateGroupField(item.id, group.id, 'minSelections', 1);
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
                                                  onChange={(e) => updateGroupField(item.id, group.id, 'maxSelections', parseInt(e.target.value) || 1)}
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
                                                    optionName: e.target.value,
                                                    optionPrice: tempGroupInputs[group.id]?.optionPrice || '0.00'
                                                  }
                                                })}
                                                onKeyPress={(e) => {
                                                  if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addOptionToGroup(
                                                      item.id,
                                                      group.id,
                                                      tempGroupInputs[group.id]?.optionName || '',
                                                      tempGroupInputs[group.id]?.optionPrice || '0.00'
                                                    );
                                                  }
                                                }}
                                                className="flex-1"
                                              />
                                              <PriceInput
                                                value={tempGroupInputs[group.id]?.optionPrice || '0.00'}
                                                onChange={(val) => setTempGroupInputs({
                                                  ...tempGroupInputs,
                                                  [group.id]: {
                                                    optionName: tempGroupInputs[group.id]?.optionName || '',
                                                    optionPrice: val
                                                  }
                                                })}
                                                placeholder="Preço"
                                                className="w-32"
                                              />
                                              <Button
                                                type="button"
                                                onClick={() => addOptionToGroup(
                                                  item.id,
                                                  group.id,
                                                  tempGroupInputs[group.id]?.optionName || '',
                                                  tempGroupInputs[group.id]?.optionPrice || '0.00'
                                                )}
                                                className="bg-green-500 hover:bg-green-600"
                                                size="sm"
                                              >
                                                <Plus className="w-4 h-4" />
                                              </Button>
                                            </div>
                                            {!item.price || parseFloat(item.price) === 0 ? (
                                              <p className="text-xs text-orange-600 mt-1 font-semibold">
                                                🎯 Produto sem preço base: O preço da opção será o preço final do produto
                                              </p>
                                            ) : (
                                              <p className="text-xs text-gray-500 mt-1">
                                                💰 Use 0 se não tiver custo adicional. Ex: Calabresa (R$ 0), Bacon (+R$ 3)
                                              </p>
                                            )}

                                            {/* Lista de Opções */}
                                            {group.options.length > 0 && (
                                              <div className="mt-3 space-y-2">
                                                <Label className="text-sm font-bold text-purple-900">✅ Opções ({group.options.length}):</Label>
                                                {group.options.map((option) => (
                                                  <div
                                                    key={option.id}
                                                    className="flex items-center justify-between bg-gray-50 p-2 rounded border"
                                                  >
                                                    <span className="text-sm font-semibold">
                                                      {option.name}
                                                      {parseFloat(option.price) > 0 && (
                                                        <span className={!item.price || parseFloat(item.price) === 0 ? "text-blue-600 ml-2" : "text-green-600 ml-2"}>
                                                          {!item.price || parseFloat(item.price) === 0 
                                                            ? `R$ ${parseFloat(option.price).toFixed(2)}`
                                                            : `+R$ ${parseFloat(option.price).toFixed(2)}`}
                                                        </span>
                                                      )}
                                                      {parseFloat(option.price) === 0 && (
                                                        <span className="text-gray-400 ml-2 text-xs">
                                                          {!item.price || parseFloat(item.price) === 0 ? '(sem preço)' : '(grátis)'}
                                                        </span>
                                                      )}
                                                    </span>
                                                    <button
                                                      type="button"
                                                      onClick={() => removeOptionFromGroup(item.id, group.id, option.id)}
                                                      className="text-red-500 hover:text-red-700"
                                                    >
                                                      <X className="w-4 h-4" />
                                                    </button>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (confirm('Tem certeza que deseja remover este grupo?')) {
                                              removeCustomizationGroup(item.id, group.id);
                                            }
                                          }}
                                          className="ml-3 text-red-500 hover:text-red-700"
                                          title="Remover grupo"
                                        >
                                          <X className="w-5 h-5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                            )}
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
