"use client";
import MenuNav from '../Components/menuNav'; // Importa el componente de navegación del menú
import Fooder from '../Components/fooder'; // Importa el componente de pie de página
import { useAuth } from './lib/authContext'; // Importa el contexto de autenticación

export default function ProtectedLayout({ children }) { // Componente de diseño protegido que envuelve el contenido de la aplicación
    const { loading } = useAuth();

    const mainContentStyle = {
    };

    if (loading) { // Si la autenticación está cargando, muestra un mensaje de carga
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0' }}>
                Cargando contenido protegido...
            </div>
        );
    }

    return ( // Renderiza el diseño protegido con la navegación del menú y el pie de página
        <>
            <MenuNav />
            <main id="main" style={mainContentStyle}>
                {children}
            </main>
            <Fooder />
        </>
    );
}