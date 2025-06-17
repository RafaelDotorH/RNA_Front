'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { app } from '@/app/lib/firebasedb';
import { getThemeForRole } from '@/app/CSS/dynamicStyles';

const auth = getAuth(app); // Inicializa Firebase Auth con la app de Firebase
const AuthContext = createContext(); // Crea el contexto de autenticación

export const useAuth = () => useContext(AuthContext); // Hook personalizado para acceder al contexto de autenticación|

export const AuthProvider = ({ children }) => { // Proveedor de contexto de autenticación
    const [user, setUser] = useState(null); // Estado para almacenar el usuario autenticado
    const [loading, setLoading] = useState(true); // Estado para manejar la carga de autenticación
    const [userRole, setUserRole] = useState('default'); // Estado para almacenar el rol del usuario
    const [theme, setTheme] = useState(getThemeForRole('default')); // Estado para almacenar el tema de la aplicación
    const [isLoadingRole, setIsLoadingRole] = useState(true); // Estado para manejar la carga del rol del usuario

    useEffect(() => { // Efecto para manejar el estado de autenticación del usuario
        const unsubscribe = onAuthStateChanged(auth, (user) => { // Escucha los cambios en el estado de autenticación
            if (user) {
                setUser(user);
            } else {
                setUser(null);
                setUserRole('default');
            }
            setLoading(false);
        });
        return () => unsubscribe(); // Limpia el listener al desmontar el componente
    }, []);

    useEffect(() => { // Efecto para obtener el rol del usuario autenticado
        const fetchUserRole = async () => {
            if (!user) {
                setIsLoadingRole(false);
                return;
            }
            setIsLoadingRole(true);
            try { // Realiza una solicitud a la API para obtener el rol del usuario
                const response = await fetch('/api/user/role');
                const data = await response.json();
                if (response.ok && data.role) {
                    setUserRole(data.role);
                } else {
                    setUserRole('cliente');
                }
            } catch (error) {
                console.error("Error al obtener el rol del usuario:", error);
                setUserRole('cliente');
            } finally {
                setIsLoadingRole(false);
            }
        };
        fetchUserRole();
    }, [user]);

    useEffect(() => { // Efecto para actualizar el tema de la aplicación basado en el rol del usuario
        setTheme(getThemeForRole(userRole));
    }, [userRole]);

    const logout = async () => { // Función para cerrar sesión del usuario
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

    const value = { // Valor del contexto de autenticación
        user,
        loading: loading || isLoadingRole,
        logout,
        userRole,
        theme,
    };

    if (!theme) { // Si el tema aún no está cargado, muestra un mensaje de carga
        return <div>Cargando tema...</div>;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};