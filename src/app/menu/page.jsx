"use client"
import React, { useEffect, useRef, useState, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import MenuNav from '../../Components/menuNav';
import Fooder from '../../Components/fooder';

gsap.registerPlugin(ScrollTrigger);

const VistaCliente = () => (
    <>
        <section data-bgcolor="#bcb8ad" data-textcolor="#032f35" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', paddingTop: '50px', paddingBottom: '50px' }}>
            <h1>Bienvenido Cliente</h1>
            <p>Contenido específico para clientes.</p>
        </section>
        <section data-bgcolor="#eacbd1" data-textcolor="#536fae" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', paddingTop: '50px', paddingBottom: '50px' }}>
            <h2>Ofertas para Clientes</h2>
            <p>Más contenido para clientes.</p>
        </section>
    </>
);

const VistaAdministrador = () => (
    <>
        <section data-bgcolor="#ffd700" data-textcolor="#8b4513" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', paddingTop: '50px', paddingBottom: '50px' }}>
            <h1>Panel de Administración</h1>
            <p>Gestión completa del sistema.</p>
        </section>
        <section data-bgcolor="#ffb6c1" data-textcolor="#800000" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', paddingTop: '50px', paddingBottom: '50px' }}>
            <h2>Estadísticas y Usuarios</h2>
            <p>Información detallada para administradores.</p>
        </section>
    </>
);

const Menu = () => {
    const [userRole, setUserRole] = useState(null);

    const initAnimations = useCallback(() => {
        const sections = gsap.utils.toArray("section[data-bgcolor]");
        
        sections.forEach(section => {
            const bgColor = section.dataset.bgcolor;
            const textColor = section.dataset.textcolor;

            ScrollTrigger.create({
                trigger: section,
                start: "top 50%",
                end: "bottom 50%",
                onEnter: () => gsap.to('body', { backgroundColor: bgColor, color: textColor, overwrite: "auto" }),
                onEnterBack: () => gsap.to('body', { backgroundColor: bgColor, color: textColor, overwrite: "auto" }),
            });
        });
    }, []);

    useEffect(() => {
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

    useEffect(() => {
        if (userRole) {
            const timer = setTimeout(() => {
                initAnimations();
            }, 100);

            return () => {
                clearTimeout(timer);
                ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            };
        }
    }, [userRole, initAnimations]);

    const renderContentByRole = () => {
        if (!userRole) {
            return (
                <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <h1>Cargando...</h1>
                </section>
            );
        }

        switch (userRole) {
            case 'administrador': return <VistaAdministrador />;
            default: return <VistaCliente />;
        }
    };

    return (
        <div>
            <MenuNav />
            <main>
                {renderContentByRole()}
            </main>
            <Fooder />
        </div>
    );
};

export default Menu;