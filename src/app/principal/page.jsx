import PrincipalClient from './Evaluador';

export const metadata = { // Metadatos para la página principal
    title: "Evaluacion de imagenes - ADONIS",
    description: "El corazón de la aplicación ADONIS. Comienza tu análisis aquí.",
};

const PrincipalPage = () => { // Componente de la página principal
    return <PrincipalClient />;
};

export default PrincipalPage;