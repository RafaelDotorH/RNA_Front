"use client";
import MenuNav from '../Components/menuNav';
import Fooder from '../Components/fooder';
import { useAuth } from './lib/authContext';

export default function ProtectedLayout({ children }) {
    const { loading } = useAuth();

    const mainContentStyle = {
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0' }}>
                Cargando contenido protegido...
            </div>
        );
    }

    return (
        <>
            <MenuNav />
            <main id="main" style={mainContentStyle}>
                {children}
            </main>
            <Fooder />
        </>
    );
}