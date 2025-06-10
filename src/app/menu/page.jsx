import HomeClient from './Home';

export const metadata = {
  title: "Bienvenido a ADONIS",
  description: "Aplicación para la identificación de plantas medicinales mediante redes neuronales.",
};

const HomePage = () => {
  return <HomeClient />;
};

export default HomePage;