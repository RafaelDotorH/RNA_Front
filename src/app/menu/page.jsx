"use client"
import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import LocomotiveScroll from 'locomotive-scroll';
import MenuNav from '../../Components/menuNav'; // Asegúrate que esta ruta sea correcta
import Fooder from '../../Components/fooder';   // Asegúrate que esta ruta sea correcta

gsap.registerPlugin(ScrollTrigger);

// --- Tus componentes de Vista (VistaCliente, VistaModerador, VistaAdministrador) ---
const VistaCliente = () => (
    <>
        <section data-bgcolor="#bcb8ad" data-textcolor="#032f35" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', paddingTop: '50px', paddingBottom: '50px' }}>
            <h1>Bienvenido Cliente</h1>
            <p>Contenido específico para clientes.</p>
            {/* IMPORTANTE: Revisa si esta sección o sus hijos tienen atributos data-scroll-* que puedan ser problemáticos */}
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


const Menu = () => {
    const containerRef = useRef(null);
    const bodyRef = useRef(null);
    const [userRole, setUserRole] = useState(null);
    const [isLoadingRole, setIsLoadingRole] = useState(true);

    useEffect(() => {
        bodyRef.current = document.body; // Asigna document.body a bodyRef

        const fetchUserRoleAndData = async () => {
            setIsLoadingRole(true);
            // setErrorApi(null); // Descomenta si lo usas
            try {
                const response = await fetch('/api/user/role', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                const data = await response.json();
                if (response.ok) {
                    if (data.exists && data.role) {
                        setUserRole(data.role);
                        // setUserEmail(data.email); // Descomenta si lo usas
                        console.log("Rol obtenido del backend:", data.role);
                    } else {
                        console.warn("API /api/user/role: Usuario no encontrado o rol no definido:", data.message);
                        setUserRole('cliente'); // Rol por defecto en caso de datos no esperados
                        // setErrorApi(data.message || "El usuario autenticado no fue encontrado en el sistema."); // Descomenta si lo usas
                    }
                } else {
                    console.error("API /api/user/role: Error al verificar el email/rol:", data.message || `Status: ${response.status}`);
                    setUserRole('cliente'); // Rol por defecto en caso de error
                    // setErrorApi(data.message || `Error ${response.status}: No se pudo verificar la sesión.`); // Descomenta si lo usas
                }
            } catch (error) {
                console.error("Error en la llamada a la API /api/user/role:", error);
                setUserRole('cliente'); // Rol por defecto en caso de error de red
                // setErrorApi("Error de red o al procesar la respuesta."); // Descomenta si lo usas
            } finally {
                setIsLoadingRole(false);
            }
        };

        fetchUserRoleAndData();
    }, []); // Se ejecuta solo una vez al montar el componente

    useEffect(() => {
        let scroller; // Instancia de LocomotiveScroll
        let refreshTimeoutId; // ID del timeout para limpiarlo
        const TIMEOUT_DELAY = 200; // Milisegundos. Aumenta este valor si el error persiste (ej. 500, 1000)

        const handleScrollTriggerRefresh = () => {
            if (scroller) {
                try {
                    scroller.update();
                } catch (e) {
                    console.error("Error dentro de scroller.update() en el evento 'refresh':", e);
                }
            }
        };

        // Solo proceder si el contenedor existe, el rol de usuario ha cargado, y bodyRef está asignado
        if (containerRef.current && !isLoadingRole && bodyRef.current) {
            console.log("Condiciones cumplidas. Intentando inicializar LocomotiveScroll...");

            // Destruir instancias previas para evitar duplicados
            if (window.locomotiveScrollInstance) {
                console.log("Destruyendo instancia previa de LocomotiveScroll y ScrollTriggers...");
                window.locomotiveScrollInstance.destroy();
                ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            }

            scroller = new LocomotiveScroll({
                el: containerRef.current,
                smooth: true,
                // Otras opciones que podrías considerar:
                // getDirection: true,
                // tablet: { smooth: false, breakpoint: 768 },
                // smartphone: { smooth: false },
            });
            window.locomotiveScrollInstance = scroller; // Guardar globalmente si es necesario
            console.log("LocomotiveScroll inicializado.");

            // Conectar LocomotiveScroll con ScrollTrigger para actualizaciones de scroll
            scroller.on("scroll", ScrollTrigger.update);

            // Configurar el proxy de ScrollTrigger para que use LocomotiveScroll
            ScrollTrigger.scrollerProxy(containerRef.current, {
                scrollTop(value) {
                    return arguments.length
                        ? scroller.scrollTo(value, { duration: 0, disableLerp: true }) // Mejor usar el API de Loco con opciones
                        : scroller.scroll.instance.scroll.y;
                },
                getBoundingClientRect() {
                    return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
                },
                // pinType: containerRef.current.style.transform ? "transform" : "fixed" // Descomenta si usas pinning
            });
            console.log("ScrollTrigger.scrollerProxy configurado.");

            // Añade el event listener para el refresh global ANTES del timeout
            // Este listener llamará a scroller.update() cuando ScrollTrigger se refresque
            ScrollTrigger.addEventListener("refresh", handleScrollTriggerRefresh);
            console.log("Listener 'refresh' de ScrollTrigger añadido.");

            // Retrasamos la creación de los ScrollTriggers de las secciones y el refresh global
            refreshTimeoutId = setTimeout(() => {
                console.log(`Dentro del setTimeout (después de ${TIMEOUT_DELAY}ms). Preparando para crear ScrollTriggers para secciones...`);

                // --- Creación de ScrollTriggers para secciones con data-bgcolor ---
                // Esta es la parte que indicaste como problemática.
                // Si el error persiste, el problema está en los atributos de estas 'section' o sus hijos.
                const sections = Array.from(containerRef.current.querySelectorAll("section[data-bgcolor]"));
                console.log(`Encontradas ${sections.length} secciones con data-bgcolor para procesar.`);
                sections.forEach((section, index) => {
                    const bgColor = section.dataset.bgcolor;
                    const textColor = section.dataset.textcolor;

                    if (typeof bgColor === 'string' && typeof textColor === 'string') {
                        console.log(`Creando ScrollTrigger para sección ${index} con bgColor: ${bgColor}, textColor: ${textColor}`, section);
                        ScrollTrigger.create({
                            trigger: section,
                            scroller: containerRef.current,
                            start: "top center",
                            end: "bottom center",
                            onEnter: () => gsap.to(bodyRef.current, { backgroundColor: bgColor, color: textColor, overwrite: "auto", duration: 0.3 }),
                            onEnterBack: () => gsap.to(bodyRef.current, { backgroundColor: bgColor, color: textColor, overwrite: "auto", duration: 0.3 }),
                            // markers: true, // Habilita esto para depurar posiciones de una sección específica
                        });
                    } else {
                        console.warn(`Sección ${index} encontrada sin data-bgcolor o data-textcolor válidos (o no son strings).`, section);
                    }
                });
                // --- Fin de la creación de ScrollTriggers para secciones ---

                console.log("Ejecutando ScrollTrigger.refresh() global DESPUÉS de crear STs para secciones.");
                ScrollTrigger.refresh(); // Esto disparará el listener 'refresh' y por ende scroller.update()

            }, TIMEOUT_DELAY);

        } else {
            // Log si las condiciones para inicializar no se cumplen
            console.log("LocomotiveScroll NO inicializado. Condiciones:",
                { hasContainer: !!containerRef.current, isRoleLoaded: !isLoadingRole, hasBody: !!bodyRef.current });
        }

        // Función de limpieza del useEffect
        return () => {
            console.log("Limpiando efecto de LocomotiveScroll...");
            if (refreshTimeoutId) {
                clearTimeout(refreshTimeoutId); // Limpia el timeout si está pendiente
                console.log("Timeout de refresh limpiado.");
            }
            if (scroller) {
                console.log("Destruyendo instancia de LocomotiveScroll.");
                scroller.destroy();
                window.locomotiveScrollInstance = null;
            }
            // Matar todos los ScrollTriggers creados
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            // Remover el listener de refresh
            ScrollTrigger.removeEventListener("refresh", handleScrollTriggerRefresh);
            console.log("ScrollTriggers eliminados y listener de refresh removido. Limpieza completa.");
        };
    }, [isLoadingRole]); // Se ejecuta cuando isLoadingRole cambia (y en el montaje inicial)

    const renderContentByRole = () => {
        if (isLoadingRole) {
            return (
                <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
                    <h1>Cargando información del usuario...</h1>
                </section>
            );
        }
        // Para depurar, puedes forzar una vista o retornar null/contenido simple:
        // return <VistaCliente />;
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