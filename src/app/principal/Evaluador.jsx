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

    // Función para capturar un fotograma del video y enviarlo para predicción.
    const predictFrame = useCallback(async () => {
        // Se asegura de que la cámara esté lista y un modelo esté seleccionado.
        if (!videoRef.current || !isCameraOpen || !videoRef.current.videoWidth || !selectedModel) return;

        // Usa un canvas para dibujar el fotograma actual del video.
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Convierte el canvas a un archivo (Blob) y lo envía para predicción.
        canvas.toBlob(async (blob) => {
            if (!blob) return;
            const formData = new FormData();
            formData.append('image', blob, 'frame.jpg');
            await performPrediction(formData); // Reutiliza la función de predicción.
        }, 'image/jpeg');

    }, [isCameraOpen, selectedModel, performPrediction]);

    // Efecto que crea un bucle de animación para predecir continuamente cuando la cámara está abierta.
    useEffect(() => {
        if (isCameraOpen) {
            // Se establece un intervalo que llama a predictFrame cada 2 segundos
            const intervalId = setInterval(() => {
                predictFrame();
            }, 2000); // 2000 milisegundos = 2 segundos

            // Función de limpieza para detener el intervalo si la cámara se cierra
            return () => clearInterval(intervalId);
        }
    }, [isCameraOpen, predictFrame]);

    // Abre la cámara del dispositivo.
    const openCamera = useCallback(async (mode = facingMode) => {
        try {
            const constraints = { video: { facingMode: mode, width: { ideal: 640 }, height: { ideal: 480 } } };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            if (videoRef.current) {
                videoRef.current.srcObject = stream; // Asigna el stream de video al elemento <video>.
            }
            setIsCameraOpen(true);
            setImage(null); // Limpia cualquier imagen subida.
            setResult(null);
        } catch (error) {
            console.error("Error al acceder a la cámara:", error);
            setResult(`Error al acceder a la cámara: ${error.message}. Por favor, revisa los permisos.`);
        }
    }, [facingMode]);

    // Cierra la cámara y libera los recursos.
    const closeCamera = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop()); // Detiene cada track del stream de video.
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    }, []);

    // Cambia entre la cámara frontal y la trasera.
    const switchCamera = useCallback(async () => {
        const newFacingMode = facingMode === "user" ? "environment" : "user";
        setFacingMode(newFacingMode);
        closeCamera(); // Cierra la actual.
        await openCamera(newFacingMode); // Abre la nueva.
    }, [facingMode, closeCamera, openCamera]);

    // Se activa cuando el usuario selecciona una imagen desde el input de archivo.
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            if(isCameraOpen) closeCamera(); // Cierra la cámara si estaba abierta.
            setResult(null);
        }
    };

    // Se activa cuando el usuario suelta una imagen en el área de "drop".
    const handleDrop = (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto del navegador.
        const file = e.dataTransfer.files[0];
        if (file) {
            setImage(file);
            if(isCameraOpen) closeCamera();
            setResult(null);
        }
    };

    // Previene el comportamiento por defecto cuando un archivo es arrastrado sobre el área.
    const handleDragOver = (e) => e.preventDefault();

    // Envía la imagen subida para su evaluación.
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
    // Maneja la selección del archivo de modelo.
    const handleModelFileChange = (e) => setModelFile(e.target.files[0]);
    // Maneja la selección del archivo de configuración.
    const handleConfigFileChange = (e) => setConfigFile(e.target.files[0]);

    // Se encarga de subir el nuevo modelo y su configuración a la API.
    const handleUploadModel = async () => {
        if (!modelFile || !configFile) {
            setUploadStatus('Por favor, selecciona tanto el archivo del modelo como el de configuración.');
            return;
        }
        
        // Validación simple para asegurar que los nombres base coincidan.
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
            const response = await fetch(`${API_BASE_URL}/upload-model/`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || `Error ${response.status}`);
            }
            
            setUploadStatus(data.message || 'Modelo subido con éxito.');
            // Limpia los campos de archivo después de la subida.
            setModelFile(null);
            setConfigFile(null);
            document.getElementById('modelFile').value = '';
            document.getElementById('configFile').value = '';
            await fetchModels(); // Actualiza la lista de modelos disponibles.
        } catch (error) {
            console.error('Error al subir el modelo:', error);
            setUploadStatus(`Error al subir: ${error.message}`);
        }
    };

    // --- RENDERIZADO DEL COMPONENTE (JSX) ---

    // Muestra un mensaje de carga mientras se verifica la autenticación.
    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme?.appBackgroundColor, color: theme?.appTextColor }}><h1>Cargando...</h1></div>;
    }
    // No renderiza nada si el usuario no está autenticado.
    if (!user) {
        return null;
    }

    // Estilos dinámicos basados en el tema del contexto.
    const pageStyle = theme ? { backgroundColor: theme.appBackgroundColor, color: theme.appTextColor } : {};
    const buttonStyle = theme ? { backgroundColor: theme.buttonBackground, color: theme.buttonText, border: 'none' } : {};

    return (
        <>
            <div style={pageStyle} className='container-fluid min-vh-100 d-flex flex-column align-items-center justify-content-center pt-5 pb-5'>
                
                {/* --- TARJETA DE PREDICCIÓN --- */}
                <div className='card p-3 p-md-4 shadow-lg' style={{ maxWidth: '600px', width: '90%' }}>
                    <h3 className="text-center mb-3">Evaluador de Modelos</h3>

                    {/* Selector de Modelo */}
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

                    {/* Área para subir imagen (se oculta si la cámara está abierta) */}
                    {!isCameraOpen && (
                        <div className="drop-area border rounded p-3 mb-3" onDrop={handleDrop} onDragOver={handleDragOver} style={{ textAlign: 'center' }}>
                            <p className="mb-2">Arrastra y suelta una imagen aquí</p>
                            <input type="file" id="fileInput" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                            <label htmlFor="fileInput" className="btn btn-secondary btn-sm" style={buttonStyle}>
                                Seleccionar Imagen
                            </label>
                        </div>
                    )}

                    {/* Previsualización de la imagen subida */}
                    {image && !isCameraOpen && (
                        <div className="mb-3 text-center">
                            <img src={URL.createObjectURL(image)} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} />
                        </div>
                    )}

                    {/* Contenedor del video de la cámara */}
                    <div className={`camera-container ${isCameraOpen ? 'd-block' : 'd-none'} position-relative mb-3`}>
                        <video ref={videoRef} autoPlay playsInline className='w-100 border rounded'></video>
                        <div className='d-flex justify-content-around p-2 bg-dark position-absolute bottom-0 start-0 w-100'>
                            <button onClick={switchCamera} className='btn btn-warning btn-sm'>Cambiar</button>
                            <button onClick={closeCamera} className='btn btn-danger btn-sm'>Cerrar</button>
                        </div>
                    </div>
                    
                    {/* Botones de acción principales */}
                    <div className='d-grid gap-2'>
                        <button onClick={isCameraOpen ? closeCamera : openCamera} className='btn mt-2' style={buttonStyle}>
                            {isCameraOpen ? 'Cerrar Cámara' : 'Abrir Cámara'}
                        </button>
                        <button onClick={handleSubmit} disabled={!image || isCameraOpen} className='btn' style={buttonStyle}>
                            Evaluar Imagen Subida
                        </button>
                        {/* Muestra el resultado de la predicción si existe */}
                        {result && (
                            <div className='mt-3 p-3 border rounded bg-light text-dark'>
                                <h5>Resultado:</h5>
                                <p className="mb-0" style={{ wordWrap: 'break-word' }}>{result}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- TARJETA PARA SUBIR MODELOS --- */}
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
                    {/* Muestra el estado de la subida del modelo */}
                    {uploadStatus && (
                        <div className='mt-3 p-2 border rounded bg-light text-dark text-center'>
                            <p className="mb-0">{uploadStatus}</p>
                        </div>
                    )}
                </div>

            </div>
            {/* Renderiza los componentes de navegación y pie de página */}
            <MenuNav />
            <Fooder />
        </>
    );
}

export default PrincipalPage;
