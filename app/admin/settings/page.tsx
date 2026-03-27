'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PriceInput } from '@/components/PriceInput';
import toast from 'react-hot-toast';
import { Upload, Save, ImageIcon, ArrowLeft, Sparkles } from 'lucide-react';
import { withSubscriptionCheck } from '@/components/withSubscriptionCheck';
import Link from 'next/link';
import LogoGalleryFlat from '@/components/LogoGalleryFlat';
import { resolvePreferredImageSource } from '@/lib/utils';

type Restaurant = {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  slug: string;
  pixKey: string | null;
  deliveryFee: number | null;
  minOrderValue: number | null;
  openTime: string | null;
  closeTime: string | null;
  headerColor: string | null;
  headerTextColor: string | null;
  bannerUrl: string | null;
  bannerImage: string | null;
};

const MIN_BANNER_WIDTH = 1200;
const MIN_BANNER_HEIGHT = 375;
const IDEAL_BANNER_WIDTH = 1600;
const IDEAL_BANNER_HEIGHT = 500;

type BannerMeta = {
  width: number;
  height: number;
} | null;

function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerMeta, setBannerMeta] = useState<BannerMeta>(null);
  const [showLogoGallery, setShowLogoGallery] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    bannerUrl: '', // Adicionar campo bannerUrl ao estado inicial
    primaryColor: '#d32f2f',
    secondaryColor: '#ffc107',
    headerColor: '#6b7280', // Adicionar campo headerColor
    headerTextColor: '#ffffff', // Adicionar campo headerTextColor
    whatsapp: '',
    email: '',
    address: '',
    deliveryFee: '0.00',
    minOrderValue: '0.00',
    pixKey: '',
    openTime: '',
    closeTime: '',
  });

  // Verificar autenticação
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
      return;
    }
    
    fetchRestaurant();
  }, [session, status, router]);

  useEffect(() => {
    if (!bannerPreview) {
      setBannerMeta(null);
      return;
    }

    const image = new window.Image();
    image.onload = () => {
      setBannerMeta({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };
    image.onerror = () => {
      setBannerMeta(null);
    };
    image.src = bannerPreview;
  }, [bannerPreview]);

  const fetchRestaurant = async () => {
    try {
      const res = await fetch('/api/restaurant');
      if (!res.ok) throw new Error('Erro ao buscar restaurante');
      const data = await res.json();
      
      if (data) {
        setRestaurant(data);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          logo: resolvePreferredImageSource(data.logoUrl, data.logo),
          bannerUrl: resolvePreferredImageSource(data.bannerUrl, data.bannerImage),
          primaryColor: data.primaryColor || '#d32f2f',
          secondaryColor: data.secondaryColor || '#ffc107',
          headerColor: data.headerColor || '#6b7280', // Carregar headerColor
          headerTextColor: data.headerTextColor || '#ffffff', // Carregar headerTextColor
          whatsapp: data.whatsapp || '',
          email: data.email || '',
          address: data.address || '',
          pixKey: data.pixKey || '', // Carregar pixKey
          deliveryFee: typeof data.deliveryFee === 'number' ? data.deliveryFee.toFixed(2) : '0.00',
          minOrderValue: typeof data.minOrderValue === 'number' ? data.minOrderValue.toFixed(2) : '0.00',
          openTime: data.openTime || '',
          closeTime: data.closeTime || '',
        });
        
        if (data.logo || data.logoUrl) {
          setLogoPreview(resolvePreferredImageSource(data.logoUrl, data.logo));
        }
        if (data.bannerUrl || data.bannerImage) {
          setBannerPreview(resolvePreferredImageSource(data.bannerUrl, data.bannerImage));
        }
      } else {
        // No restaurant found - prepare for creation
        setRestaurant(null);
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const persistVisualIdentity = async (
    overrides: Partial<typeof formData>,
    loadingMessage: string,
    successMessage: string
  ) => {
    const nextFormData = { ...formData, ...overrides };
    setFormData(nextFormData);

    if (!restaurant?.id) {
      toast.success('Imagem carregada. Clique em "Salvar Configuracoes" para aplicar.');
      return;
    }

    const toastId = 'visual-identity-save';

    try {
      toast.loading(loadingMessage, { id: toastId });

      const res = await fetch('/api/restaurant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: restaurant.id,
          ...nextFormData,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Erro ao salvar imagem');
      }

      const savedData = await res.json();
      setRestaurant(savedData);

      try {
        if (savedData.slug) {
          await fetch(`/api/revalidate?path=/${savedData.slug}`, { method: 'POST' });
        }
      } catch (e) {
        console.warn('Falha na revalidacao automatica');
      }

      toast.success(successMessage, { id: toastId });
    } catch (error: any) {
      console.error('Erro ao persistir identidade visual:', error);
      toast.error(error.message || 'Erro ao salvar imagem', { id: toastId });
    }
  };

  const validateBannerDimensions = async (file: File) => {
    const objectUrl = URL.createObjectURL(file);

    try {
      const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        const image = new window.Image();
        image.onload = () => {
          resolve({
            width: image.naturalWidth,
            height: image.naturalHeight,
          });
        };
        image.onerror = () => reject(new Error('Nao foi possivel ler a imagem'));
        image.src = objectUrl;
      });

      if (dimensions.width < MIN_BANNER_WIDTH || dimensions.height < MIN_BANNER_HEIGHT) {
        throw new Error(
          `A capa precisa ter no minimo ${MIN_BANNER_WIDTH}x${MIN_BANNER_HEIGHT}px. A sua imagem tem ${dimensions.width}x${dimensions.height}px.`
        );
      }

      setBannerMeta(dimensions);
      return dimensions;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 5MB');
      return;
    }

    try {
      await validateBannerDimensions(file);
    } catch (error: any) {
      toast.error(error.message || 'A imagem da capa nao atende o tamanho minimo.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      toast.loading('Fazendo upload do banner...');
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro no upload');
      }

      const data = await res.json();
      const imageUrl = data.image_url || data.url;
      
      if (!imageUrl) throw new Error('URL da imagem não retornada');
      
      setBannerPreview(imageUrl);
      toast.dismiss();
      await persistVisualIdentity(
        { bannerUrl: imageUrl },
        'Salvando banner...',
        'Banner salvo com sucesso!'
      );
      toast.success('✅ Banner carregado!');
    } catch (error: any) {
      console.error('❌ Erro no upload:', error);
      toast.dismiss();
      toast.error(error.message || 'Erro ao fazer upload');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 5MB');
      return;
    }

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload para servidor (implementar endpoint)
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      toast.loading('Fazendo upload da imagem...');
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro no upload');
      }

      const data = await res.json();
      const imageUrl = data.image_url || data.url; // API retorna image_url
      
      console.log('✅ Upload response:', data);
      console.log('✅ Image URL:', imageUrl);
      
      if (!imageUrl) {
        throw new Error('URL da imagem não retornada pela API');
      }
      
      setFormData(prev => ({ ...prev, logo: imageUrl }));
      setLogoPreview(imageUrl);
      toast.dismiss();
      await persistVisualIdentity(
        { logo: imageUrl },
        'Salvando logo...',
        'Logo salvo com sucesso!'
      );
      toast.success('✅ Imagem carregada! Não esqueça de clicar em "Salvar Configurações"');
    } catch (error: any) {
      console.error('❌ Erro no upload:', error);
      toast.dismiss();
      toast.error(error.message || 'Erro ao fazer upload. Tente usar uma URL de imagem.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = '/api/restaurant';
      const method = restaurant?.id ? 'PUT' : 'POST';
      
      const body = {
        ...(restaurant?.id ? { id: restaurant.id } : {}),
        ...formData,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Erro ao salvar');
      }

      const savedData = await res.json();
      setRestaurant(savedData); // Update local state with new/updated restaurant
      toast.success(restaurant?.id ? '✅ Configurações salvas!' : '✅ Restaurante criado com sucesso!');
      
      try {
        if (savedData.slug) {
           await fetch(`/api/revalidate?path=/${savedData.slug}`, { method: 'POST' });
        }
      } catch (e) {
        console.warn('Falha na revalidação automática');
      }
      
      // Refresh data to be sure
      fetchRestaurant();
    } catch (error: any) {
      console.error('Erro:', error);
      toast.error(error.message || 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Botão Voltar */}
      <div className="mb-6">
        <Link href="/admin/dashboard">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold">Configurações do Restaurante</h1>
        <p className="text-gray-600">
          Personalize a aparência do seu cardápio digital
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo e Identidade Visual */}
        <Card>
          <CardHeader>
            <CardTitle>Logo e Identidade Visual</CardTitle>
            <CardDescription>
              Faça upload do logo e defina o slogan do seu restaurante
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Toggle entre Galeria e Upload */}
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                variant={showLogoGallery ? "default" : "outline"}
                size="sm"
                onClick={() => setShowLogoGallery(true)}
                className="flex-1"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Galeria de Logos
              </Button>
              <Button
                type="button"
                variant={!showLogoGallery ? "default" : "outline"}
                size="sm"
                onClick={() => setShowLogoGallery(false)}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Personalizado
              </Button>
            </div>

            {/* Galeria de Logos Profissionais */}
            {showLogoGallery ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gradient-to-br from-gray-50 to-white">
                <LogoGalleryFlat
                  onSelectLogo={(logoSvg: string, logoName: string) => {
                    // Converter SVG para data URL (usando encodeURIComponent para caracteres especiais)
                    const encodedSvg = encodeURIComponent(logoSvg);
                    const dataUrl = `data:image/svg+xml,${encodedSvg}`;
                    
                    console.log('💾 Salvando logo:', logoName);
                    console.log('📊 Data URL length:', dataUrl.length);
                    console.log('🔗 Data URL preview:', dataUrl.substring(0, 150) + '...');
                    
                    setFormData({ ...formData, logo: dataUrl });
                    setLogoPreview(dataUrl);
                    toast.success(`✅ Logo "${logoName}" selecionado! Clique em Salvar para aplicar.`);
                  }}
                  currentLogo={formData.logo}
                  primaryColor={formData.primaryColor}
                />
              </div>
            ) : (
              /* Upload Personalizado */
              <div>
                <Label htmlFor="logo">Logo do Restaurante</Label>
                <div className="mt-2 flex items-center gap-4">
                  {/* Preview do Logo */}
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>

                  {/* Botão Upload */}
                  <div className="flex-1">
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    <label htmlFor="logo-upload">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          Fazer Upload
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG ou SVG (máx 5MB)
                    </p>
                    
                    {/* Ou URL manual */}
                    <div className="mt-3">
                      <Label htmlFor="logoUrl" className="text-xs">Ou cole a URL da imagem:</Label>
                      <Input
                        id="logoUrl"
                        type="text"
                        placeholder="https://exemplo.com/logo.png"
                        value={formData.logo}
                        onChange={(e) => {
                          setFormData({ ...formData, logo: e.target.value });
                          setLogoPreview(e.target.value);
                        }}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Slogan/Descrição */}
            <div>
              <Label htmlFor="description">Slogan/Descrição</Label>
              <Input
                id="description"
                placeholder="Ex: Tradição e Sabor desde 1995"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                Aparece abaixo do nome no cardápio (máx 100 caracteres)
              </p>
            </div>

            {/* Banner/Capa */}
            <div>
              <Label htmlFor="bannerUrl">Imagem de Capa (Banner)</Label>
              <div className="mt-2 flex flex-col gap-4 lg:flex-row">
                 {/* Preview do Banner */}
                 <div className="w-full max-w-xl aspect-[16/5] border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden bg-gray-50 relative group">
                    {bannerPreview ? (
                      <>
                        <img 
                          src={bannerPreview} 
                          alt="Banner preview" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="absolute inset-x-[10%] top-[14%] bottom-[18%] rounded-lg border border-white/70">
                          <div className="absolute left-4 bottom-4 rounded-lg bg-white/90 px-3 py-2 shadow-sm">
                            <div className="mb-2 h-10 w-10 rounded-md bg-gray-200" />
                            <div className="mb-1 h-3 w-24 rounded bg-gray-300" />
                            <div className="h-2 w-16 rounded bg-gray-200" />
                          </div>
                          <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold text-gray-700 shadow-sm">
                            Status
                          </div>
                        </div>
                        <div className="absolute left-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-medium text-white">
                          Area segura
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-2">
                         <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                         <span className="text-[10px] text-gray-400">Sem banner</span>
                      </div>
                    )}
                 </div>

                 <div className="flex-1">
                    <input
                      type="file"
                      id="banner-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBannerUpload}
                    />
                    <label htmlFor="banner-upload">
                      <Button type="button" variant="outline" size="sm" asChild className="mb-2">
                        <span className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          Fazer Upload da Capa
                        </span>
                      </Button>
                    </label>

                    <div className="relative">
                      <Label htmlFor="bannerUrlInput" className="text-xs">Ou URL da imagem:</Label>
                      <Input
                        id="bannerUrlInput"
                        type="text"
                        placeholder="https://exemplo.com/banner.jpg"
                        value={formData.bannerUrl}
                        onChange={(e) => {
                          setFormData({ ...formData, bannerUrl: e.target.value });
                          setBannerPreview(e.target.value);
                        }}
                        className="mt-1"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Recomendado: 1200x300px (Use uma URL de imagem externa ou faça upload)
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Ideal: {IDEAL_BANNER_WIDTH}x{IDEAL_BANNER_HEIGHT}px. Minimo: {MIN_BANNER_WIDTH}x{MIN_BANNER_HEIGHT}px.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Use uma imagem horizontal e evite texto, logo ou promocao nas bordas e na faixa inferior.
                    </p>
                    {bannerMeta && (
                      <div className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
                        bannerMeta.width >= IDEAL_BANNER_WIDTH && bannerMeta.height >= IDEAL_BANNER_HEIGHT
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-amber-200 bg-amber-50 text-amber-700'
                      }`}>
                        Tamanho atual: {bannerMeta.width}x{bannerMeta.height}px.
                        {bannerMeta.width >= IDEAL_BANNER_WIDTH && bannerMeta.height >= IDEAL_BANNER_HEIGHT
                          ? ' Qualidade recomendada.'
                          : ' Funciona, mas para ficar mais nitida use uma arte maior.'}
                      </div>
                    )}
                 </div>
              </div>
            </div>

            {/* Cores */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cor Principal</Label>
                <div className="flex gap-2 mt-1">
                  <Input type="color" value={formData.primaryColor} onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })} className="w-12 p-1 h-10" />
                  <Input value={formData.primaryColor} onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Cor Secundária</Label>
                <div className="flex gap-2 mt-1">
                  <Input type="color" value={formData.secondaryColor} onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })} className="w-12 p-1 h-10" />
                  <Input value={formData.secondaryColor} onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Cor do Cabeçalho (Fundo)</Label>
                <div className="flex gap-2 mt-1">
                  <Input type="color" value={formData.headerColor} onChange={(e) => setFormData({ ...formData, headerColor: e.target.value })} className="w-12 p-1 h-10" />
                  <Input value={formData.headerColor} onChange={(e) => setFormData({ ...formData, headerColor: e.target.value })} />
                </div>
                <p className="text-xs text-gray-500 mt-1">Caso não tenha banner de capa</p>
              </div>
              <div>
                <Label>Cor do Texto (Cabeçalho)</Label>
                <div className="flex gap-2 mt-1">
                  <Input type="color" value={formData.headerTextColor} onChange={(e) => setFormData({ ...formData, headerTextColor: e.target.value })} className="w-12 p-1 h-10" />
                  <Input value={formData.headerTextColor} onChange={(e) => setFormData({ ...formData, headerTextColor: e.target.value })} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Restaurante</CardTitle>
            <CardDescription>
              Dados exibidos no cardápio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Restaurante</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                placeholder="(62) 99999-9999"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contato@restaurante.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="address">Endereço</Label>
              <Textarea
                id="address"
                placeholder="Rua, número, bairro, cidade"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pagamento e Entrega */}
        <Card>
          <CardHeader>
            <CardTitle>Pagamento e Entrega</CardTitle>
            <CardDescription>
              Configure o PIX e taxas de entrega
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input
                id="pixKey"
                placeholder="CPF, CNPJ, Email, Telefone ou Chave Aleatória"
                value={formData.pixKey}
                onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Esta chave será exibida para o cliente na hora do pagamento e usada para gerar o QR Code.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deliveryFee">Taxa de Entrega (R$)</Label>
                <PriceInput
                  value={formData.deliveryFee}
                  onChange={(value) => setFormData({ ...formData, deliveryFee: value })}
                  placeholder="Ex: 5,00"
                />
              </div>
              <div>
                <Label htmlFor="minOrderValue">Pedido Mínimo (R$)</Label>
                <PriceInput
                  value={formData.minOrderValue}
                  onChange={(value) => setFormData({ ...formData, minOrderValue: value })}
                  placeholder="Ex: 25,00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview da URL */}
        <Card>
          <CardHeader>
            <CardTitle>URL do Seu Cardápio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Seu cardápio está disponível em:</p>
              <p className="text-lg font-mono text-blue-600">
                virtualcardapio.com.br/<strong>{restaurant?.slug}</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => fetchRestaurant()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Exportar com proteção de autenticação e assinatura
export default withSubscriptionCheck(SettingsPage);
