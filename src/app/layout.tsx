"use client";
import { AuthProvider, useAuth } from './lib/authContext';
import './globals.css';
import { Inter } from 'next/font/google';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

function ThemeApplicator({ children }: { children: React.ReactNode }) {
  const { appTheme, loading } = useAuth();

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

  if (loading && typeof window !== 'undefined' && ["/menu", "/principal", "/nosotros", "/biblioteca"].includes(window.location.pathname)) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0' }}>
          Cargando aplicación...
        </div>
      );
  }

  return <>{children}</>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head></head>
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