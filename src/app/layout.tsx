"use client";
import { AuthProvider, useAuth } from './lib/authContext';
import './globals.css';
import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { Metadata } from "next";

const inter = Inter({ subsets: ['latin'] });

function ThemeApplicator({ children }: { children: React.ReactNode }) {
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
    setIsClient(true);
  }, []);

  const loadingRoutes = ["/menu", "/principal", "/nosotros", "/biblioteca"];
  if (loading && isClient && loadingRoutes.includes(pathname)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'auto', backgroundColor: '#f0f0f0' }}>
      </div>
    );
  }

  return <>{children}</>;
}

export const metadata: Metadata = {
  title: "Aplicacion web con RNA",
  description: "Aplicativo para redes neuronales artificiales para la identificacion de plantas medicinales",
};

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