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
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
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
