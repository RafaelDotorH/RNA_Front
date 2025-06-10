'use client'
import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Email } from '@mui/icons-material'; // Icono de Email
import InputAdornment from '@mui/material/InputAdornment';

import { sendPasswordResetEmail, fetchSignInMethodsForEmail  } from 'firebase/auth';
import { auth } from '../lib/firebasedb'; // Ajusta la ruta a tu config de Firebase


function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const backgroundImageUrl = 'https://static.vecteezy.com/system/resources/previews/016/407/729/non_2x/modern-cybersecurity-technology-background-with-padlock-vector.jpg';

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!email) {
            setError('Por favor, ingresa tu dirección de correo electrónico.');
            return;
        }
        setIsLoading(true);

        try {
            const checkEmailResponse = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
            const checkEmailData = await checkEmailResponse.json();

            if (!checkEmailResponse.ok) {
                throw new Error(checkEmailData.message || 'Error al verificar el correo en la base de datos.');
            }

            if (!checkEmailData.exists) {
                console.log(`Email NO encontrado en MongoDB según la API: ${email}`);
                setError('No se encontró ninguna cuenta registrada con este correo electrónico.');
                setIsLoading(false);
                return;
            }

            await sendPasswordResetEmail(auth, email);
            // Mensaje de éxito
            setSuccessMessage('Tu solicitud ha sido procesada. Recibirás un correo con instrucciones para restablecer tu contraseña en breve. Por favor, revisa tu bandeja de entrada y la carpeta de spam(correo no deseado).');
            setEmail('');
            setTimeout(() => router.push('/'), 5500);
        } catch (err) {
            console.error("Error en el proceso de restablecimiento:", err.code, err.message);
            let friendlyMessage = 'Error al intentar restablecer la contraseña.';
            if (err.code === 'auth/invalid-email') {
                friendlyMessage = 'El formato del correo electrónico no es válido.';
            }
            else if (err.code === 'auth/user-not-found') {
                 friendlyMessage = 'No se encontró ninguna cuenta con este correo electrónico (verificación secundaria).';
            }
            setError(friendlyMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                p: 3,
                backgroundImage: `url(${backgroundImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    width: '100%',
                    maxWidth: '400px',
                    p: { xs: 2, sm: 4 },
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                    backgroundColor: 'white', // Ejemplo de color de fondo de la tarjeta
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2, // Espacio entre elementos
                }}
            >
                <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', color: 'black' }}>
                    Restablecer Contraseña
                </Typography>

                {error && <Typography color="error" sx={{ textAlign: 'center' }}>{error}</Typography>}
                {successMessage && <Typography color="success.main" sx={{ textAlign: 'center' }}>{successMessage}</Typography>}

                <TextField
                    label="Correo Electrónico"
                    variant="outlined"
                    fullWidth
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Email />
                            </InputAdornment>
                        ),
                    }}
                    required
                />

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                >
                    Enviar Correo de Restablecimiento
                </Button>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Link href="/login" passHref>
                        <Button variant="text" /*sx={{ color: '#ffeba7' }}*/>
                            Volver a Iniciar Sesión
                        </Button>
                    </Link>
                </Box>
            </Box>
        </Box>
    );
}

export default ForgotPasswordPage;
