'use client'
import React, { useState, useCallback } from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import PersonOutline from '@mui/icons-material/PersonOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Email } from '@mui/icons-material';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CircularProgress from '@mui/material/CircularProgress';
import '../CSS/login.css';

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification
} from 'firebase/auth';
import { auth } from '../lib/firebasedb';


function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [emailLogin, setEmailLogin] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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
        setIsLoading(true);

        if (isLogin) {
            if (!email || !password) {
                setError("Por favor, ingresa tu correo y contraseña.");
                setIsLoading(false);
                return;
            }
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                if (user.emailVerified) {
                    const idToken = await user.getIdToken(true);
                    const apiResponse = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, idToken }),
                    });

                    const apiData = await apiResponse.json();

                    if (apiResponse.ok) {
                        setSuccessMessage(apiData.message);
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
            } finally {
                setIsLoading(false);
            }
        } else {
            if (!username || !email || !password || !confirmPassword) {
                setError("Por favor, completa todos los campos para registrarte.");
                setIsLoading(false);
                return;
            }
            if (email !== emailLogin) {
                setError("Los correos electrónicos no coinciden.");
                setIsLoading(false);
                return;
            }
            if (password !== confirmPassword) {
                setError("Las contraseñas no coinciden.");
                setIsLoading(false);
                return;
            }
            try {
                const apiResponseMongo = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, email }),
                });
                const apiDataMongo = await apiResponseMongo.json();
                if (apiResponseMongo.ok) {
                    console.log(apiDataMongo.message);
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;
                    console.log('Usuario registrado con Firebase:', user);

                    await sendEmailVerification(user);

                    setSuccessMessage('¡Registro exitoso! Se ha enviado un correo de verificación a tu dirección. Por favor, verifica tu correo antes de iniciar sesión.');
                    setIsLogin(true);
                    setUsername('');
                    setEmail(email);
                    setPassword('');
                    setConfirmPassword('');
                } else {
                    console.log(apiDataMongo.message || 'Error del servidor al procesar el registro.');
                    setError(apiDataMongo.message || 'Error del servidor al procesar el registro.');
                }

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
            } finally {
                setIsLoading(false);
            }
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setSuccessMessage('');
        setPassword('');
        setEmail('');
        setConfirmPassword('');
        setEmailLogin('');
    };


    return (
        <Box className="my-component">
            {/* Aplicar la clase condicional aquí */}
            <form onSubmit={handleSubmit} className={`card-3d-wrap ${!isLogin ? 'register-active' : ''}`}>
                <div className="card-3d-wrapper">
                    <div className="card-front">
                        <div className="center-wrap">
                            <div className="section center">
                                <Typography variant="h4" gutterBottom>
                                    {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                                </Typography>

                                {error && <Typography color="error" sx={{ textAlign: 'center', mb: 1, mt: 1 }}>{error}</Typography>}
                                {successMessage && <Typography color="success.main" sx={{ textAlign: 'center', mb: 1, mt: 1 }}>{successMessage}</Typography>}

                                {!isLogin && (
                                    <TextField
                                        label="Nombre de Usuario"
                                        variant="outlined"
                                        margin="normal"
                                        fullWidth
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonOutline />
                                                </InputAdornment>
                                            ),
                                        }}
                                        required
                                        disabled={isLoading}
                                    />
                                )}


                                 {!isLogin && (
                                <TextField
                                    label="Correo Electrónico"
                                    variant="outlined"
                                    margin="normal"
                                    fullWidth
                                    type="email"
                                    value={emailLogin}
                                    onChange={(e) => setEmailLogin(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position='start'>
                                                <Email />
                                            </InputAdornment>
                                        ),
                                    }}
                                    required
                                    disabled={isLoading}
                                />
                                 )}

                                <TextField
                                    label={isLogin ? "Correo Electrónico" : "Confirmar Correo Electrónico"}
                                    variant="outlined"
                                    margin="normal"
                                    fullWidth
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position='start'>
                                                <Email />
                                            </InputAdornment>
                                        ),
                                    }}
                                    required
                                    disabled={isLoading}
                                />


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
                                                    disabled={isLoading}
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    required
                                    disabled={isLoading}
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
                                            ), endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleClickShowPassword}
                                                        onMouseDown={handleMouseDownPassword}
                                                        edge="end"
                                                        disabled={isLoading}
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        required
                                        disabled={isLoading}
                                    />
                                )}
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    className='btn'
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <CircularProgress size={24} sx={{ color: 'white' }} />
                                    ) : (
                                        isLogin ? 'Iniciar Sesión' : 'Crear Cuenta y Verificar'
                                    )}
                                </Button>

                                <Box mt={1} textAlign="center">
                                    {isLogin ? (
                                        <>
                                            <Typography variant="body2" sx={{ mt: 2 }}>
                                                <Button
                                                    variant="text"
                                                    onClick={toggleMode}
                                                    disabled={isLoading}
                                                >
                                                    ¿No tienes una cuenta?{' '}Regístrate
                                                </Button>
                                            </Typography>

                                            <Typography variant="body2" sx={{ mt: 2 }}>
                                                <Link href="/forgot-password" passHref>
                                                    <Button
                                                        variant="text"
                                                        disabled={isLoading}
                                                    >
                                                        ¿Olvidaste tu contraseña?
                                                    </Button>
                                                </Link>
                                            </Typography>
                                        </>
                                    ) : (
                                        <>
                                            <Typography variant="body2" component="span">
                                                <Button
                                                    variant="text"
                                                    onClick={toggleMode}
                                                    disabled={isLoading}
                                                >
                                                    ¿Ya tienes una cuenta?{' '}Inicia Sesión
                                                </Button>
                                            </Typography>                                        </>
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