'use client';

import Script from 'next/script';

export default function GoogleTagManager() {
  const GTM_ID = 'AW-11137844448'; // Seu ID do Google Ads

  return (
    <>
      {/* Google Tag (gtag.js) - Script Principal */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GTM_ID}`}
        strategy="afterInteractive"
      />
      
      {/* Google Tag Manager - Configuração */}
      <Script
        id="gtm-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GTM_ID}');
          `,
        }}
      />
    </>
  );
}
