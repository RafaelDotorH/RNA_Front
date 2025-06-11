'use client'
import Link from 'next/link';
import './menuNav.css';
import { IonIcon } from '@ionic/react';
import { homeOutline, logOutOutline, libraryOutline, settingsOutline, informationOutline, menuOutline, closeOutline } from 'ionicons/icons';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/lib/authContext';

export default function MenuNav() { // Componente de navegación del menú
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Estado para manejar la apertura/cierre del menú móvil
    const navRef = useRef(null); // Referencia al elemento de navegación para manejar clics fuera del menú
    const { logout } = useAuth(); // Importa la función de cierre de sesión del contexto de autenticación

    const [isClient, setIsClient] = useState(false); // Estado para verificar si el componente se está renderizando en el cliente

    useEffect(() => { // Efecto para verificar si el componente se está renderizando en el cliente
        setIsClient(true);
    }, []);

    const toggleMobileMenu = () => { // Función para alternar la apertura/cierre del menú móvil
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    async function handleSignOut() { // Función para manejar el cierre de sesión del usuario
        await logout();
        setIsMobileMenuOpen(false);
    }

    useEffect(() => { // Efecto para manejar clics fuera del menú móvil
        function handleClickOutside(event) {
            if (navRef.current && !navRef.current.contains(event.target) && isMobileMenuOpen) {
                const menuButton = document.getElementById('mobile-menu-button');
                if (menuButton && menuButton.contains(event.target)) {
                    return;
                }
                setIsMobileMenuOpen(false);
            }
        }

        if (isMobileMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMobileMenuOpen, navRef]);

    const handleLinkClick = () => { // Función para manejar el clic en los enlaces del menú
        setIsMobileMenuOpen(false);
    };

    return ( // Renderiza el componente de navegación del menú
        <>
            <button id="mobile-menu-button" className="mobile-menu-button" onClick={toggleMobileMenu}>
                {isClient && <IonIcon icon={isMobileMenuOpen ? closeOutline : menuOutline} />}
            </button>

            <nav id="navbar" ref={navRef} className={isMobileMenuOpen ? 'mobile-menu-active' : ''}>
                <ul className="navbar-items">
                    <li className="navbar-logo flexbox-left">
                        <Link href="/menu" className="navbar-item-inner flexbox" onClick={handleLinkClick}>
                        </Link>
                    </li>
                    <li className="navbar-item flexbox-left">
                        <Link href="/menu" className="navbar-item-inner flexbox-left" onClick={handleLinkClick}>
                            <div className="navbar-item-inner-icon-wrapper flexbox">
                                {isClient && <IonIcon icon={homeOutline} />}
                            </div>
                            <span className="link-text">Inicio</span>
                        </Link>
                    </li>
                    <li className="navbar-item flexbox-left">
                        <Link href="/biblioteca" className="navbar-item-inner flexbox-left" onClick={handleLinkClick}>
                            <div className="navbar-item-inner-icon-wrapper flexbox">
                                {isClient && <IonIcon icon={libraryOutline} />}
                            </div>
                            <span className="link-text">Biblioteca</span>
                        </Link>
                    </li>
                    <li className="navbar-item flexbox-left">
                        <Link href="/principal" className="navbar-item-inner flexbox-left" onClick={handleLinkClick}>
                            <div className="navbar-item-inner-icon-wrapper flexbox">
                                {isClient && <IonIcon icon={settingsOutline} />}
                            </div>
                            <span className="link-text">Evaluador</span>
                        </Link>
                    </li>
                    <li className="navbar-item flexbox-left">
                        <Link href="/nosotros" className="navbar-item-inner flexbox-left" onClick={handleLinkClick}>
                            <div className="navbar-item-inner-icon-wrapper flexbox">
                                {isClient && <IonIcon icon={informationOutline} />}
                            </div>
                            <span className="link-text">Nosotros</span>
                        </Link>
                    </li>
                    <li className="navbar-item flexbox-left">
                        <Link href="/" className="navbar-item-inner flexbox-left" onClick={handleSignOut}>
                                <div className="navbar-item-inner-icon-wrapper flexbox">
                                    {isClient && <IonIcon icon={logOutOutline} />}
                                </div>
                                <span className="link-text">Cerrar Sesión</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </>
    );
};