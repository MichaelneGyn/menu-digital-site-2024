import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Como Criar um Cardápio Digital em 5 Minutos | Guia Completo 2025',
  description: 'Aprenda passo a passo como criar seu cardápio digital profissional de forma rápida e fácil. Tutorial completo com imagens e vídeos. Comece agora!',
  keywords: 'como criar cardápio digital, cardápio digital passo a passo, tutorial cardápio digital, criar menu online, cardápio digital grátis',
  openGraph: {
    title: 'Como Criar um Cardápio Digital em 5 Minutos | Guia Completo',
    description: 'Tutorial completo: aprenda a criar seu cardápio digital profissional em apenas 5 minutos, sem precisar de conhecimentos técnicos.',
    type: 'article',
    publishedTime: '2025-01-15T10:00:00Z',
    authors: ['Virtual Cardápio'],
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Como Criar um Cardápio Digital em 5 Minutos',
  description: 'Aprenda passo a passo como criar seu cardápio digital profissional de forma rápida e fácil, sem precisar de conhecimentos técnicos.',
  image: 'https://virtualcardapio.com.br/blog/como-criar-cardapio-digital.jpg',
  datePublished: '2025-01-15T10:00:00Z',
  dateModified: '2025-01-15T10:00:00Z',
  author: {
    '@type': 'Organization',
    name: 'Virtual Cardápio',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Virtual Cardápio',
    logo: {
      '@type': 'ImageObject',
      url: 'https://virtualcardapio.com.br/logo.png',
    },
  },
};

