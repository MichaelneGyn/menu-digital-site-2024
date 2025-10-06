
'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './theme-provider';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';

export default function Providers({ 
  children, 
  session 
}: { 
  children: React.ReactNode;
  session: any;
}) {
  // Sempre envolva com SessionProvider para que useSession funcione durante hidratação

  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </ThemeProvider>
    </SessionProvider>
  );
}
