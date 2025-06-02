'use client'
import Link from 'next/link';
import './menuNav.css';
import { IonIcon } from '@ionic/react';
import { homeOutline, logOutOutline, libraryOutline, settingsOutline, informationOutline, menuOutline, closeOutline } from 'ionicons/icons';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/authContext';

export default function MenuNav() {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    // 1. Agregamos el nuevo estado 'hasMounted'
    const [hasMounted, setHasMounted] = useState(false);
    const navRef = useRef(null);
    const { logoutContext, isAuthenticated } = useAuth();

    // 2. Agregamos este useEffect que se ejecuta solo una vez en el cliente
    useEffect(() => {
        setHasMounted(true);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    async function handleSignOut() {
        await logoutContext();
        setIsMobileMenuOpen(false);
    }

    useEffect(() => {
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

    const handleLinkClick = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <button id="mobile-menu-button" className="mobile-menu-button" onClick={toggleMobileMenu}>
                {/* 3. El IonIcon ahora solo se renderiza si hasMounted es true */}
                {hasMounted && (
                    <IonIcon icon={isMobileMenuOpen ? closeOutline : menuOutline} />
                )}
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
                    <li className="navbar-item mobile-only-separator"></li>
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