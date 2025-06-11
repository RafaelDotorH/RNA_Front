import NosotrosClient from './Informacion';

export const metadata = { // Metadatos para la página "Nosotros"
    title: "Sobre Nosotros - ADONIS",
    description: "Conoce más sobre el proyecto ADONIS, nuestra misión y el equipo detrás de la aplicación.",
};

const NosotrosPage = () => { // Componente de la página "Nosotros"
    return <NosotrosClient />;
};

export default NosotrosPage; // Exporta el componente de la página "Nosotros"