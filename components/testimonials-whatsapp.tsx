'use client';

import { Check } from 'lucide-react';

const testimonials = [
  {
    name: "Pizzaria Bella Napoli",
    city: "São Paulo, SP",
    initial: "P",
    bgColor: "#e74c3c",
    message: "Melhor decisão que tomei! Antes pagava R$ 600/mês pro iFood. Agora pago só R$ 69,90 e o lucro é todo meu. Em 3 meses já economizei mais de R$ 1.500",
    time: "10:23",
    verified: true
  },
  {
    name: "Burguer House",
    city: "Rio de Janeiro, RJ",
    initial: "B",
    bgColor: "#f39c12",
    message: "Os clientes adoraram pedir direto pelo nosso cardápio. Sistema simples de usar e muito profissional. Recomendo!",
    time: "11:45",
    verified: true
  },
  {
    name: "Sushi Premium",
    city: "Curitiba, PR",
    initial: "S",
    bgColor: "#9b59b6",
    message: "Sistema excelente! Cardápio bonito e fácil de gerenciar. Sem comissão absurda. Já indiquei pra outros restaurantes aqui da região",
    time: "14:32",
    verified: true
  },
  {
    name: "Doceria Doce Sabor",
    city: "Belo Horizonte, MG",
    initial: "D",
    bgColor: "#e91e63",
    message: "Muito fácil de configurar. Em menos de 1 dia já estava recebendo pedidos. Suporte sempre disponível quando preciso",
    time: "16:18",
    verified: true
  },
  {
    name: "Lanchonete Point",
    city: "Salvador, BA",
    initial: "L",
    bgColor: "#3498db",
    message: "Agora tenho meu próprio sistema de delivery sem pagar comissão. Os pedidos caem direto no WhatsApp. Muito prático!",
    time: "13:27",
    verified: true
  }
];

export default function TestimonialsWhatsApp() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              O que nossos clientes dizem
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Restaurantes de todo Brasil já economizam com a nossa plataforma
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200"
            >
              {/* WhatsApp Header */}
              <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: '#128C7E' }}>
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: testimonial.bgColor }}
                >
                  {testimonial.initial}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">
                      {testimonial.name}
                    </h3>
                    {testimonial.verified && (
                      <div className="bg-white rounded-full p-0.5">
                        <Check className="w-3 h-3 text-blue-500" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-white opacity-80">{testimonial.city}</p>
                </div>
              </div>

              {/* Message Bubble */}
              <div className="p-4 bg-[#e5ddd5]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23e5ddd5\'/%3E%3Cpath d=\'M20 10h60v2H20zm0 20h60v2H20zm0 20h60v2H20zm0 20h60v2H20z\' fill=\'%23d1c7b8\' opacity=\'.1\'/%3E%3C/svg%3E")' }}>
                <div className="bg-white rounded-lg rounded-tl-none p-4 shadow-md relative">
                  {/* Message tail */}
                  <div className="absolute -left-2 top-0 w-0 h-0 border-t-[10px] border-t-white border-r-[10px] border-r-transparent"></div>
                  
                  <p className="text-gray-800 text-sm leading-relaxed mb-2">
                    {testimonial.message}
                  </p>
                  
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-xs text-gray-400">{testimonial.time}</span>
                    <Check className="w-3 h-3 text-blue-500" strokeWidth={3} />
                    <Check className="w-3 h-3 text-blue-500 -ml-2" strokeWidth={3} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-lg text-gray-700">
            <span className="font-bold text-red-600">Comece a economizar</span> com seu próprio sistema de pedidos
          </p>
        </div>
      </div>
    </section>
  );
}
