// src/Components/fooder.jsx
import React from 'react';
// Ya no se importa useAuth si no se usa el tema dinámico aquí

export default function Fooder() {
    // Ya no se obtiene theme de useAuth()

    const footerStyle = { // Estilos originales en línea
        left: '0',
        bottom: '0',
        width: '100%',
        backgroundColor: '#333',
        color: 'white',
        textAlign: 'center',
        padding: '10px 0'
    };

    return (
        <footer style={footerStyle}>
            <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
        </footer>
    );
};