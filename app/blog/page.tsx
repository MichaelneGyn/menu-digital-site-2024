'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';

const blogPosts = [
  {
    slug: 'como-criar-cardapio-digital',
    title: 'Como Criar um Cardápio Digital em 5 Minutos',
    excerpt: 'Aprenda passo a passo como criar seu cardápio digital profissional de forma rápida e fácil, sem precisar de conhecimentos técnicos.',
    date: '2025-01-15',
    readTime: '5 min',
    category: 'Tutorial',
    image: '📱',
  },
  {
    slug: 'aumentar-vendas-restaurante',
    title: '10 Dicas Para Aumentar as Vendas do Seu Restaurante',
    excerpt: 'Descubra estratégias comprovadas para aumentar o faturamento do seu restaurante usando tecnologia e marketing digital.',
    date: '2025-01-12',
    readTime: '8 min',
    category: 'Vendas',
    image: '📈',
  },
  {
    slug: 'qr-code-restaurante',
    title: 'QR Code no Restaurante: Guia Completo 2025',
    excerpt: 'Tudo o que você precisa saber sobre QR Code para restaurantes: como funciona, benefícios e como implementar no seu negócio.',
    date: '2025-01-10',
    readTime: '6 min',
    category: 'Tecnologia',
    image: '📲',
  },
  {
    slug: 'calcular-cmv-restaurante',
    title: 'Como Calcular o CMV do Seu Restaurante',
    excerpt: 'Entenda o que é CMV (Custo da Mercadoria Vendida), por que é importante e como calcular corretamente para aumentar seu lucro.',
    date: '2025-01-08',
    readTime: '7 min',
    category: 'Gestão',
    image: '💰',
  },
  {
    slug: 'cardapio-digital-vs-impresso',
    title: 'Cardápio Digital vs Impresso: Qual é Melhor?',
    excerpt: 'Compare as vantagens e desvantagens de cada tipo de cardápio e descubra qual é a melhor opção para o seu restaurante.',
    date: '2025-01-05',
    readTime: '5 min',
    category: 'Comparação',
    image: '🆚',
  },
  {
    slug: 'sistema-pedidos-online',
    title: 'Sistema de Pedidos Online: Vale a Pena?',
    excerpt: 'Descubra se vale a pena investir em um sistema de pedidos online e como ele pode transformar seu restaurante.',
    date: '2025-01-03',
    readTime: '6 min',
    category: 'Tecnologia',
    image: '🛒',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <LandingHeader />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            📚 Blog do Virtual Cardápio
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dicas, tutoriais e estratégias para aumentar as vendas do seu restaurante
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {blogPosts.map((post) => (
            <Card key={post.slug} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-6xl mb-4">{post.image}</div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.date).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readTime}
                  </div>
                </div>
                <CardTitle className="text-xl">{post.title}</CardTitle>
                <CardDescription>{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/blog/${post.slug}`}>
                  <Button variant="outline" className="w-full group">
                    Ler artigo
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para Transformar Seu Restaurante?
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Crie seu cardápio digital agora e comece a vender mais!
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100">
              Começar Teste Grátis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
