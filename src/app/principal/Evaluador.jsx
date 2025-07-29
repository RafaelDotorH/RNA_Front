'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Hook para la navegación entre páginas en Next.js.
import { useAuth } from '@/app/lib/authContext'; // Hook personalizado para obtener datos de autenticación y tema.
import MenuNav from '@/Components/menuNav'; // Componente de navegación (menú).
import Fooder from '@/Components/fooder'; // Componente del pie de página.
import '@/app/CSS/dynamicStyles'; // Importación de hojas de estilo.

const PrincipalPage = () => {
    // Estados relacionados con la autenticación y el tema, obtenidos del contexto.
    const { user, loading, theme } = useAuth();
    // Hook para manejar la redirección de rutas.
    const router = useRouter();

    // Estado para el rol de administrador
    const [isAdmin, setIsAdmin] = useState(false);

    // Estados para la funcionalidad de predicción.
    const [result, setResult] = useState(null); // Almacena el resultado de la predicción de la API.
    const [image, setImage] = useState(null); // Almacena el archivo de imagen subido por el usuario.
    const [models, setModels] = useState([]); // Almacena la lista de modelos disponibles obtenidos de la API.
    const [selectedModel, setSelectedModel] = useState(''); // Almacena el nombre del modelo seleccionado por el usuario.

    // Estados y referencias para la funcionalidad de la cámara.
    const videoRef = useRef(null); // Referencia al elemento <video> para mostrar la cámara.
    const [isCameraOpen, setIsCameraOpen] = useState(false); // Booleano que indica si la cámara está activa.
    const [facingMode, setFacingMode] = useState("user"); // Controla si se usa la cámara frontal ('user') o trasera ('environment').

    // Estados para la funcionalidad de subida de nuevos modelos.
    const [modelFile, setModelFile] = useState(null); // Almacena el archivo del modelo (.h5, .keras) a subir.
    const [configFile, setConfigFile] = useState(null); // Almacena el archivo de configuración (.json) a subir.
    const [uploadStatus, setUploadStatus] = useState(''); // Mensaje para mostrar el estado de la subida del modelo.

    const API_BASE_URL = 'http://localhost:8000';

    useEffect(() => {
        if (loading) {
            router.push('/menu');
        }
    }, [loading, user, router]);

    // **NUEVO**: useEffect para obtener el rol del usuario desde el token.
    useEffect(() => {
        const fetchUserRole = async () => {
            const token = localStorage.getItem('token');
            if (token && user) {
                try {
                    const response = await fetch('/api/user/role', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setIsAdmin(data.role === 'administrador');
                    } else {
                        setIsAdmin(false);
                        console.error('Error al verificar el rol del usuario.');
                    }
                } catch (error) {
                    setIsAdmin(false);
                    console.error('Error en la llamada a la API de rol:', error);
                }
            } else {
                setIsAdmin(false);
            }
        };

        if (!loading) {
            fetchUserRole();
        }
    }, [user, loading]);


    const fetchModels = useCallback(async () => {
        setResult(null); // Limpia cualquier resultado de predicción anterior.
        try {
            const response = await fetch(`${API_BASE_URL}/models/`);
            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }
            const data = await response.json();
            setModels(data.models || []); // Actualiza el estado con la lista de modelos.
            // Si hay modelos, selecciona el primero por defecto.
            if (data.models && data.models.length > 0) {
                setSelectedModel(data.models[0]);
            } else {
                setSelectedModel('');
            }
        } catch (error) {
            console.error("Error al obtener los modelos:", error);
            setResult(`Error al obtener modelos: ${error.message}`);
        }
    }, []); // No tiene dependencias, por lo que solo se crea una vez.

    useEffect(() => {
        fetchModels();
    }, [fetchModels]);


    const performPrediction = useCallback(async (formData) => {
        if (!selectedModel) {
            setResult("Por favor, selecciona un modelo antes de evaluar.");
            return;
        }
        if (!isCameraOpen) {
            setResult("Evaluando...");
        }

        try {
            const response = await fetch(`${API_BASE_URL}/predict/${selectedModel}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Error en el backend sin JSON.' }));
                throw new Error(errorData.detail || `Error ${response.status}`);
            }

            const data = await response.json();

            setTimeout(() => {
                setResult(data.result);
            }, 1000);

        } catch (error) {
            console.error('Error en la predicción:', error);
            setResult(`Ocurrió un error: ${error.message}`);
        }
    }, [selectedModel, isCameraOpen]);

    // --- MANEJO DE LA CÁMARA ---

    const predictFrame = useCallback(async () => {
        if (!videoRef.current || !isCameraOpen || !videoRef.current.videoWidth || !selectedModel) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
            if (!blob) return;
            const formData = new FormData();
            formData.append('image', blob, 'frame.jpg');
            await performPrediction(formData);
        }, 'image/jpeg');

    }, [isCameraOpen, selectedModel, performPrediction]);

    useEffect(() => {
        if (isCameraOpen) {
            const intervalId = setInterval(() => {
                predictFrame();
            }, 2000);
            return () => clearInterval(intervalId);
        }
    }, [isCameraOpen, predictFrame]);

    const openCamera = useCallback(async (mode = facingMode) => {
        try {
            const constraints = { video: { facingMode: mode, width: { ideal: 640 }, height: { ideal: 480 } } };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraOpen(true);
            setImage(null);
            setResult(null);
        } catch (error) {
            console.error("Error al acceder a la cámara:", error);
            setResult(`Error al acceder a la cámara: ${error.message}. Por favor, revisa los permisos.`);
        }
    }, [facingMode]);

    const closeCamera = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    }, []);

    const switchCamera = useCallback(async () => {
        const newFacingMode = facingMode === "user" ? "environment" : "user";
        setFacingMode(newFacingMode);
        closeCamera();
        await openCamera(newFacingMode);
    }, [facingMode, closeCamera, openCamera]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            if (isCameraOpen) closeCamera();
            setResult(null);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setImage(file);
            if (isCameraOpen) closeCamera();
            setResult(null);
        }
    };

    const handleDragOver = (e) => e.preventDefault();

    const handleSubmit = async () => {
        if (!image) {
            setResult("Por favor, sube una imagen primero.");
            return;
        }
        const formData = new FormData();
        formData.append('image', image);
        await performPrediction(formData);
    };

    // --- MANEJO DE SUBIDA DE MODELOS ---
    const handleModelFileChange = (e) => setModelFile(e.target.files[0]);
    const handleConfigFileChange = (e) => setConfigFile(e.target.files[0]);

    const handleUploadModel = async () => {
        if (!isAdmin) {
            setUploadStatus('Acción no permitida.');
            return;
        }

        if (!modelFile || !configFile) {
            setUploadStatus('Por favor, selecciona tanto el archivo del modelo como el de configuración.');
            return;
        }

        const modelName = modelFile.name.replace(/\.(h5|keras)$/, '');
        const configName = configFile.name.replace(/\.json$/, '');
        if (modelName !== configName) {
            setUploadStatus('Error: El nombre base del modelo y del archivo de configuración deben ser idénticos.');
            return;
        }

        setUploadStatus('Subiendo modelo...');
        const formData = new FormData();
        formData.append('model_file', modelFile);
        formData.append('config_file', configFile);

        try {
            const response = await fetch(`${API_BASE_URL}/models/`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || `Error ${response.status}`);
            }

            setUploadStatus(data.message || 'Modelo subido con éxito.');
            setModelFile(null);
            setConfigFile(null);
            document.getElementById('modelFile').value = '';
            document.getElementById('configFile').value = '';
            await fetchModels();
        } catch (error) {
            console.error('Error al subir el modelo:', error);
            setUploadStatus(`Error al subir: ${error.message}`);
        }
    };


    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme?.appBackgroundColor, color: theme?.appTextColor }}><h1>Cargando...</h1></div>;
    }
    if (!user) {
        return null;
    }

    const pageStyle = theme ? { backgroundColor: theme.appBackgroundColor, color: theme.appTextColor } : {};
    const buttonStyle = theme ? { backgroundColor: theme.buttonBackground, color: theme.buttonText, border: 'none' } : {};

    return (
        <>
            <div style={pageStyle} className='container-fluid min-vh-100 d-flex flex-column align-items-center justify-content-center pt-5 pb-5'>

                <div className='card p-3 p-md-4 shadow-lg' style={{ maxWidth: '600px', width: '90%' }}>
                    <h3 className="text-center mb-3">Evaluador de Modelos</h3>

                    <div className="mb-3">
                        <label htmlFor="model-select" className="form-label">Selecciona un Modelo:</label>
                        <select id="model-select" className="form-select" value={selectedModel} onChange={e => setSelectedModel(e.target.value)} disabled={models.length === 0}>
                            {models.length > 0 ? (
                                models.map(model => <option key={model} value={model}>{model}</option>)
                            ) : (
                                <option>No hay modelos disponibles</option>
                            )}
                        </select>
                    </div>

                    {!isCameraOpen && (
                        <div className="drop-area border rounded p-3 mb-3" onDrop={handleDrop} onDragOver={handleDragOver} style={{ textAlign: 'center', borderStyle: 'dotted', borderColor: theme?.borderColor || '#ccc' }}>
                            <p className="mb-2">Arrastra y suelta una imagen aquí</p>
                            <input type="file" id="fileInput" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                            <label htmlFor="fileInput" className="btn btn-secondary btn-sm" style={buttonStyle}>
                                Seleccionar Imagen
                            </label>
                            <br></br>
                            {image && !isCameraOpen && (
                                <div className="mb-3 d-flex justify-content-center">
                                    <img src={URL.createObjectURL(image)} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px', marginTop: '15px' }} />
                                </div>
                            )}
                        </div>
                    )}

                    <div className={`camera-container ${isCameraOpen ? 'd-block' : 'd-none'} position-relative mb-3`}>
                        <video ref={videoRef} autoPlay playsInline className='w-100 border rounded'></video>
                        <div className='d-flex justify-content-around p-2 bg-dark position-absolute bottom-0 start-0 w-100'>
                            <button onClick={switchCamera} className='btn btn-warning btn-sm'>Cambiar</button>
                            <button onClick={closeCamera} className='btn btn-danger btn-sm'>Cerrar</button>
                        </div>
                    </div>

                    <div className='d-grid gap-2'>
                        <button onClick={isCameraOpen ? closeCamera : openCamera} className='btn mt-2' style={buttonStyle}>
                            {isCameraOpen ? 'Cerrar Cámara' : 'Abrir Cámara'}
                        </button>
                        <button onClick={handleSubmit} disabled={!image || isCameraOpen} className='btn' style={buttonStyle}>
                            Evaluar Imagen Subida
                        </button>
                        {result && (
                            <div className='mt-3 p-3 border rounded bg-light text-dark'>
                                <h5>Resultado:</h5>
                                <p className="mb-0" style={{ wordWrap: 'break-word' }}>{result}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* **MODIFICADO**: Se usa el estado 'isAdmin' para la renderización condicional. */}
                {isAdmin && (
                    <div className='card p-3 p-md-4 shadow-lg mt-4' style={{ maxWidth: '600px', width: '90%' }}>
                        <h4 className="text-center mb-3">Subir Nuevo Modelo</h4>
                        <p className="text-muted text-center small">Esta sección es para administradores.</p>
                        <div className="mb-3">
                            <label htmlFor="modelFile" className="form-label">Archivo de Modelo (.h5, .keras)</label>
                            <input type="file" className="form-control" id="modelFile" accept=".h5,.keras" onChange={handleModelFileChange} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="configFile" className="form-label">Archivo de Configuración (.json)</label>
                            <input type="file" className="form-control" id="configFile" accept=".json" onChange={handleConfigFileChange} />
                        </div>
                        <button onClick={handleUploadModel} className="btn btn-primary" style={buttonStyle} disabled={!modelFile || !configFile}>
                            Subir Modelo
                        </button>
                        {uploadStatus && (
                            <div className='mt-3 p-2 border rounded bg-light text-dark text-center'>
                                <p className="mb-0">{uploadStatus}</p>
                            </div>
                        )}
                    </div>
                )}

            </div>
            <MenuNav />
            <Fooder />
        </>
    );
}

export default PrincipalPage;