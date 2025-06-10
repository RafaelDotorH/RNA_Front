"use client";
import { AuthProvider, useAuth } from './lib/authContext';
import './globals.css';
import { Inter } from 'next/font/google';
// 1. Importa useState y usePathname
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

function ThemeApplicator({ children }: { children: React.ReactNode }) {
  const { appTheme, loading } = useAuth();
  // 2. Agrega el estado para saber si estamos en el cliente
  const [isClient, setIsClient] = useState(false);
  // 3. Usa el hook para obtener la ruta de forma segura
  const pathname = usePathname();

  // Este useEffect es para aplicar el tema, está bien como lo tienes.
  useEffect(() => {
    if (!loading && appTheme) {
      document.body.style.backgroundColor = appTheme.appBackgroundColor;
      document.body.style.color = appTheme.appTextColor;
      document.documentElement.style.setProperty('--app-primary-color', appTheme.appPrimaryColor);
      document.documentElement.style.setProperty('--app-secondary-color', appTheme.appSecondaryColor);
      document.documentElement.style.setProperty('--app-button-bg-color', appTheme.buttonBackground);
      document.documentElement.style.setProperty('--app-button-text-color', appTheme.buttonText);
    }
  }, [appTheme, loading]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 5. Corrige la condición para que sea segura y consistente
  const loadingRoutes = ["/menu", "/principal", "/nosotros", "/biblioteca"];
  if (loading && isClient && loadingRoutes.includes(pathname)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'auto', backgroundColor: '#f0f0f0' }}>
      </div>
    );
  }

  return <>{children}</>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>ADONIS</title>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeApplicator>
            {children}
          </ThemeApplicator>
        </AuthProvider>
      </body>
    </html>
  );
}