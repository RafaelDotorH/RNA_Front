"use client"
import React, { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Importa useRouter

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Estado de carga
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
          const storedUser = localStorage.getItem('user');
          if(storedUser){
            setUser(JSON.parse(storedUser)) // Establece el usuario desde localStorage
          }
            // Idealmente: Aquí también validarías el token con tu backend
        }
        setLoading(false); // Establece loading a false después de verificar
    }, []);


    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:8000/api/login/', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Error al iniciar sesión");
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            router.push('/profile'); //O a la pagina que quieras que vaya luego del login
            return { success: true };
        } catch (error) {
            console.error("Error de inicio de sesión:", error);
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');  // Elimina el token
        localStorage.removeItem('user');
        setUser(null);               // Limpia el estado del usuario
        // La redirección la maneja el LogoutButton, no aqui.
    };

    if (loading) {
        return <div>Cargando...</div>; // Muestra un indicador mientras carga
    }


    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};