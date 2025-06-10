"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/authContext';
import MenuNav from '@/Components/menuNav';
import Fooder from '@/Components/fooder';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `/js/pdf.worker.min.mjs`;

const Biblioteca = () => {
    const { user, loading: authLoading, theme } = useAuth();
    const router = useRouter();
    
    const [articulos, setArticulos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [archivo, setArchivo] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [autoPreviewLoaded, setAutoPreviewLoaded] = useState(false);

    useEffect(() => {
            if (authLoading) {
                router.push('/menu');
            }
        }, [authLoading, user, router]);

    const fetchArticulos = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('../biblioteca/articles');
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'No se pudieron cargar los artículos');
            }
            const data = await response.json();
            const fetchedArticulos = data.articles || [];
            setArticulos(fetchedArticulos);

            if (fetchedArticulos.length > 0 && !autoPreviewLoaded) {
                const articulosFiltradosCurrent = fetchedArticulos.filter(a =>
                    a.name.toLowerCase().includes(busqueda.toLowerCase())
                );
                if (busqueda === '' || (articulosFiltradosCurrent.length > 0 && articulosFiltradosCurrent[0]._id === fetchedArticulos[0]._id) ) {
                    handlePreview(fetchedArticulos[0].downloadURL);
                    setAutoPreviewLoaded(true);
                }
            } else if (fetchedArticulos.length === 0) {
                setSelectedPdfUrl(null);
            }

        } catch (err) {
            setError(`Error al cargar artículos: ${err.message}`);
            setArticulos([]);
            setSelectedPdfUrl(null);
        } finally {
            setIsLoading(false);
        }
    }, [autoPreviewLoaded, busqueda]);

    useEffect(() => {
        if (user) {
            fetchArticulos();
        }
    }, [fetchArticulos, user]);

    const handleBuscar = (e) => {
        const nuevaBusqueda = e.target.value;
        setBusqueda(nuevaBusqueda);
        setSelectedPdfUrl(null);
        setAutoPreviewLoaded(false);
    };

    const handleArchivoChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            setArchivo(file);
            setError('');
        } else if (file) {
            setError('Por favor, selecciona solo archivos PDF.');
            setArchivo(null);
            e.target.value = null;
        } else {
            setArchivo(null);
        }
    };

    const handleSubir = async () => {
        if (!archivo) {
            setError('Por favor, selecciona un archivo PDF para subir.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSuccessMessage('');
        const formData = new FormData();
        formData.append('pdf', archivo);
        try {
            const response = await fetch('../biblioteca/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error al subir el archivo.');
            }
            setSuccessMessage(data.message || '¡Artículo subido con éxito!');
            setArchivo(null);
            if(document.getElementById('fileInput')) {
                 document.getElementById('fileInput').value = '';
            }
            setAutoPreviewLoaded(false);
            fetchArticulos();
        } catch (err) {
            setError(`Error al subir: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const articulosFiltrados = React.useMemo(() => {
        if (!Array.isArray(articulos)) return [];
        return articulos.filter((articulo) =>
            articulo && articulo.name && typeof articulo.name === 'string' &&
            articulo.name.toLowerCase().includes(busqueda.toLowerCase())
        );
    }, [articulos, busqueda]);

    const handlePreview = (downloadUrl) => {
        setSelectedPdfUrl(downloadUrl);
        setNumPages(null);
    };

    function onDocumentLoadSuccess({ numPages: nextNumPages }) {
        setNumPages(nextNumPages);
    }

    const documentOptions = React.useMemo(() => ({
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
        cMapPacked: true,
    }), []);

    if (authLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: theme ? theme.appBackgroundColor : '#fff',
                color: theme ? theme.appTextColor : '#000'
            }}>
                <h1>Cargando...</h1>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <>
            <div className="container mt-5">
                <div className="row">
                    <div className="col-md-6 mt-3">
                        <h2 className="mb-4">Biblioteca de Artículos Científicos</h2>
                        {error && <div className="alert alert-danger" role="alert">{error}</div>}
                        {successMessage && <div className="alert alert-success" role="alert">{successMessage}</div>}
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar artículos por nombre..."
                                value={busqueda}
                                onChange={handleBuscar}
                                aria-label="Buscar artículos"
                            />
                        </div>
                        <div className="mb-1">
                            <label htmlFor="fileInput" className="form-label">Seleccionar PDF para subir:</label>
                            <input
                                type="file"
                                className="form-control"
                                id="fileInput"
                                accept="application/pdf"
                                onChange={handleArchivoChange}
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            className="btn btn-primary mb-1"
                            onClick={handleSubir}
                            disabled={isLoading || !archivo}
                        >
                            {isLoading && archivo ? 'Subiendo...' : 'Subir Artículo'}
                        </button>
                        <div className="mt-4">
                            <h2>Artículos Disponibles</h2>
                            {isLoading && articulos.length === 0 && <p>Cargando artículos...</p>}
                            {!isLoading && articulosFiltrados.length === 0 && (
                                <p>{busqueda ? 'No se encontraron artículos con ese nombre.' : 'Aún no se han subido artículos.'}</p>
                            )}
                            {articulosFiltrados.length > 0 && (
                                <ul className="list-group">
                                    {articulosFiltrados.map((articulo) => (
                                        <li key={articulo._id} className="list-group-item d-flex justify-content-between align-items-center">
                                            <a
                                                href={articulo.downloadURL}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="link-primary text-decoration-none"
                                                onClick={(e) => { e.preventDefault(); handlePreview(articulo.downloadURL); setAutoPreviewLoaded(true); }}
                                                title={`Ver vista previa de ${articulo.name}`}
                                            >
                                                {articulo.name}
                                            </a>
                                            <button
                                                className="btn btn-sm btn-outline-info"
                                                onClick={() => {handlePreview(articulo.downloadURL); setAutoPreviewLoaded(true);}}
                                                title="Mostrar vista previa"
                                            >
                                                Vista Previa
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <h3 className="mb-3 mt-3">Vista Previa</h3>
                        {selectedPdfUrl ? (
                            <div className='mb-5' style={{ border: '1px solid #eee', height: '80vh', overflowY: 'auto', background: '#f8f9fa' }}>
                                <Document
                                    file={selectedPdfUrl}
                                    onLoadSuccess={onDocumentLoadSuccess}
                                    onLoadError={(pdfError) => {
                                        console.error('Error al cargar el PDF para vista previa:', pdfError);
                                        setError(`Error al cargar vista previa: ${pdfError.message}. Verifique la URL y la configuración CORS si el problema persiste.`);
                                        setSelectedPdfUrl(null);
                                    }}
                                    loading="Cargando previsualización del PDF..."
                                    error="No se pudo cargar la vista previa del PDF."
                                    options={documentOptions}
                                >
                                    {Array.from(new Array(numPages || 0), (el, index) => (
                                        <Page
                                            key={`page_${index + 1}`}
                                            pageNumber={index + 1}
                                            width={document.querySelector('.col-md-6')?.getBoundingClientRect().width ? Math.max(document.querySelector('.col-md-6').getBoundingClientRect().width * 0.9, 250) : 300}
                                            renderTextLayer={true}
                                            renderAnnotationLayer={true}
                                        />
                                    ))}
                                </Document>
                                {numPages && <p className="text-center mt-2 small">Total de páginas: {numPages}</p>}
                            </div>
                        ) : (
                            <div className="text-center p-5 border rounded bg-light" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <p className="text-muted">
                                    {isLoading ? "Cargando artículos..." : (articulos.length === 0 ? "No hay artículos para mostrar." : "Selecciona un artículo o espera la carga automática.")}
                                </p>
                            </div>
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