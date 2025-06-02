"use client"
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getThemeForRole } from '../CSS/dynamicStyles';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [appTheme, setAppTheme] = useState(getThemeForRole('default')); // Renombrado a appTheme
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const verifySession = async () => {
            try {
                const response = await fetch('/api/user/role');
                if (response.ok) {
                    const data = await response.json();
                    if (data.exists && data.role) {
                        const currentUser = { email: data.email, role: data.role };
                        setUser(currentUser);
                        setIsAuthenticated(true);
                        setAppTheme(getThemeForRole(data.role)); // Establecer tema de la app
                    } else {
                        setUser(null);
                        setIsAuthenticated(false);
                        setAppTheme(getThemeForRole('default'));
                    }
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                    setAppTheme(getThemeForRole('default'));
                }
            } catch (error) {
                printf("Error al verificar la sesión del usuario:", error);
                setUser(null);
                setIsAuthenticated(false);
                setAppTheme(getThemeForRole('default'));
            } finally {
                setLoading(false);
            }
        };
        verifySession();
    }, []);

    useEffect(() => {
        if (user && user.role) {
            setAppTheme(getThemeForRole(user.role));
        } else {
            setAppTheme(getThemeForRole('default'));
        }
    }, [user]);

    useEffect(() => {
        if (typeof window !== 'undefined' && !loading) {
            const isAppLandedOnMenu = sessionStorage.getItem('rnaAppLandedOnMenu') === 'true';
            const isNavigationTargetPage = ["/principal", "/nosotros", "/biblioteca"].includes(pathname);
            const isMenuPage = pathname === "/menu";
            const isLoginPage = pathname === '/' || pathname === '/login';

            if (isMenuPage) {
                sessionStorage.setItem('rnaAppLandedOnMenu', 'true');
            } else if (isNavigationTargetPage && !isAppLandedOnMenu) {
                 router.replace('/menu');
            }

            if (isLoginPage) {
                 sessionStorage.removeItem('rnaAppLandedOnMenu');
            }
        }
    }, [pathname, loading, router]);

    const loginContext = async (email, firebaseIdToken) => {
        setLoading(true);
        try {
            const apiResponse = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, idToken: firebaseIdToken }),
            });

            if (!apiResponse.ok) {
                const errorData = await apiResponse.json();
                setLoading(false);
                throw new Error(errorData.message || 'Error al iniciar sesión en API de login');
            }

            const userRoleResponse = await fetch('/api/user/role');
            if (userRoleResponse.ok) {
                const userData = await userRoleResponse.json();
                if (userData.exists && userData.role) {
                    const currentUser = { email: userData.email, role: userData.role };
                    setUser(currentUser);
                    setIsAuthenticated(true);
                    setAppTheme(getThemeForRole(currentUser.role)); // Actualizar tema de la app
                    sessionStorage.setItem('rnaAppLandedOnMenu', 'true');
                    router.push('/menu');
                    setLoading(false);
                    return { success: true };
                }
            }
            setIsAuthenticated(false); setLoading(false); throw new Error("No se pudo verificar la sesión del usuario después del login.");
        } catch (error) {
            setUser(null); setIsAuthenticated(false); setAppTheme(getThemeForRole('default')); setLoading(false);
            return { success: false, error: error.message };
        }
    };

    const logoutContext = async () => {
        setLoading(true);
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error("Error al llamar a /api/auth/logout en contexto", error);
        }
        setUser(null); setIsAuthenticated(false); setAppTheme(getThemeForRole('default')); // Actualizar tema de la app
        sessionStorage.removeItem('rnaAppLandedOnMenu');
        router.push('/');
        setLoading(false);
    };

    if (loading && ["/menu", "/principal", "/nosotros", "/biblioteca"].includes(pathname)) {
        return <div>Cargando aplicación...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loginContext, logoutContext, loading, appTheme }}>
            {children}
        </AuthContext.Provider>
    );
};