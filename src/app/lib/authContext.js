'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, getAuth } from 'firebase/auth';
import { app } from '@/app/lib/firebasedb';
import { getThemeForRole } from '@/app/CSS/dynamicStyles';

const auth = getAuth(app);
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('default');
    const [theme, setTheme] = useState(getThemeForRole('default'));
    const [isLoadingRole, setIsLoadingRole] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
                setUserRole('default');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchUserRole = async () => {
            if (!user) {
                setIsLoadingRole(false);
                return;
            }
            setIsLoadingRole(true);
            try {
                const response = await fetch('/api/user/role');
                const data = await response.json();
                if (response.ok && data.role) {
                    setUserRole(data.role);
                } else {
                    setUserRole('cliente');
                }
            } catch (error) {
                setUserRole('cliente');
            } finally {
                setIsLoadingRole(false);
            }
        };
        fetchUserRole();
    }, [user]);

    useEffect(() => {
        setTheme(getThemeForRole(userRole));
    }, [userRole]);

    const logout = async () => {
         try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error("Error al llamar a /api/auth/logout en contexto", error);
        }
        setUser(null); 
        setTheme(getThemeForRole('default')); // Actualizar tema de la app
        sessionStorage.removeItem('rnaAppLandedOnMenu');
        setLoading(false);
    };

    const value = {
        user,
        loading: loading || isLoadingRole,
        logout,
        userRole,
        theme,
    };

    if (!theme) {
        return <div>Cargando tema...</div>;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};