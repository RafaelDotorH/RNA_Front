"use client";
import { AuthProvider, useAuth } from './lib/authContext';
import './globals.css';
import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { preload } from 'react-dom';

const inter = Inter({ subsets: ['latin'] });

function ThemeApplicator({ children }: { children: React.ReactNode }) { // este componente se encarga de aplicar el tema de la aplicacion
  const { appTheme, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

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
    setIsClient(true); // Aseguramos que el código se ejecute solo en el cliente
  }, []);

  const loadingRoutes = ["/menu", "/principal", "/nosotros", "/biblioteca"]; // Rutas que deben mostrar el loading
  if (loading && isClient && loadingRoutes.includes(pathname)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'auto', backgroundColor: '#f0f0f0' }}>
      </div>
    );
  }

  return <>{children}</>; // Renderiza los hijos si no está cargando o si no está en una ruta de carga
}

export default function RootLayout({ children }: { children: React.ReactNode }) { // Este es el layout principal de la aplicacion
  preload('https://img.freepik.com/vector-gratis/fondo-monocromatico-blanco-estilo-papel_23-2148997884.jpg?t=st=1741737122~exp=1741740722~hmac=2dcf587cfefc605cbdd3dba8373d00f67e505cbeec7461459c2a081904c24fbb&w=1060', { as: 'image' }); // Preload de la imagen de fondo para mejorar el rendimiento
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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