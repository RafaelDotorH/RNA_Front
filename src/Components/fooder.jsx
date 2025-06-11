import React from 'react';

export default function Fooder() {// Componente de pie de página

    const footerStyle = { // Estilos originales en línea
        left: '0',
        bottom: '0',
        width: '100%',
        backgroundColor: '#333',
        color: 'white',
        textAlign: 'center',
        padding: '10px 0'
    };

    return ( // Renderiza el pie de página con los estilos definidos
        <footer style={footerStyle}>
            <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
        </footer>
    );
};