"use client"
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import MenuNav from '@/Components/menuNav';
import Fooder from '@/Components/fooder';
import { useAuth } from '@/app/lib/authContext';

const Nosotros = () => { // Componente para la página "Sobre Nosotros"
    const { user, loading, theme } = useAuth();
    const router = useRouter();

    useEffect(() => { // Efecto para redirigir al usuario a la página de menú si está cargando
            if (loading) {
                router.push('/menu');
            }
        }, [loading, user, router]);

    if (loading) { // Si la autenticación está cargando, muestra un mensaje de carga
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
    
    return ( // Renderiza el contenido de la página "Sobre Nosotros"
        <>
            <div className='container pt-5 mb-5'>
                <div className='row'>
                    <div className='col-12'>
                        <h1>Sobre Nosotros</h1>
                        <hr/>

                        <section className='mb-4'>
                            <h2>Misión</h2>
                            <p>Nuestra misión es proporcionar soluciones innovadoras y de alta calidad que mejoren la vida de nuestros clientes y contribuyan al desarrollo sostenible de la sociedad.</p>
                        </section>

                        <section className='mb-4'>
                            <h2>Visión</h2>
                            <p>Ser líderes en el mercado global, reconocidos por nuestra excelencia, integridad y compromiso con la satisfacción del cliente y la responsabilidad social.</p>
                        </section>

                        <section>
                            <h2>Objetivos</h2>
                            <ul>
                                <li key="obj1">Desarrollar productos y servicios que superen las expectativas de nuestros clientes.</li>
                                <li key="obj2">Fomentar un ambiente de trabajo inclusivo y colaborativo.</li>
                                <li key="obj3">Promover prácticas empresariales sostenibles y responsables.</li>
                                <li key="obj4">Impulsar la innovación y la mejora continua en todos nuestros procesos.</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
            <MenuNav />
            <Fooder />
        </>
    );
};

export default Nosotros;