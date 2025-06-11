import HomeClient from './Home';

export const metadata = { // Metadatos para la página de inicio
  title: "Bienvenido a ADONIS",
  description: "Aplicación para la identificación de plantas medicinales mediante redes neuronales.",
};

const HomePage = () => { // Componente de la página de inicio
  return <HomeClient />;
};

export default HomePage; // Exporta el componente de la página de inicio