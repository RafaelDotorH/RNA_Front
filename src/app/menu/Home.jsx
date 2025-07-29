"use client"
import React, { useEffect, useRef, useState, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import MenuNav from '../../Components/menuNav';
import Fooder from '../../Components/fooder';

gsap.registerPlugin(ScrollTrigger); // Registra el plugin ScrollTrigger

const VistaCliente = () => ( // Componente para la vista del cliente
    <>
        <section data-bgcolor="#778c43" data-textcolor="#000000" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', paddingBottom: '50px' }}>
            <h1>Bienvenido Cliente</h1>
            <p>Contenido específico para clientes.</p>
        </section>
        <section data-bgcolor="#96ac60" data-textcolor="#000000" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', paddingBottom: '50px' }}>
            <h2>Ofertas para Clientes</h2>
            <p>Más contenido para clientes.</p>
        </section>
    </>
);

const VistaAdministrador = () => ( // Componente para la vista del administrador
    <>
        <section data-bgcolor="#688db9" data-textcolor="#000000" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',  paddingBottom: '50px' }}>
            <h1>Panel de Administración</h1>
            <p>Gestión completa del sistema.</p>
        </section>
        <section data-bgcolor="#88a7d0" data-textcolor="#000000" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', paddingBottom: '50px' }}>
            <h2>Estadísticas y Usuarios</h2>
            <p>Información detallada para administradores.</p>
        </section>
    </>
);

const Menu = () => { // Componente principal del menú
    const [userRole, setUserRole] = useState(null); // Estado para almacenar el rol del usuario

    const initAnimations = useCallback(() => { // Función para inicializar las animaciones y ScrollTrigger
        const sections = gsap.utils.toArray("section[data-bgcolor]");
        
        sections.forEach(section => { // Itera sobre cada sección con un atributo data-bgcolor
            const bgColor = section.dataset.bgcolor;
            const textColor = section.dataset.textcolor;

            ScrollTrigger.create({ // Crea un ScrollTrigger para cada sección
                trigger: section,
                start: "top 50%",
                end: "bottom 50%",
                onEnter: () => gsap.to('body', { backgroundColor: bgColor, color: textColor, overwrite: "auto" }),
                onEnterBack: () => gsap.to('body', { backgroundColor: bgColor, color: textColor, overwrite: "auto" }),
            });
        });
    }, []);

    useEffect(() => { // Efecto para obtener el rol del usuario al cargar el componente
        const fetchUserRole = async () => {
            try {
                const response = await fetch('/api/user/role');
                const data = await response.json();
                setUserRole(response.ok && data.role ? data.role : 'cliente');
            } catch (error) {
                console.error("Error al obtener el rol:", error);
                setUserRole('cliente');
            }
        };

        fetchUserRole();
    }, []);

    useEffect(() => { // Efecto para inicializar las animaciones y ScrollTrigger una vez que se haya obtenido el rol del usuario
        if (userRole) {
            const timer = setTimeout(() => {
                initAnimations();
            }, 100);

            return () => { // Limpieza del efecto
                clearTimeout(timer);
                ScrollTrigger.getAll().forEach(trigger => trigger.kill()); // Elimina todos los ScrollTriggers existentes
            };
        }
    }, [userRole, initAnimations]); // Dependencias del efecto para que se ejecute cuando cambie el rol del usuario

    const renderContentByRole = () => { // Función para renderizar el contenido basado en el rol del usuario
        if (!userRole) { // Si el rol del usuario aún no se ha determinado, muestra un mensaje de carga
            return (
                <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <h1>Cargando...</h1>
                </section>
            );
        }

        switch (userRole) { // Verifica el rol del usuario y renderiza el contenido correspondiente
            case 'administrador': return <VistaAdministrador />; // Vista para el administrador
            default: return <VistaCliente />; // Vista para el cliente (por defecto)
        }
    };

    return ( // Renderiza el menú con la navegación y el contenido basado en el rol del usuario
        <div>
            <MenuNav />
            <main>
                {renderContentByRole()} {/* Renderiza el contenido basado en el rol del usuario */}
            </main>
            <Fooder />
        </div>
    );
};

export default Menu; // Exporta el componente Menu como el componente principal de la aplicación