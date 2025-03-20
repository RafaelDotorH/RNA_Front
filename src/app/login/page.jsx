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
import { Email } from '@mui/icons-material';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../CSS/login.css';


function LoginPage() {  // <--  Nombre del componente: LoginPage
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleClickShowPassword = useCallback(() => {
        setShowPassword(!showPassword);
    }, []);

    const handleMouseDownPassword = useCallback((event) => {
        event.preventDefault();
    }, []);


    const handleSubmit = async (event) => { // <-- async AQUI es OBLIGATORIO
        event.preventDefault();
        setError('');

        if (isLogin) {
            // Login
            try {
                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                if (response.ok) {
                    router.push('/menu');
                } else {
                    const data = await response.json();
                    setError(data.message || 'Error al iniciar sesión');
                }
            } catch (error) {
                setError('Error de conexión');
            }

        } else {
            // Registro
            if (password !== confirmPassword) {
                setError("Las contraseñas no coinciden.");
                return;
            }

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, email, password }),
                });

                if (response.ok) {
                    setIsLogin(true); // Cambia al modo login
                    alert('Registro exitoso. Ahora puedes iniciar sesión.'); // O un modal, notificación, etc.

                } else {
                    const data = await response.json();
                    setError(data.message || 'Error al registrarse');
                }
            } catch (error) {
                setError('Error de conexión');
            }
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setUsername('');
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

                                {error && <Typography color="error">{error}</Typography>}

                                <TextField
                                    label="Usuario"
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
                                                     <Email/>
                                                </InputAdornment>
                                            )
                                        }}
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
                                    />
                                )}
                                <Button type="submit" variant="contained" color="primary" fullWidth className='btn'> {/* <-- Usa Button de Material UI, type="submit" */}
                                    {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                                </Button>

                                <Box mt={2} textAlign="center">
                                    {isLogin ? (
                                        <>
                                            <Typography variant="body2" className='link' >
                                                ¿No tienes una cuenta?{' '}
                                                <Button color="primary" onClick={toggleMode}>
                                                    Regístrate
                                               </Button>
                                            </Typography>
                                            <Typography variant="body2">
                                                <Link href="/forgot-password" className='link'>
                                                   ¿Olvidaste tu contraseña?
                                                </Link>
                                            </Typography>
                                        </>
                                    ) : (
                                        <Typography variant="body2" className='link'>
                                            ¿Ya tienes una cuenta?{' '}
                                            <Button color="primary" onClick={toggleMode}>
                                                Inicia Sesión
                                            </Button>
                                        </Typography>
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

export default LoginPage; // <-- Nombre del componente: LoginPage