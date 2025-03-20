"use client"
import React, { useState } from 'react'; // No necesitas useRef aquí, useState es suficiente.
import MenuNav from '../components/menuNav';
import Fooder from '../components/fooder';

const Biblioteca = () => {
    const [articulos, setArticulos] = useState([]); // Inicializa con un array vacío, no [null].
    const [busqueda, setBusqueda] = useState('');
    const [archivo, setArchivo] = useState(null);

    const handleBuscar = (e) => {
        setBusqueda(e.target.value);
    };

    const handleArchivo = (e) => {
        setArchivo(e.target.files[0]);
    };

    const handleSubir = () => {
        if (archivo) {
            // Usa Date.now() para un ID único, mejor que articulos.length.
            const nuevoArticulo = {
                id: Date.now(),
                nombre: archivo.name,
                url: URL.createObjectURL(archivo),
            };
            setArticulos([...articulos, nuevoArticulo]); // Correcto.
            setArchivo(null); // Limpia el archivo después de subirlo.
        }
    };

    // Usa useMemo para optimizar el filtrado, solo se recalcula si busqueda o articulos cambian.
    const articulosFiltrados = React.useMemo(() => {
        return articulos.filter((articulo) =>
            articulo && articulo.nombre.toLowerCase().includes(busqueda.toLowerCase())
        );
    }, [articulos, busqueda]);


    return (
        <>
            <div className="container">
                <br />
                <br />
                <br />
                <br />
                <div className="mt-5">
                    <h1 className="mb-4">Biblioteca de Artículos Científicos</h1>
                    <div className="input-group mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar artículos..."
                            value={busqueda}
                            onChange={handleBuscar}
                        />
                        <button className="btn btn-outline-secondary" type="button">Buscar</button>
                    </div>
                    <div className="mb-3">
                        <input type="file" className="form-control" accept="application/pdf" onChange={handleArchivo} />
                    </div>
                    <button className="btn btn-primary" onClick={handleSubir}>Subir Artículo</button>

                    <div className="mt-4">
                        {/* Verifica que articulosFiltrados tenga elementos antes de mapear */}
                        {articulosFiltrados.length > 0 ? (
                            articulosFiltrados.map((articulo) => (
                                <div key={articulo.id} className="mb-2">
                                    <a href={articulo.url} target="_blank" rel="noopener noreferrer" className="link-primary">
                                        {articulo.nombre}
                                    </a>
                                </div>
                            ))
                        ) : (
                            <p>No se encontraron artículos.</p> // Mensaje si no hay resultados
                        )}
                    </div>
                </div>
            </div>
            <MenuNav />
            <Fooder />
        </>
    );
};

export default Biblioteca;