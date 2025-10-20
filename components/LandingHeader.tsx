'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">🍽️</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Virtual Cardápio</h1>
                <p className="text-xs text-gray-500 -mt-1">Plataforma de Pedidos</p>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection('planos')}
              className="text-gray-700 hover:text-orange-600 transition-colors font-medium"
            >
              Planos
            </button>
            <button
              onClick={() => scrollToSection('contato')}
              className="text-gray-700 hover:text-orange-600 transition-colors font-medium"
            >
              Contato
            </button>
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                🚀 Teste Grátis
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-3">
              <button
                onClick={() => scrollToSection('planos')}
                className="text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              >
                Planos
              </button>
              <button
                onClick={() => scrollToSection('contato')}
                className="text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              >
                Contato
              </button>
              <Link href="/auth/login" className="px-4">
                <Button variant="ghost" size="sm" className="w-full">
                  Entrar
                </Button>
              </Link>
              <Link href="/auth/login" className="px-4">
                <Button size="sm" className="w-full bg-gradient-to-r from-orange-500 to-red-500">
                  🚀 Teste Grátis
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
