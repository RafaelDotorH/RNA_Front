"use client"
import '../CSS/general.css';
import React, { useState, useRef } from 'react';
import MenuNav from '../components/menuNav';
import Fooder from '../components/fooder';

function Principal() {
    const [image, setImage] = useState(null);
    const [result, setResult] = useState(null);
    const videoRef = useRef(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const openCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
            setIsCameraOpen(true);
        } catch (error) {
            console.error("Error al acceder a la cámara:", error);
        }
    };

    const closeCamera = () => {
        const stream = videoRef.current.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    };


    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await fetch('http://localhost:8000/predict/', { // Corrected endpoint
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error en el backend'); // Use 'detail' for FastAPI errors
            }

            const data = await response.json();
            setResult(data.result);

        } catch (error) {
            console.error('Error:', error);
            alert("Ocurrió un error: " + error.message);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) {
            setImage(e.dataTransfer.files[0]);
        }
    };

    const takePhoto = () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
            setImage(new File([blob], "photo.jpg", { type: 'image/jpeg' }));
        }, 'image/jpeg'); // Specify the MIME type for toBlob
    };


    return (
        <>
            <div className='container-fluid bg-light min-vh-100 d-flex flex-column align-items-center justify-content-center'>
                <div className='card p-4 shadow-lg' style={{ maxWidth: '600px', width: '100%' }}>
                    <div className={`camera-container ${isCameraOpen ? 'd-block' : 'd-none'} position-relative`}>
                        <video ref={videoRef} autoPlay className='w-100'></video>
                        <div className='d-flex justify-content-between p-2 bg-dark position-absolute bottom-0 w-100'>
                            <button onClick={takePhoto} className='btn btn-success'>Tomar foto</button>
                            <button onClick={closeCamera} className='btn btn-danger'>Cerrar cámara</button>
                        </div>
                    </div>
                    <div className='drop-area-container mb-4' style={{ display: isCameraOpen ? 'none' : 'block' }}>
                        <div className='drop-area border rounded p-4 d-flex flex-column align-items-center'
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}>
                            <input type="file" id="fileElem" multiple accept="image/*" className='d-none' onChange={handleImageChange} />
                            <label htmlFor="fileElem" className='btn btn-outline-primary'>
                                <p className='m-0'><strong>Sube tu imagen</strong></p>
                                <p className='m-0'>o deja fotos aquí</p>
                            </label>
                            <div id="gallery" className='mt-3 d-flex flex-wrap justify-content-center'></div>
                        </div>
                    </div>
                    <div className='d-grid gap-2'>
                        <button onClick={openCamera} className='btn btn-primary mt-3' style={{ display: isCameraOpen ? 'none' : 'block' }}>Abrir cámara</button>
                         {/* Display the uploaded/captured image */}
                        {image && (
                            <img
                                src={URL.createObjectURL(image)}
                                alt="Uploaded or Captured"
                                style={{ maxWidth: '100%', maxHeight: '200px' }}
                            />
                        )}
                        <button onClick={handleSubmit} disabled={!image} className='btn btn-primary'>
                            Evaluar imagen
                        </button>
                    </div>
                    {result && (
                        <div className='mt-4'>
                            <h2>Resultado:</h2>
                            <p>{result}</p>
                        </div>
                    )}
                </div>

            </div>
            <MenuNav />
            <Fooder />
        </>
    );
};

export default Principal;