'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Search, Youtube, Clock, ExternalLink } from 'lucide-react';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  videoId: string;
  duration: string;
  category: string;
  thumbnail?: string;
}

export default function TutoriaisPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace('/auth/login');
    }
  }, [session, status]);

  // Lista de tutoriais - VOCÊ VAI ATUALIZAR COM OS IDs DOS SEUS VÍDEOS
  const tutoriais: Tutorial[] = [
    {
      id: '1',
      title: 'Cadastro e Login',
      description: 'Aprenda a criar sua conta e fazer login no sistema',
      videoId: '2TQxA7n7zeQ',
      duration: '2:30',
      category: 'Primeiros Passos',
    },
    {
      id: '2',
      title: 'Configurações Iniciais',
      description: 'Configure seu restaurante e personalize o cardápio',
      videoId: '8M8HB1yTsxk',
      duration: '1:45',
      category: 'Primeiros Passos',
    },
    {
      id: '3',
      title: 'Criar Categoria',
      description: 'Como criar e organizar categorias no seu cardápio',
      videoId: 'dse3JUw8PeA',
      duration: '1:35',
      category: 'Cardápio',
    },
    {
      id: '4',
      title: 'Adicionar Item',
      description: 'Adicione produtos ao seu cardápio com fotos e preços',
      videoId: 'PRk7D8RCxsk',
      duration: '2:04',
      category: 'Cardápio',
    },
    {
      id: '5',
      title: 'Criar Cupom',
      description: 'Crie cupons de desconto para seus clientes',
      videoId: 'IidUPWRmPGs',
      duration: '2:05',
      category: 'Promoções',
    },
    {
      id: '6',
      title: 'Criar Upsell',
      description: 'Configure sugestões de produtos complementares',
      videoId: 'BDCTD4rL27s',
      duration: '2:07',
      category: 'Vendas',
    },
    {
      id: '7',
      title: 'Configurações Gerais',
      description: 'Ajuste todas as configurações do sistema',
      videoId: 'ooVsdCYZG-4',
      duration: '2:09',
      category: 'Configurações',
    },
    {
      id: '8',
      title: 'Painel de Comandas - Parte 1',
      description: 'Gerencie pedidos e comandas em tempo real',
      videoId: 'FMcAUP-MT4E',
      duration: '2:12',
      category: 'Pedidos',
    },
    {
      id: '9',
      title: 'Painel de Comandas - Parte 2',
      description: 'Funcionalidades avançadas do painel de comandas',
      videoId: 'ILQAPs2P2RM',
      duration: '2:15',
      category: 'Pedidos',
    },
    {
      id: '10',
      title: 'Gestão de Mesas',
      description: 'Organize e gerencie as mesas do seu restaurante',
      videoId: 'x6uxo6l7uIk',
      duration: '2:18',
      category: 'Pedidos',
    },
    {
      id: '11',
      title: 'Chamadas - Acionar Garçom',
      description: 'Sistema de chamadas para atendimento',
      videoId: 'PRk7D8RCxsk',
      duration: '2:21',
      category: 'Atendimento',
    },
  ];

  const categorias = ['todos', ...Array.from(new Set(tutoriais.map(t => t.category)))];

  const tutoriaisFiltrados = tutoriais.filter(tutorial => {
    const matchSearch = tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       tutorial.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'todos' || tutorial.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const [videoSelecionado, setVideoSelecionado] = useState<Tutorial | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Youtube className="w-8 h-8 text-red-600" />
                <h1 className="text-3xl font-bold text-gray-900">Tutoriais em Vídeo</h1>
              </div>
              <p className="text-gray-600">
                Aprenda a usar todas as funcionalidades do Menu Digital 🎓
              </p>
            </div>
            
            <Button
              onClick={() => window.open('https://www.youtube.com/@virtualcardapio', '_blank')}
              className="bg-red-600 hover:bg-red-700"
            >
              <Youtube className="w-4 h-4 mr-2" />
              Ver Canal Completo
            </Button>
          </div>
        </div>

        {/* Busca e Filtros */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar tutorial..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro por Categoria */}
              <div className="flex gap-2 flex-wrap">
                {categorias.map(cat => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className={selectedCategory === cat ? 'bg-red-600 hover:bg-red-700' : ''}
                  >
                    {cat === 'todos' ? '📚 Todos' : cat}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vídeo em Destaque */}
        {videoSelecionado && (
          <Card className="mb-6 border-2 border-red-200">
            <CardHeader className="bg-gradient-to-r from-red-50 to-purple-50">
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-red-600" />
                {videoSelecionado.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="aspect-video rounded-lg overflow-hidden mb-4">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoSelecionado.videoId}`}
                  title={videoSelecionado.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <p className="text-gray-600">{videoSelecionado.description}</p>
              <div className="flex items-center gap-4 mt-4">
                <Badge variant="outline">{videoSelecionado.category}</Badge>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {videoSelecionado.duration}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grid de Tutoriais */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutoriaisFiltrados.map(tutorial => (
            <Card
              key={tutorial.id}
              className="hover:shadow-xl transition-all cursor-pointer border-2 hover:border-red-200"
              onClick={() => setVideoSelecionado(tutorial)}
            >
              <CardHeader className="pb-3">
                <div className="aspect-video bg-gradient-to-br from-red-100 to-purple-100 rounded-lg mb-3 relative overflow-hidden group">
                  {/* Thumbnail do YouTube */}
                  <img
                    src={`https://img.youtube.com/vi/${tutorial.videoId}/maxresdefault.jpg`}
                    alt={tutorial.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback se a thumbnail não carregar
                      e.currentTarget.src = `https://img.youtube.com/vi/${tutorial.videoId}/hqdefault.jpg`;
                    }}
                  />
                  
                  {/* Overlay com Play */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-red-600 rounded-full p-4">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>

                  {/* Badge de Duração */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {tutorial.duration}
                  </div>
                </div>

                <CardTitle className="text-lg line-clamp-2">{tutorial.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {tutorial.description}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {tutorial.category}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://www.youtube.com/watch?v=${tutorial.videoId}`, '_blank');
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    YouTube
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mensagem se não encontrar */}
        {tutoriaisFiltrados.length === 0 && (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">Nenhum tutorial encontrado</h3>
            <p className="text-gray-600">
              Tente buscar por outro termo ou selecione outra categoria
            </p>
          </Card>
        )}

        {/* Footer */}
        <Card className="mt-8 border-2 border-purple-100">
          <CardContent className="p-6 text-center">
            <Youtube className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-2">Inscreva-se no nosso canal!</h3>
            <p className="text-gray-600 mb-4">
              Receba notificações de novos tutoriais e atualizações do sistema
            </p>
            <Button
              onClick={() => window.open('https://www.youtube.com/@virtualcardapio?sub_confirmation=1', '_blank')}
              className="bg-red-600 hover:bg-red-700"
            >
              <Youtube className="w-4 h-4 mr-2" />
              Inscrever-se Agora
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
