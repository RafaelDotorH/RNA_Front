import LoginClient from './Login';

export const metadata = { // Metadatos para la página de inicio de sesión
    title: "Iniciar Sesión - ADONIS",
    description: "Ingresa a tu cuenta de ADONIS para acceder a la biblioteca y todas las herramientas.",
};

const LoginPage = () => { // Componente de la página de inicio de sesión
    return <LoginClient />;
};

export default LoginPage; // Exporta el componente de la página de inicio de sesión