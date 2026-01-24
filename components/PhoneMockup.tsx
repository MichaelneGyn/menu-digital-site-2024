'use client';

import Image from 'next/image';

interface PhoneMockupProps {
  screenshot?: string;
  video?: string;
  alt: string;
  title?: string;
  description?: string;
  blurPersonalData?: boolean;
}

export default function PhoneMockup({ screenshot, video, alt, title, description, blurPersonalData = true }: PhoneMockupProps) {
  return (
    <div className="flex flex-col items-center">
      {/* iPhone Mockup */}
      <div className="relative w-[280px] h-[570px] bg-black rounded-[40px] shadow-2xl p-3 border-[8px] border-gray-800">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[140px] h-[25px] bg-black rounded-b-3xl z-10"></div>
        
        {/* Screen */}
        <div className="relative w-full h-full bg-white rounded-[32px] overflow-hidden">
          {video ? (
            <video
              src={video}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover object-top"
            />
          ) : screenshot ? (
            <Image
              src={screenshot}
              alt={alt}
              fill
              className="object-cover object-top"
              sizes="280px"
            />
          ) : null}
          
          {/* Blur overlay para dados pessoais */}
          {blurPersonalData && (
            <>
              {/* Blur no topo (onde geralmente ficam nomes, emails, telefones) */}
              <div className="absolute top-0 left-0 right-0 h-[80px] backdrop-blur-md bg-white/30 z-20"></div>
              
              {/* Blur em campos de formulário (meio da tela) */}
              <div className="absolute top-[35%] left-[10%] right-[10%] h-[120px] backdrop-blur-sm bg-white/20 rounded-lg z-20"></div>
              
              {/* Blur no rodapé (onde podem aparecer dados de contato) */}
              <div className="absolute bottom-0 left-0 right-0 h-[60px] backdrop-blur-md bg-white/30 z-20"></div>
            </>
          )}
        </div>
        
        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[120px] h-[4px] bg-gray-700 rounded-full"></div>
      </div>
      
      {/* Title & Description */}
      {(title || description) && (
        <div className="mt-6 text-center max-w-[280px]">
          {title && <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>}
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
      )}
    </div>
  );
}
