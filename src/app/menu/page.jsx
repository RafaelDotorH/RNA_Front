"use client"
import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import LocomotiveScroll from 'locomotive-scroll';
import MenuNav from '../../Components/menuNav'; // Asegúrate que la ruta sea correcta
import Fooder from '../../Components/fooder';   // Asegúrate que la ruta sea correcta

gsap.registerPlugin(ScrollTrigger);

// --- Tus componentes de Vista (VistaCliente, VistaModerador, VistaAdministrador) permanecen igual ---
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

const VistaModerador = () => (
    <>
        <section data-bgcolor="#add8e6" data-textcolor="#00008b" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', paddingTop: '50px', paddingBottom: '50px' }}>
            <h1>Panel de Moderador</h1>
            <p>Herramientas y contenido para moderadores.</p>
        </section>
        <section data-bgcolor="#90ee90" data-textcolor="#006400" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', paddingTop: '50px', paddingBottom: '50px' }}>
            <h2>Contenido Pendiente de Revisión</h2>
            <p>Listado de items a moderar.</p>
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
// --- Fin de los componentes de Vista ---


const Menu = () => {
    const containerRef = useRef(null);
    const bodyRef = useRef(null);
    const [userRole, setUserRole] = useState(null);
    const [isLoadingRole, setIsLoadingRole] = useState(true);
    const [userEmail, setUserEmail] = useState(null);
    const [errorApi, setErrorApi] = useState(null);

    useEffect(() => {
        bodyRef.current = document.body;

        const fetchUserRoleAndData = async () => {
            setIsLoadingRole(true);
            setErrorApi(null);

            try {
                // AJUSTE IMPORTANTE AQUÍ: Cambia la URL de la API
                const response = await fetch('/api/user/role', { // <--- URL ACTUALIZADA
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (response.ok) {
                    if (data.exists && data.role) {
                        setUserRole(data.role);
                        setUserEmail(data.email);
                        console.log("Rol obtenido del backend (/api/user/role):", data.role, "Email:", data.email);
                    } else {
                        console.warn("API /api/user/role: Usuario no encontrado o rol no definido:", data.message);
                        setUserRole('cliente');
                        setErrorApi(data.message || "El usuario autenticado no fue encontrado en el sistema.");
                    }
                } else {
                    console.error("API /api/user/role: Error al verificar el email/rol:", data.message || `Status: ${response.status}`);
                    setUserRole('cliente');
                    setErrorApi(data.message || `Error ${response.status}: No se pudo verificar la sesión.`);
                    if (response.status === 401) {
                        console.log("API /api/user/role: No autenticado o token inválido. Mostrando como cliente.");
                    }
                }
            } catch (error) {
                console.error("Error en la llamada a la API /api/user/role:", error);
                setUserRole('cliente');
                setErrorApi("Error de red o al procesar la respuesta.");
            } finally {
                setIsLoadingRole(false);
            }
        };

        fetchUserRoleAndData();
    }, []);

    useEffect(() => {
        let scroller;
        if (containerRef.current && !isLoadingRole && bodyRef.current) {
            if (window.locomotiveScrollInstance) {
                window.locomotiveScrollInstance.destroy();
                ScrollTrigger.getAll().forEach(trigger => trigger.kill()); // Más específico
            }

            scroller = new LocomotiveScroll({
                el: containerRef.current,
                smooth: true,
            });
            window.locomotiveScrollInstance = scroller;

            scroller.on("scroll", ScrollTrigger.update);

            ScrollTrigger.scrollerProxy(containerRef.current, {
                scrollTop(value) {
                    return arguments.length ? scroller.scrollTo(value, 0, 0) : scroller.scroll.instance.scroll.y;
                },
                getBoundingClientRect() {
                    return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
                },
            });

            const sections = Array.from(containerRef.current.querySelectorAll("section[data-bgcolor]"));
            sections.forEach((section) => {
                const bgColor = section.dataset.bgcolor;
                const textColor = section.dataset.textcolor;
                ScrollTrigger.create({
                    trigger: section,
                    scroller: containerRef.current,
                    start: "top center",
                    end: "bottom center",
                    onEnter: () => gsap.to(bodyRef.current, { backgroundColor: bgColor, color: textColor, overwrite: "auto", duration: 0.3 }),
                    onEnterBack: () => gsap.to(bodyRef.current, { backgroundColor: bgColor, color: textColor, overwrite: "auto", duration: 0.3 }),
                });
            });

            ScrollTrigger.addEventListener("refresh", () => {
                if (scroller) scroller.update();
            });
            ScrollTrigger.refresh();
        }

        return () => {
            if (scroller) {
                scroller.destroy();
                window.locomotiveScrollInstance = null;
            }
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [isLoadingRole, userRole]);

    const renderContentByRole = () => {
        if (isLoadingRole) {
            return (
                <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
                    <h1>Cargando información del usuario...</h1>
                </section>
            );
        }
        switch (userRole) {
            case 'administrador':
                return <VistaAdministrador />;
            case 'moderador':
                return <VistaModerador />;
            case 'cliente':
            default:
                return <VistaCliente />;
        }
    };

    return (
        <div>
            <MenuNav />
            <div className="smooth-scroll-container" ref={containerRef} style={{ height: 'auto', overflow: 'hidden' }}>
                {renderContentByRole()}
            </div>
            <Fooder />
        </div>
    );
};
export default Menu;