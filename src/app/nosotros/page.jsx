"use client"
import React from 'react';
import MenuNav from '@/Components/menuNav';
import Fooder from '@/Components/fooder';


const Nosotros = () => {
    return (
        <>
            <div className='container'>
                <div className='row'>
                <h1>Sobre Nosotros</h1>

                <section>
                    <h2>Misión</h2>
                    <p>Nuestra misión es proporcionar soluciones innovadoras y de alta calidad que mejoren la vida de nuestros clientes y contribuyan al desarrollo sostenible de la sociedad.</p>
                </section>

                <section>
                    <h2>Visión</h2>
                    <p>Ser líderes en el mercado global, reconocidos por nuestra excelencia, integridad y compromiso con la satisfacción del cliente y la responsabilidad social.</p>
                </section>

                <section>
                    <h2>Objetivos</h2>
                    <ul>
                        <li>Desarrollar productos y servicios que superen las expectativas de nuestros clientes.</li>
                        <li>Fomentar un ambiente de trabajo inclusivo y colaborativo.</li>
                        <li>Promover prácticas empresariales sostenibles y responsables.</li>
                        <li>Impulsar la innovación y la mejora continua en todos nuestros procesos.</li>
                    </ul>
                </section>
                </div>
            </div>
            <MenuNav />
            <Fooder />
        </>
    );
};

export default Nosotros;