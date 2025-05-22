'use client'
import Link from 'next/link';
import './menuNav.css';
import { IonIcon } from '@ionic/react';
import { homeOutline, logOutOutline, libraryOutline, settingsOutline, informationOutline, menuOutline, closeOutline } from 'ionicons/icons'; // Importa menu y close
import React, { useState, useEffect, useRef } from 'react'; // Importa useState, useEffect, useRef
import { useRouter } from 'next/navigation';

export default function MenuNav() {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navRef = useRef(null); // Referencia al elemento nav

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    async function signOut() {
        try {
          const response = await fetch('/api/auth/logout', {
            method: 'POST',
          });
          if (response.ok) {
            console.log('Sesión cerrada correctamente');
            setIsMobileMenuOpen(false); // Cierra el menú móvil si está abierto
            router.push('/');
          } else {
            console.error('Error al cerrar sesión');
          }
        } catch (error) {
          console.error('Error de red al cerrar sesión:', error);
        }
      }

    // Cierra el menú si se hace clic fuera de él en móvil
    useEffect(() => {
        function handleClickOutside(event) {
            if (navRef.current && !navRef.current.contains(event.target) && isMobileMenuOpen) {
                // Asegurarse de no cerrar si se hizo clic en el botón del menú
                // Esto puede necesitar un ref para el botón si el botón está fuera del navRef
                // o un chequeo más específico si el botón es parte de #navbar
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


    // Cierra el menú móvil cuando se navega a una nueva ruta
    const handleLinkClick = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            {/* Botón del menú hamburguesa solo para móvil/tablet */}
            <button id="mobile-menu-button" className="mobile-menu-button" onClick={toggleMobileMenu}>
                <IonIcon icon={isMobileMenuOpen ? closeOutline : menuOutline} />
            </button>

            <nav id="navbar" ref={navRef} className={isMobileMenuOpen ? 'mobile-menu-active' : ''}>
                <ul className="navbar-items">
                    <li className="navbar-logo flexbox-left">
                        <Link href="/menu" className="navbar-item-inner flexbox" onClick={handleLinkClick}>
                            {/* Puedes poner un logo SVG o texto aquí si lo deseas para el modo escritorio */}
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
                    {/* Separador visual opcional para móvil */}
                    <li className="navbar-item mobile-only-separator" style={{height: '1px', backgroundColor: 'hsl(var(--quite-gray), 0.2)', margin: '0.5em 1em'}}></li>
                    <li className="navbar-item flexbox-left" onClick={() => { signOut(); handleLinkClick(); }}> {/* Asegúrate de que signOut también cierre el menú */}
                        {/* El div y span se pueden mantener si quieres la misma estructura visual */}
                        <div className="navbar-item-inner flexbox-left" style={{cursor: 'pointer'}}>
                             <div className="navbar-item-inner-icon-wrapper flexbox">
                                <IonIcon icon={logOutOutline} />
                            </div>
                            <span className="link-text">Cerrar Sesión</span>
                        </div>
                    </li>
                </ul>
            </nav>
        </>
    );
};