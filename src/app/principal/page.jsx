"use client"
import '../CSS/general.css';
import React, { useState, useRef, useEffect } from 'react';
import MenuNav from '../../Components/menuNav';
import Fooder from '../../Components/fooder';

function Principal() {
    const [result, setResult] = useState(null);
    const videoRef = useRef(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [facingMode, setFacingMode] = useState("user");
    const [image, setImage] = useState(null); // State to hold the uploaded/dragged image

    const switchCamera = async () => {
        const newFacingMode = facingMode === "user" ? "environment" : "user";
        setFacingMode(newFacingMode);

        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }

        await openCamera(newFacingMode);
    };

    const openCamera = async (mode = facingMode) => {
        try {
            const constraints = {
                video: {
                    facingMode: mode,
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoRef.current.srcObject = stream;
            setIsCameraOpen(true);
            setImage(null); // Clear any previously uploaded image

        } catch (error) {
            console.error("Error accessing camera:", error);
            alert(`Error accessing camera: ${error.message}. Please check permissions.`);
        }
    };

    const closeCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    };

    const predictFrame = async () => {
        if (!videoRef.current || !isCameraOpen) {
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
            if (!blob) {
                console.error("Failed to create blob from canvas");
                return;
            }

            const formData = new FormData();
            formData.append('image', blob);

            try {
                const response = await fetch('http://localhost:8000/predict/', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Error en el backend');
                }

                const data = await response.json();
                setResult(data.result);

            } catch (error) {
                setResult(`Error: ${error.message}`);
            }
        }, 'image/jpeg');
    };


    useEffect(() => {
        let animationFrameId;

        const runPredictions = () => {
            predictFrame();
            animationFrameId = requestAnimationFrame(runPredictions);
        };

        if (isCameraOpen) {
            runPredictions();
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isCameraOpen]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setIsCameraOpen(false); // Close the camera when an image is uploaded
            closeCamera(); // Make sure the camera stream is stopped
        }
    };

    const handleDrop = (e) => {
        e.preventDefault(); // Prevent default behavior (opening the file in the browser)
        const file = e.dataTransfer.files[0];
        if (file) {
             setImage(file);
            setIsCameraOpen(false); // Close the camera
            closeCamera();  // Ensure camera stream is stopped
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Prevent default behavior
    };

    const handleSubmit = async () => {
        if (!image) {
            alert("Please upload or capture an image first.");
            return;
        }
        const formData = new FormData();
		formData.append('image', image);

		try {
			const response = await fetch('http://localhost:8000/predict/', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
                const errorData = await response.json();
				throw new Error(errorData.detail || 'Error en el backend');
			}

			const data = await response.json();
			setResult(data.result);

		} catch (error) {
			console.error('Error:', error);
			alert("Ocurrió un error: " + error.message);
		}
    };

    return (
        <>
            <div className='container-fluid bg-light min-vh-100 d-flex flex-column align-items-center justify-content-center'>
                <div className='card p-4 shadow-lg' style={{ maxWidth: '600px', width: '100%' }}>

                     {/* Drag and Drop Area */}
                    <div
                        className="drop-area border rounded p-4 mb-3"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        style={{ textAlign: 'center' }}
                    >
                        <p>Drag and drop an image here, or click to select a file</p>
                        <input
                            type="file"
                            id="fileInput"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="fileInput" className="btn btn-secondary">
                            Select Image
                        </label>
                    </div>

                    {/* Display Uploaded Image */}
                     {image && (
                        <div className="mb-3">
                            <img src={URL.createObjectURL(image)} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                        </div>
                    )}

                    <div className={`camera-container ${isCameraOpen ? 'd-block' : 'd-none'} position-relative`}>
                        <video ref={videoRef} autoPlay className='w-100'></video>
                        <div className='d-flex justify-content-between p-2 bg-dark position-absolute bottom-0 w-100'>
                            <button onClick={switchCamera} className='btn btn-warning'>Cambiar cámara</button>
                            <button onClick={closeCamera} className='btn btn-danger'>Cerrar cámara</button>
                        </div>
                    </div>
                    <div className='d-grid gap-2'>
                        <button onClick={openCamera} className='btn btn-primary mt-3' style={{ display: isCameraOpen ? 'none' : 'block' }}>Abrir cámara</button>
                         <button onClick={handleSubmit} disabled={!image && !isCameraOpen} className='btn btn-primary'>
                            Evaluar
                        </button>
                        {result && (
                            <div className='mt-4'>
                                <h2>Resultado:</h2>
                                <p>{result}</p>
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

export default Principal;