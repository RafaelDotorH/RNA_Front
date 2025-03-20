import React from 'react';

export default function Fooder() {
    return (
        <footer style={footerStyle}>
            <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
        </footer>
    );
};

const footerStyle = {
    left: '0',
    bottom: '0',
    width: '100%',
    backgroundColor: '#333',
    color: 'white',
    textAlign: 'center',
    padding: '10px 0'
};