export default function BlogPost() {
  return (
    <>
      <JsonLd data={articleSchema} />
      
      <div className="min-h-screen bg-white">
        <LandingHeader />
        
        <article className="container mx-auto px-4 py-16 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-gray-600">
            <Link href="/" className="hover:text-red-600">Início</Link>
            {' > '}
            <Link href="/blog" className="hover:text-red-600">Blog</Link>
            {' > '}
            <span className="text-gray-900">Como Criar um Cardápio Digital</span>
          </nav>

          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                Tutorial
              </span>
              <time dateTime="2025-01-15">15 de Janeiro de 2025</time>
              <span>• 5 min de leitura</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Como Criar um Cardápio Digital em 5 Minutos
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Aprenda passo a passo como criar seu cardápio digital profissional de forma rápida e fácil, sem precisar de conhecimentos técnicos. Comece a vender mais hoje!
            </p>
          </header>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold mt-12 mb-6">📱 Por Que Ter um Cardápio Digital?</h2>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              O cardápio digital revolucionou a forma como restaurantes atendem seus clientes. Com a pandemia, essa tecnologia se tornou essencial, e hoje é uma ferramenta indispensável para qualquer estabelecimento que quer se destacar.
            </p>

            <div className="bg-green-50 border-l-4 border-green-500 p-6 my-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="text-green-600" />
                Benefícios do Cardápio Digital:
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Economia:</strong> Não precisa imprimir cardápios físicos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Atualização instantânea:</strong> Mude preços e produtos em segundos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Higiene:</strong> Sem contato físico, mais segurança</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Pedidos online:</strong> Clientes pedem direto pelo celular</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Relatórios:</strong> Veja quais produtos vendem mais</span>
                </li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-6">🚀 Passo a Passo: Criando Seu Cardápio Digital</h2>

            <h3 className="text-2xl font-bold mt-8 mb-4">Passo 1: Cadastre-se Gratuitamente</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Acesse <Link href="/auth/register" className="text-red-600 font-semibold hover:underline">virtualcardapio.com.br</Link> e crie sua conta em menos de 1 minuto. É 100% grátis para testar por 30 dias!
            </p>

            <h3 className="text-2xl font-bold mt-8 mb-4">Passo 2: Configure Seu Restaurante</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Adicione o nome do seu restaurante, endereço, horário de funcionamento e suas redes sociais. Isso leva apenas 2 minutos!
            </p>

            <h3 className="text-2xl font-bold mt-8 mb-4">Passo 3: Crie as Categorias</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Organize seu cardápio em categorias como: Entradas, Pratos Principais, Bebidas, Sobremesas, etc. Isso facilita a navegação dos clientes.
            </p>

            <h3 className="text-2xl font-bold mt-8 mb-4">Passo 4: Adicione Seus Produtos</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para cada produto, adicione:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Nome do produto</li>
              <li>Descrição atraente</li>
              <li>Preço</li>
              <li>Foto (opcional, mas recomendado!)</li>
              <li>Custo (para calcular seu lucro)</li>
            </ul>

            <h3 className="text-2xl font-bold mt-8 mb-4">Passo 5: Gere Seu QR Code</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Pronto! Seu cardápio está no ar. Agora é só gerar o QR Code e imprimir nas mesas. Seus clientes escaneiam e veem o cardápio completo no celular!
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-8">
              <h3 className="text-xl font-bold mb-3">💡 Dica de Ouro:</h3>
              <p className="text-gray-700">
                Use fotos de alta qualidade nos seus produtos! Cardápios com fotos vendem até <strong>30% mais</strong> do que cardápios sem imagens.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-6">📊 Recursos Avançados</h2>

            <p className="text-gray-700 leading-relaxed mb-4">
              Além do cardápio básico, o Virtual Cardápio oferece recursos profissionais:
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <strong className="text-lg">Cálculo de Lucro (CMV):</strong>
                  <p className="text-gray-700">Cadastre o custo de cada produto e veja sua margem de lucro em tempo real.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <strong className="text-lg">Sistema de Upsell:</strong>
                  <p className="text-gray-700">Sugira produtos complementares e aumente o ticket médio.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">🎫</span>
                <div>
                  <strong className="text-lg">Cupons de Desconto:</strong>
                  <p className="text-gray-700">Crie promoções e atraia mais clientes.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <strong className="text-lg">Relatórios Detalhados:</strong>
                  <p className="text-gray-700">Veja quais produtos vendem mais, horários de pico e muito mais.</p>
                </div>
              </li>
            </ul>

            <h2 className="text-3xl font-bold mt-12 mb-6">❓ Perguntas Frequentes</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Preciso de conhecimentos técnicos?</h3>
                <p className="text-gray-700">Não! O sistema é super intuitivo. Se você sabe usar WhatsApp, consegue criar seu cardápio digital.</p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">Quanto custa?</h3>
                <p className="text-gray-700">Teste grátis por 30 dias. Depois, planos R$ 69,90/mês com todos os recursos.</p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">Funciona em qualquer celular?</h3>
                <p className="text-gray-700">Sim! Funciona em iPhone, Android e qualquer navegador moderno.</p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">Posso mudar os preços a qualquer momento?</h3>
                <p className="text-gray-700">Sim! Você pode atualizar preços, adicionar ou remover produtos instantaneamente.</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-8 my-12 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">
                Pronto Para Criar Seu Cardápio Digital?
              </h2>
              <p className="text-xl mb-6 opacity-90">
                Comece agora e tenha seu cardápio no ar em 5 minutos!
              </p>
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100">
                  Criar Meu Cardápio Grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-6">📚 Leia Também:</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/blog/aumentar-vendas-restaurante" className="p-4 border rounded-lg hover:shadow-lg transition-shadow">
                <h3 className="font-bold mb-2">📈 10 Dicas Para Aumentar Vendas</h3>
                <p className="text-sm text-gray-600">Estratégias comprovadas para faturar mais</p>
              </Link>
              
              <Link href="/blog/calcular-cmv-restaurante" className="p-4 border rounded-lg hover:shadow-lg transition-shadow">
                <h3 className="font-bold mb-2">💰 Como Calcular o CMV</h3>
                <p className="text-sm text-gray-600">Aumente seu lucro calculando custos corretamente</p>
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t flex justify-between">
            <Link href="/blog">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para o Blog
              </Button>
            </Link>
            
            <Link href="/auth/register">
              <Button className="bg-red-600 hover:bg-red-700">
                Começar Agora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </article>

        <LandingFooter />
      </div>
    </>
  );
}
