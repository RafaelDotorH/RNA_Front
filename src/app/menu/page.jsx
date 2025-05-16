"use client"
import React, { useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import LocomotiveScroll from 'locomotive-scroll';
import MenuNav from '../../Components/menuNav';
import Fooder from '../../Components/fooder';
import { useRouter } from 'next/navigation';

gsap.registerPlugin(ScrollTrigger);

const Menu = () => {
    const router = useRouter();
    const containerRef = useRef(null);
    const bodyRef = useRef(document.body);

    useEffect(() => {
        let scroller;

        if (containerRef.current) {
            scroller = new LocomotiveScroll({
                el: containerRef.current,
                smooth: true,
            });

            scroller.on("scroll", ScrollTrigger.update);

            ScrollTrigger.scrollerProxy(containerRef.current, {
                scrollTop: function (value) {
                    return arguments.length ? scroller.scrollTo(value, 0, 0) : scroller.scroll.instance.scroll.y;
                },
                getBoundingClientRect: function () {
                    return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
                },
            });

            ScrollTrigger.addEventListener("refresh", () => scroller.update());
            ScrollTrigger.refresh();

            const sections = containerRef.current.querySelectorAll("section");

            sections.forEach((section, i) => {
                const bgColor = section.dataset.bgcolor;
                const textColor = section.dataset.textcolor;

                ScrollTrigger.create({
                    trigger: section,
                    scroller: containerRef.current,
                    start: "top center",
                    end: "bottom center", 
                    onEnter: () => {
                        gsap.to(bodyRef.current, {
                            backgroundColor: bgColor,
                            color: textColor,
                            overwrite: "auto",
                            duration: 0.3
                        });
                    },
                    onLeaveBack: () => {
                        if (sections[i - 1]) {
                          const prevBg = sections[i - 1].dataset.bgcolor;
                          const prevText = sections[i - 1].dataset.textcolor;
                          gsap.to(bodyRef.current, {
                              backgroundColor: prevBg,
                              color: prevText,
                              overwrite: "auto",
                              duration: 0.3
                          });
                        }
                    },
                    // markers: true // Descomenta para ver los markers
                });
            });
        }

        return () => {
            if (scroller) {
                scroller.destroy();
                ScrollTrigger.killAll();
            }
        };
    }, []);

    return (
        <div>
            <MenuNav/>
            <div className="container" ref={containerRef} style={{ height: 'auto' }}>
                <section data-bgcolor="#bcb8ad" data-textcolor="#032f35" style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <h1>Sección 1</h1>
                    <p>Contenido de la sección 1</p>
                </section>
                <section data-bgcolor="#eacbd1" data-textcolor="#536fae" style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <h2>Sección 2</h2>
                    <p>Contenido de la sección 2</p>
                </section>
            </div>
            <Fooder/>
        </div>
    );
};

export default Menu;