'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/app/lib/authContext'; // Importa el hook de autenticación personalizado
import MenuNav from '@/Components/menuNav';
import Fooder from '@/Components/fooder';

const PrincipalPage = () => { // Componente principal de la página de evaluación
    const { user, loading, theme } = useAuth(); // Obtiene el usuario autenticado, el estado de carga y el tema desde el contexto de autenticación
    const router = useRouter(); // Hook de enrutamiento de Next.js para redirigir al usuario

    const [result, setResult] = useState(null); // Estado para almacenar el resultado de la predicción
    const videoRef = useRef(null); // Referencia al elemento de video para la cámara
    const [isCameraOpen, setIsCameraOpen] = useState(false); // Estado para manejar si la cámara está abierta o no
    const [facingMode, setFacingMode] = useState("user"); // Estado para manejar el modo de la cámara (frontal o trasera)
    const [image, setImage] = useState(null); // Estado para almacenar la imagen cargada por el usuario

    useEffect(() => { // Efecto para redirigir al usuario a la página de menú si está cargando
        if (loading) {
            router.push('/menu');
        }
    }, [loading, user, router]);

    const predictFrame = useCallback(async () => { // Función para capturar un fotograma del video y enviar una solicitud de predicción al backend
        if (!videoRef.current || !isCameraOpen || !videoRef.current.videoWidth) return; // Verifica si el video está listo y la cámara está abierta
        const canvas = document.createElement('canvas'); // Crea un canvas para dibujar el fotograma del video
        canvas.width = videoRef.current.videoWidth; // Establece el ancho del canvas al ancho del video
        canvas.height = videoRef.current.videoHeight; // Establece la altura del canvas a la altura del video
        const ctx = canvas.getContext('2d'); // Obtiene el contexto 2D del canvas
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height); // Dibuja el fotograma actual del video en el canvas
        canvas.toBlob(async (blob) => { // Convierte el contenido del canvas a un Blob
            if (!blob) return;
            const formData = new FormData(); // Crea un FormData para enviar la imagen al backend
            formData.append('image', blob);
            try {
                const response = await fetch('http://localhost:8000/predict/', { method: 'POST', body: formData }); // Envía una solicitud POST al backend con la imagen capturada
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ detail: 'Error en el backend sin JSON.' })); // Maneja errores de la respuesta del backend
                    throw new Error(errorData.detail || `Error ${response.status}`);
                }
                const data = await response.json(); // Convierte la respuesta del backend a JSON
                setResult(data.result); // Actualiza el estado del resultado con la respuesta del backend
            } catch (error) { // Maneja errores de la solicitud
                setResult(`Error: ${error.message}`);
            }
        }, 'image/jpeg');
    }, [isCameraOpen]); // Dependencia para que la función se actualice si cambia el estado de la cámara
    
    const openCamera = useCallback(async (mode = facingMode) => { // Función para abrir la cámara y configurar el video
        try {
            const constraints = { video: { facingMode: mode, width: { ideal: 640 }, height: { ideal: 480 } } }; // Define las restricciones de la cámara
            const stream = await navigator.mediaDevices.getUserMedia(constraints); // Solicita acceso a la cámara del usuario
            if (videoRef.current) { // Si la referencia al video existe, asigna el stream de la cámara
                videoRef.current.srcObject = stream;
            }
            setIsCameraOpen(true);
            setImage(null);
        } catch (error) { // Maneja errores al intentar acceder a la cámara
            console.error("Error accessing camera:", error);
            setResult(`Error accessing camera: ${error.message}. Please check permissions.`);
        }
    }, [facingMode]); // Dependencia para que la función se actualice si cambia el modo de la cámara

    const closeCamera = useCallback(() => { // Función para cerrar la cámara y detener los tracks del stream
        if (videoRef.current && videoRef.current.srcObject) { // Verifica si el video tiene un stream activo
            const tracks = videoRef.current.srcObject.getTracks(); // Obtiene los tracks del stream de video
            tracks.forEach(track => track.stop()); // Detiene cada track del stream
            videoRef.current.srcObject = null; // Limpia la referencia al stream del video
        }
        setIsCameraOpen(false); // Actualiza el estado para indicar que la cámara está cerrada
    }, []);

    const switchCamera = useCallback(async () => { // Función para cambiar entre la cámara frontal y trasera
        const newFacingMode = facingMode === "user" ? "environment" : "user"; // Cambia el modo de la cámara
        setFacingMode(newFacingMode); // Actualiza el estado del modo de la cámara
        closeCamera(); // Cierra la cámara actual
        await openCamera(newFacingMode); // Abre la cámara con el nuevo modo
    }, [facingMode, closeCamera, openCamera]); // Dependencias para que la función se actualice si cambia el modo de la cámara o las funciones de abrir y cerrar la cámara

    useEffect(() => { // Efecto para iniciar la captura de fotogramas si la cámara está abierta
        let animationFrameId;
        const runPredictions = () => {
            predictFrame();
            animationFrameId = requestAnimationFrame(runPredictions); // Solicita el siguiente fotograma para la predicción
        };
        if (isCameraOpen) {
            runPredictions();
        }
        return () => cancelAnimationFrame(animationFrameId); // Limpia el requestAnimationFrame al desmontar el componente o cerrar la cámara
    }, [isCameraOpen, predictFrame]);

    const handleImageChange = (e) => { // Función para manejar el cambio de imagen cuando el usuario selecciona un archivo
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            if(isCameraOpen) closeCamera();
        }
    };

    const handleDrop = (e) => { // Función para manejar el evento de arrastrar y soltar una imagen en el área designada
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setImage(file);
            if(isCameraOpen) closeCamera();
        }
    };

    const handleDragOver = (e) => e.preventDefault(); // Función para prevenir el comportamiento por defecto al arrastrar un archivo sobre el área de carga

    const handleSubmit = async () => { // Función para manejar el envío de la imagen o la captura de fotogramas de la cámara
        if (!image && !isCameraOpen) {
             setResult("Por favor, sube una imagen o abre la cámara primero.");
             return;
        }
        if (isCameraOpen && videoRef.current) { // Si la cámara está abierta, captura un fotograma y envía la solicitud de predicción
            predictFrame();
            return;
        }
        if (image) { // Si hay una imagen seleccionada, crea un FormData y envía la solicitud de predicción al backend
            const formData = new FormData();
            formData.append('image', image);
            try {
                const response = await fetch('http://localhost:8000/predict/', { method: 'POST', body: formData }); // Envía una solicitud POST al backend con la imagen seleccionada
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ detail: 'Error en el backend sin JSON.' })); // Maneja errores de la respuesta del backend
                    throw new Error(errorData.detail || `Error ${response.status}`); // Lanza un error si la respuesta no es exitosa
                }
                const data = await response.json(); //  Convierte la respuesta del backend a JSON
                setResult(data.result); // Actualiza el estado del resultado con la respuesta del backend
            } catch (error) { // Maneja errores de la solicitud
                console.error('Error:', error);
                setResult("Ocurrió un error: " + error.message);
            }
        }
    };

    if (loading) { // Si la página está cargando, muestra un mensaje de carga
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
    
    if (!user) { // Si el usuario no está autenticado, no muestra nada
        return null;
    }
    
    const pageStyle = theme ? { // Estilos para la página principal basados en el tema
        backgroundColor: theme.appBackgroundColor,
        color: theme.appTextColor,
    } : {};
    const buttonStyle = theme ? { // Estilos para los botones basados en el tema
        backgroundColor: theme.buttonBackground,
        color: theme.buttonText,
        border: 'none'
    } : {};

    return ( // Renderiza el contenido de la página principal
        <>
            <div style={pageStyle} className='container-fluid min-vh-100 d-flex flex-column align-items-center justify-content-center pt-5 pb-5'>
                <div className='card p-3 p-md-4 shadow-lg' style={{ maxWidth: '600px', width: '90%' }}>
                    <div className="drop-area border rounded p-3 mb-3" onDrop={handleDrop} onDragOver={handleDragOver} style={{ textAlign: 'center' }}>
                        <p className="mb-2">Arrastra y suelta una imagen aquí</p>
                        <input type="file" id="fileInput" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                        <label htmlFor="fileInput" className="btn btn-secondary btn-sm">
                            Seleccionar Imagen
                        </label>
                    </div>

                    {image && (
                        <div className="mb-3 text-center">
                            <img src={URL.createObjectURL(image)} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} />
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
                        <button 
                            onClick={isCameraOpen ? closeCamera : openCamera} 
                            className='btn mt-2'
                            style={buttonStyle}
                        >
                            {isCameraOpen ? 'Cerrar Cámara' : 'Abrir Cámara'}
                        </button>
                        <button 
                            onClick={handleSubmit} 
                            disabled={!image && !isCameraOpen} 
                            className='btn' 
                            style={buttonStyle}
                        >
                            Evaluar
                        </button>
                        {result && (
                            <div className='mt-3 p-3 border rounded bg-light text-dark'>
                                <h5>Resultado:</h5>
                                <p className="mb-0">{typeof result === 'object' ? JSON.stringify(result) : result}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <MenuNav />
            <Fooder />
        </>
    );
}

export default PrincipalPage;