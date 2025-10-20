'use client';

import Link from 'next/link';

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Sobre */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🍽️</span>
              <div>
                <h3 className="text-white font-bold text-lg">Virtual Cardápio</h3>
                <p className="text-xs text-gray-400">Plataforma de Pedidos</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Seu próprio sistema de delivery e gestão, sem comissão. 
              Como o iFood, mas 100% seu.
            </p>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="text-white font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-orange-500 transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="#planos" className="hover:text-orange-500 transition-colors">
                  Planos e Preços
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-orange-500 transition-colors">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-orange-500 transition-colors">
                  Cases de Sucesso
                </Link>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h4 className="text-white font-semibold mb-4">Suporte</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#contato" className="hover:text-orange-500 transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-orange-500 transition-colors">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-orange-500 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-orange-500 transition-colors">
                  Tutoriais
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span>📧</span>
                <a 
                  href="mailto:virtualcardapio@gmail.com" 
                  className="hover:text-orange-500 transition-colors break-all"
                >
                  virtualcardapio@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span>📱</span>
                <a 
                  href="https://wa.me/5562981105064" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-orange-500 transition-colors"
                >
                  (62) 98110-5064
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span>⏰</span>
                <span>Seg - Sex: 9h às 18h</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} <span className="text-white font-semibold">Virtual Cardápio</span>. 
              Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="#" className="hover:text-orange-500 transition-colors">
                Termos de Uso
              </Link>
              <Link href="#" className="hover:text-orange-500 transition-colors">
                Privacidade
              </Link>
              <Link href="#" className="hover:text-orange-500 transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg px-4 py-2">
            <p className="text-xs text-gray-400">
              🚀 <span className="text-white font-semibold">Desenvolvido com tecnologia de ponta</span> • 
              Next.js + Vercel + Supabase
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
