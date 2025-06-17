"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/authContext';
import MenuNav from '@/Components/menuNav';
import Fooder from '@/Components/fooder';

const BibliotecaConRoles = () => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    
    const [userRole, setUserRole] = useState(null);
    const [enlaces, setEnlaces] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const initialState = { titulo: '', descripcion: '', fecha: '', url: '' };
    const [nuevoEnlace, setNuevoEnlace] = useState(initialState);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [enlaceAEliminar, setEnlaceAEliminar] = useState(null);

    const obtenerFechaLocal = () => {
        const ahora = new Date();
        const anio = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, '0');
        const dia = String(ahora.getDate()).padStart(2, '0');
        return `${anio}-${mes}-${dia}`;
    };

    const hoy = obtenerFechaLocal();

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await fetch('../api/user/role');
                const data = await response.json();
                setUserRole(response.ok && data.role ? data.role : 'cliente');
            } catch (error) {
                console.error("Error al obtener el rol:", error);
                setUserRole('cliente');
            }
        };
        fetchUserRole();
    }, []);

    const fetchEnlaces = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('../api/enlaces');
            if (!response.ok) throw new Error('No se pudieron cargar los enlaces');
            const data = await response.json();
            setEnlaces(data.enlaces || []);
        } catch (err) {
            setError(`Error al cargar enlaces: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (userRole) {
            fetchEnlaces();
        }
    }, [userRole, fetchEnlaces]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoEnlace(prevState => ({ ...prevState, [name]: value }));
    };

    const handleAgregarEnlace = async () => {
        if (!nuevoEnlace.titulo || !nuevoEnlace.descripcion || !nuevoEnlace.url || !nuevoEnlace.fecha) {
            setError('Todos los campos son obligatorios.');
            return;
        }
        if (nuevoEnlace.fecha > hoy) {
            setError('La fecha no puede ser posterior a la fecha actual.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            const response = await fetch('../api/enlaces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoEnlace),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al agregar el enlace.');
            setSuccessMessage('¡Enlace agregado con éxito!');
            setNuevoEnlace(initialState);
            await fetchEnlaces();
        } catch (err) {
            setError(`Error al agregar: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleEliminarEnlace = async (id) => {
        if (!id) return;
        setIsLoading(true);
        try {
            const response = await fetch(`../api/enlaces/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('No se pudo eliminar el enlace.');
            setSuccessMessage('Enlace eliminado correctamente.');
            await fetchEnlaces();
        } catch (err) {
            setError(`Error al eliminar: ${err.message}`);
        } finally {
            setIsLoading(false);
            setShowModal(false);
            setEnlaceAEliminar(null);
        }
    };

    const abrirModalConfirmacion = (id) => {
        setEnlaceAEliminar(id);
        setShowModal(true);
    };

    const enlacesFiltrados = React.useMemo(() => {
        if (!Array.isArray(enlaces)) return [];
        const busquedaLower = busqueda.toLowerCase();
        return enlaces.filter(enlace =>
            enlace.titulo?.toLowerCase().includes(busquedaLower) ||
            enlace.descripcion?.toLowerCase().includes(busquedaLower) ||
            enlace.fecha?.toString().includes(busquedaLower)
        );
    }, [enlaces, busqueda]);

    const esAdmin = userRole === 'administrador';

    if (!userRole) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><h1>Cargando...</h1></div>;
    }

    const formatDisplayDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    };
    return (
        <>
            <MenuNav />
            <div className="container pt-5 mb-5">
                <div className="row justify-content-center">
                    <div className="col-md-9">
                        <h2 className="mb-4">Biblioteca de Enlaces</h2>
                        {error && <div className="alert alert-danger" onClick={() => setError('')} style={{cursor: 'pointer'}}>{error}</div>}
                        {successMessage && <div className="alert alert-success" onClick={() => setSuccessMessage('')} style={{cursor: 'pointer'}}>{successMessage}</div>}

                        {esAdmin && (
                            <div className="card mb-4 shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">Agregar Nuevo Enlace</h5>
                                    <div className="mb-3">
                                        <label htmlFor="titulo" className="form-label">Título</label>
                                        <input type="text" className="form-control" id="titulo" name="titulo" value={nuevoEnlace.titulo} onChange={handleInputChange} placeholder="Título del enlace" disabled={isLoading} />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="descripcion" className="form-label">Descripción</label>
                                        <textarea className="form-control" id="descripcion" name="descripcion" rows="3" value={nuevoEnlace.descripcion} onChange={handleInputChange} placeholder="Breve resumen" disabled={isLoading}></textarea>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="fecha" className="form-label">Fecha</label>
                                            <input type="date" className="form-control" id="fecha" name="fecha" value={nuevoEnlace.fecha} onChange={handleInputChange} disabled={isLoading} max={hoy}/>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="url" className="form-label">URL</label>
                                            <input type="url" className="form-control" id="url" name="url" value={nuevoEnlace.url} onChange={handleInputChange} placeholder="https://..." disabled={isLoading} />
                                        </div>
                                    </div>
                                    <button className="btn btn-primary" onClick={handleAgregarEnlace} disabled={isLoading || !nuevoEnlace.titulo || !nuevoEnlace.descripcion || !nuevoEnlace.url || !nuevoEnlace.fecha}>
                                        {isLoading ? 'Agregando...' : 'Agregar Enlace'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <h3 className="mb-3">Enlaces Disponibles</h3>
                        <input type="text" className="form-control mb-3" placeholder="Buscar enlaces..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />

                        {isLoading && enlaces.length === 0 && <p>Cargando enlaces...</p>}
                        {!isLoading && enlacesFiltrados.length === 0 && <p className="text-muted">{busqueda ? 'No se encontraron resultados.' : 'Aún no hay enlaces agregados.'}</p>}
                        
                        <div className="border rounded p-2 bg-light" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            <div className="list-group">
                                {enlacesFiltrados.map(({ _id, titulo, descripcion, fecha, url }) => (
                                    <div key={_id} className="list-group-item list-group-item-action flex-column align-items-start mb-2 border rounded shadow-sm">
                                        <div className="d-flex w-100 justify-content-between">
                                            <h4 className="mb-1">{titulo}</h4>
                                            <span className="badge bg-secondary align-self-start">{formatDisplayDate(fecha)}</span>
                                        </div>
                                        <p className="mb-1 text-muted">{descripcion || "Sin descripción"}</p>
                                        <a href={url} target="_blank" rel="noopener noreferrer"> URL: {url}</a>
                                        
                                        {esAdmin && (
                                            <div className="d-flex justify-content-end mt-2">
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => abrirModalConfirmacion(_id)} disabled={isLoading}>
                                                    Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {showModal && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show" tabIndex="-1" style={{ display: 'block' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Confirmar Eliminación</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <p>¿Estás seguro de que quieres eliminar permanentemente este enlace? Esta acción no se puede deshacer.</p>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                    <button type="button" className="btn btn-danger" onClick={() => handleEliminarEnlace(enlaceAEliminar)}>Sí, Eliminar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <Fooder />
        </>
    );
};

export default BibliotecaConRoles;