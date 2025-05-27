'use client'
import Link from 'next/link';
import './menuNav.css'; // Importar los estilos CSS dedicados
import { IonIcon } from '@ionic/react';
import { homeOutline, logOutOutline, libraryOutline, settingsOutline, informationOutline, menuOutline, closeOutline } from 'ionicons/icons';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../app/lib/authContext'; // Solo para logout e isAuthenticated

export default function MenuNav() {
    const router = useRouter(); //
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); //
    const navRef = useRef(null); //
    const { logoutContext, isAuthenticated } = useAuth(); // Solo se usa para el estado de autenticación y la función de logout

    const toggleMobileMenu = () => { //
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    async function handleSignOut() { //
        await logoutContext();
        setIsMobileMenuOpen(false); //
    }

    useEffect(() => { //
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

    const handleLinkClick = () => { //
        setIsMobileMenuOpen(false);
    };

    // YA NO SE USAN ESTILOS DINÁMICOS DEL TEMA AQUÍ
    // const navDynamicStyles = { ... };
    // const linkDynamicStyles = { ... };
    // const mobileButtonDynamicStyles = { ... };
    // const separatorDynamicStyles = { ... };

    return (
        <>
            {/* Los estilos para este botón vendrán de menuNav.css o inline si son muy específicos y no temáticos */}
            <button id="mobile-menu-button" className="mobile-menu-button" onClick={toggleMobileMenu}>
                <IonIcon icon={isMobileMenuOpen ? closeOutline : menuOutline} />
            </button>

            {/* Los estilos para nav y sus hijos vendrán de menuNav.css */}
            <nav id="navbar" ref={navRef} className={isMobileMenuOpen ? 'mobile-menu-active' : ''}>
                <ul className="navbar-items">
                    <li className="navbar-logo flexbox-left">
                        <Link href="/menu" className="navbar-item-inner flexbox" onClick={handleLinkClick}>
                        </Link>
                    </li>
                    <li className="navbar-item flexbox-left">
                        <Link href="/menu" className="navbar-item-inner flexbox-left" onClick={handleLinkClick}>
                            <div className="navbar-item-inner-icon-wrapper flexbox">
                                <IonIcon icon={homeOutline} />
                            </div>
                            <span className="link-text">Inicio</span>
                        </Link>
                    </li>
                    <li className="navbar-item flexbox-left">
                        <Link href="/biblioteca" className="navbar-item-inner flexbox-left" onClick={handleLinkClick}>
                            <div className="navbar-item-inner-icon-wrapper flexbox">
                                <IonIcon icon={libraryOutline} />
                            </div>
                            <span className="link-text">Biblioteca</span>
                        </Link>
                    </li>
                    <li className="navbar-item flexbox-left">
                        <Link href="/principal" className="navbar-item-inner flexbox-left" onClick={handleLinkClick}>
                            <div className="navbar-item-inner-icon-wrapper flexbox">
                                <IonIcon icon={settingsOutline} />
                            </div>
                            <span className="link-text">Evaluador</span>
                        </Link>
                    </li>
                    <li className="navbar-item flexbox-left">
                        <Link href="/nosotros" className="navbar-item-inner flexbox-left" onClick={handleLinkClick}>
                            <div className="navbar-item-inner-icon-wrapper flexbox">
                                <IonIcon icon={informationOutline} />
                            </div>
                            <span className="link-text">Nosotros</span>
                        </Link>
                    </li>
                    <li className="navbar-item mobile-only-separator"></li> {/* Estilo desde CSS */}
                    {isAuthenticated && (
                        <li className="navbar-item flexbox-left" onClick={handleSignOut}>
                            <div className="navbar-item-inner flexbox-left" style={{cursor: 'pointer'}}>
                                 <div className="navbar-item-inner-icon-wrapper flexbox">
                                    <IonIcon icon={logOutOutline} />
                                </div>
                                <span className="link-text">Cerrar Sesión</span>
                            </div>
                        </li>
                    )}
                </ul>
            </nav>
        </>
    );
};