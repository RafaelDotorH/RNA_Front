// src/app/login/page.jsx
'use client'
import React, { useState, useCallback } from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import PersonOutline from '@mui/icons-material/PersonOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Email, MarkEmailReadOutlined, HourglassEmptyOutlined } from '@mui/icons-material'; // Iconos adicionales
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../CSS/login.css'; // Tus estilos CSS personalizados

// Importaciones de Firebase
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification
} from 'firebase/auth';
import { auth } from '../lib/firebasedb';


function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState(''); // Para login, este será el email
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true); // true para login, false para registro
    const [email, setEmail] = useState(''); // Para registro
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); // Para mensajes de éxito/informativos
    const router = useRouter();

    const handleClickShowPassword = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    const handleMouseDownPassword = useCallback((event) => {
        event.preventDefault();
    }, []);


    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccessMessage('');

        if (isLogin) {
            // --- Lógica de Inicio de Sesión con Firebase ---
            if (!username || !password) {
                setError("Por favor, ingresa tu correo y contraseña.");
                return;
            }
            try {
                const userCredential = await signInWithEmailAndPassword(auth, username, password);
                const user = userCredential.user;
                console.log('Usuario inició sesión con Firebase:', user);

                if (user.emailVerified) {
                    // Obtener el ID Token de Firebase
                    const idToken = await user.getIdToken(true); // true para forzar la actualización del token

                    // Llamar a la API de backend para establecer la sesión/cookie con el token personalizado
                    const apiResponse = await fetch('/api/auth/login', { // Asegúrate que esta es tu ruta API correcta
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ username, idToken }),
                    });

                    const apiData = await apiResponse.json();

                    if (apiResponse.ok) {
                        setSuccessMessage(apiData.message || 'Inicio de sesión exitoso. Redirigiendo...');
                        router.push('/menu');
                    } else {
                        setError(apiData.message || 'Error del servidor al procesar el inicio de sesión.');
                    }
                } else {
                    setError('Tu correo electrónico no ha sido verificado. Por favor, revisa tu bandeja de entrada (y spam o no deseado) para el correo de verificación.');
                }

            } catch (err) {
                console.error("Error al iniciar sesión con Firebase:", err.code, err.message);
                let friendlyMessage = 'Error al iniciar sesión. Verifica tus credenciales.';
                if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                    friendlyMessage = 'Correo electrónico o contraseña incorrectos.';
                } else if (err.code === 'auth/invalid-email') {
                    friendlyMessage = 'El formato del correo electrónico no es válido.';
                } else if (err.code === 'auth/too-many-requests') {
                    friendlyMessage = 'Demasiados intentos fallidos. Intenta más tarde o recupera tu contraseña.';
                }
                setError(friendlyMessage);
            }
        } else {
            // --- Lógica de Registro con Firebase ---
            if (!username || !email || !password || !confirmPassword) {
                setError("Por favor, completa todos los campos para registrarte.");
                return;
            }
            if (password !== confirmPassword) {
                setError("Las contraseñas no coinciden.");
                return;
            }
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                console.log('Usuario registrado con Firebase:', user);

                await sendEmailVerification(user);
                setSuccessMessage('¡Registro exitoso! Se ha enviado un correo de verificación a tu dirección. Por favor, verifica tu correo antes de iniciar sesión.');
                setIsLogin(true);
                setUsername(email);
                setEmail('');
                setPassword('');
                setConfirmPassword('');

            } catch (err) {
                console.error("Error al registrar con Firebase:", err.code, err.message);
                let friendlyMessage = 'Error al registrarse. Inténtalo de nuevo.';
                if (err.code === 'auth/email-already-in-use') {
                    friendlyMessage = 'Este correo electrónico ya está registrado.';
                } else if (err.code === 'auth/invalid-email') {
                    friendlyMessage = 'El formato del correo electrónico no es válido.';
                } else if (err.code === 'auth/weak-password') {
                    friendlyMessage = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
                }
                setError(friendlyMessage);
            }
        }
    };

    // Opcional: Función para reenviar el correo de verificación
    const handleResendVerificationEmail = async () => {
        setError('');
        setSuccessMessage('');
        if (auth.currentUser) {
            try {
                await sendEmailVerification(auth.currentUser);
                setSuccessMessage('Se ha reenviado el correo de verificación. Revisa tu bandeja de entrada.');
            } catch (err) {
                console.error("Error al reenviar correo de verificación:", err);
                setError('No se pudo reenviar el correo de verificación. Inténtalo más tarde.');
            }
        } else {
            setError('Debes iniciar sesión primero para reenviar el correo de verificación.');
        }
    };


    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setSuccessMessage('');
        // Limpiar campos al cambiar de modo, excepto quizás username si quieres que persista
        // setUsername('');
        setPassword('');
        setEmail('');
        setConfirmPassword('');
    };


    return (
        <Box className="my-component">
            <form onSubmit={handleSubmit} className="card-3d-wrap">
                <div className="card-3d-wrapper">
                    <div className="card-front">
                        <div className="center-wrap">
                            <div className="section center">
                                <Typography variant="h4" gutterBottom>
                                    {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                                </Typography>

                                {error && <Typography color="error" sx={{ textAlign: 'center', mb: 1, mt:1 }}>{error}</Typography>}
                                {successMessage && <Typography color="success.main" sx={{ textAlign: 'center', mb: 1, mt:1 }}>{successMessage}</Typography>}


                                <TextField
                                    label={isLogin ? "Correo Electrónico" : "Nombre de Usuario"}
                                    variant="outlined"
                                    margin="normal"
                                    fullWidth
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                {isLogin ? <Email /> : <PersonOutline />}
                                            </InputAdornment>
                                        ),
                                    }}
                                    required={isLogin} // El correo es requerido para login
                                />

                                {!isLogin && (
                                    <TextField
                                        label="Correo Electrónico"
                                        variant="outlined"
                                        margin="normal"
                                        fullWidth
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        InputProps={{
                                            startAdornment:(
                                                <InputAdornment position='start'>
                                                    <Email />
                                                </InputAdornment>
                                            ),
                                        }}
                                        required
                                    />
                                )}

                                <TextField
                                    label="Contraseña"
                                    variant="outlined"
                                    margin="normal"
                                    fullWidth
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockOutlined />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    required
                                />

                                {!isLogin && (
                                    <TextField
                                        label="Confirmar Contraseña"
                                        variant="outlined"
                                        margin="normal"
                                        fullWidth
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockOutlined />
                                                </InputAdornment>
                                            ),
                                        }}
                                        required
                                    />
                                )}
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    className='btn'
                                >
                                    {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta y Verificar'}
                                </Button>

                                <Box mt={1} textAlign="center">
                                    {isLogin ? (
                                        <>
                                            <Typography variant="body2" component="span">
                                                ¿No tienes una cuenta?{' '}
                                            </Typography>
                                            <Button
                                                variant="text"
                                                onClick={toggleMode}
                                            >
                                                Regístrate
                                            </Button>
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                                <Link href="/forgot-password" passHref>
                                                    <Button
                                                        variant="text"
                                                    >
                                                        ¿Olvidaste tu contraseña?
                                                    </Button>
                                                </Link>
                                            </Typography>
                                        </>
                                    ) : (
                                        <>
                                            <Typography variant="body2" component="span">
                                                ¿Ya tienes una cuenta?{' '}
                                            </Typography>
                                            <Button
                                                variant="text"
                                                onClick={toggleMode}
                                            >
                                                Inicia Sesión
                                            </Button>
                                        </>
                                    )}
                                </Box>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </Box>
    );
}

export default LoginPage;
