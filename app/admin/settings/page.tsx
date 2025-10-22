'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';
import { Upload, Save, ImageIcon, AlertTriangle, ArrowLeft } from 'lucide-react';
import { withSubscriptionCheck } from '@/components/withSubscriptionCheck';
import Link from 'next/link';

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
};

function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    primaryColor: '#d32f2f',
    secondaryColor: '#ffc107',
    whatsapp: '',
    email: '',
    address: '',
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

  const fetchRestaurant = async () => {
    try {
      const res = await fetch('/api/restaurant');
      if (!res.ok) throw new Error('Erro ao buscar restaurante');
      const data = await res.json();
      setRestaurant(data);
      
      setFormData({
        name: data.name || '',
        description: data.description || '',
        logo: data.logo || data.logoUrl || '',
        primaryColor: data.primaryColor || '#d32f2f',
        secondaryColor: data.secondaryColor || '#ffc107',
        whatsapp: data.whatsapp || '',
        email: data.email || '',
        address: data.address || '',
      });
      
      if (data.logo || data.logoUrl) {
        setLogoPreview(data.logo || data.logoUrl);
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
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

      if (!res.ok) throw new Error('Erro no upload');

      const { url } = await res.json();
      setFormData({ ...formData, logo: url });
      toast.dismiss();
      toast.success('Imagem carregada!');
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.dismiss();
      toast.error('Erro ao fazer upload. Por enquanto, use uma URL de imagem.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!restaurant?.id) {
        toast.error('Restaurante não encontrado');
        setSaving(false);
        return;
      }

      const res = await fetch('/api/restaurant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: restaurant.id, // ✅ ID obrigatório
          ...formData,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Erro da API:', errorData);
        throw new Error(errorData.error || 'Erro ao salvar');
      }

      toast.success('Configurações salvas com sucesso!');
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
            {/* Logo Upload */}
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
                      type="url"
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

            {/* Cores */}
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
                    type="text"
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
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="flex-1"
                  />
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
