'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/app/lib/authContext';
import MenuNav from '@/Components/menuNav';
import Fooder from '@/Components/fooder';

const PrincipalPage = () => {
    const { user, loading, theme } = useAuth();
    const router = useRouter();

    const [result, setResult] = useState(null);
    const videoRef = useRef(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [facingMode, setFacingMode] = useState("user");
    const [image, setImage] = useState(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
        else if (loading) {
            router.push('/menu');
        }
    }, [loading, user, router]);

    const predictFrame = useCallback(async () => {
        if (!videoRef.current || !isCameraOpen || !videoRef.current.videoWidth) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async (blob) => {
            if (!blob) return;
            const formData = new FormData();
            formData.append('image', blob);
            try {
                const response = await fetch('http://localhost:8000/predict/', { method: 'POST', body: formData });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ detail: 'Error en el backend sin JSON.' }));
                    throw new Error(errorData.detail || `Error ${response.status}`);
                }
                const data = await response.json();
                setResult(data.result);
            } catch (error) {
                setResult(`Error: ${error.message}`);
            }
        }, 'image/jpeg');
    }, [isCameraOpen]);
    
    const openCamera = useCallback(async (mode = facingMode) => {
        try {
            const constraints = { video: { facingMode: mode, width: { ideal: 640 }, height: { ideal: 480 } } };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraOpen(true);
            setImage(null);
        } catch (error) {
            console.error("Error accessing camera:", error);
            setResult(`Error accessing camera: ${error.message}. Please check permissions.`);
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

    useEffect(() => {
        let animationFrameId;
        const runPredictions = () => {
            predictFrame();
            animationFrameId = requestAnimationFrame(runPredictions);
        };
        if (isCameraOpen) {
            runPredictions();
        }
        return () => cancelAnimationFrame(animationFrameId);
    }, [isCameraOpen, predictFrame]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            if(isCameraOpen) closeCamera();
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setImage(file);
            if(isCameraOpen) closeCamera();
        }
    };

    const handleDragOver = (e) => e.preventDefault();

    const handleSubmit = async () => {
        if (!image && !isCameraOpen) {
             setResult("Por favor, sube una imagen o abre la cámara primero.");
             return;
        }
        if (isCameraOpen && videoRef.current) {
            predictFrame();
            return;
        }
        if (image) {
            const formData = new FormData();
            formData.append('image', image);
            try {
                const response = await fetch('http://localhost:8000/predict/', { method: 'POST', body: formData });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ detail: 'Error en el backend sin JSON.' }));
                    throw new Error(errorData.detail || `Error ${response.status}`);
                }
                const data = await response.json();
                setResult(data.result);
            } catch (error) {
                console.error('Error:', error);
                setResult("Ocurrió un error: " + error.message);
            }
        }
    };

    if (loading) {
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
    
    const pageStyle = theme ? {
        backgroundColor: theme.appBackgroundColor,
        color: theme.appTextColor,
    } : {};
    const buttonStyle = theme ? {
        backgroundColor: theme.buttonBackground,
        color: theme.buttonText,
        border: 'none'
    } : {};

    return (
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