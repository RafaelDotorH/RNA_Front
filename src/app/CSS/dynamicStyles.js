const baseColors = { // Define colores base de la aplicación
  white: '#FFFFFF',
  black: '#000000',
  lightGray: '#f8f9fa',
  mediumGray: '#6c757d',
  darkGray: '#343a40',
  primaryBlue: '#0d6efd',
  successGreen: '#198754',
  warningYellow: '#ffc107',
  dangerRed: '#dc3545',
  infoCyan: '#0dcaf0',
};

const roleStyles = { // Define estilos específicos para cada rol de usuario
  cliente: {
    theme: {
      appBackgroundColor: baseColors.white,
      appTextColor: baseColors.darkGray,
      appPrimaryColor: baseColors.primaryBlue,
      appSecondaryColor: baseColors.infoCyan,
      buttonBackground: baseColors.primaryBlue,
      buttonText: baseColors.white,
    },
  },
  administrador: { // Estilos para el rol de administrador
    theme: {
      appBackgroundColor: '#fdeeee',
      appTextColor: baseColors.black,
      appPrimaryColor: baseColors.dangerRed,
      appSecondaryColor: baseColors.black,
      buttonBackground: baseColors.dangerRed,
      buttonText: baseColors.white,
    },
  },
  default: { // Estilos por defecto para roles no especificados
    theme: {
      appBackgroundColor: baseColors.white,
      appTextColor: baseColors.darkGray,
      appPrimaryColor: baseColors.mediumGray,
      appSecondaryColor: baseColors.lightGray,
      buttonBackground: baseColors.mediumGray,
      buttonText: baseColors.white,
    },
  },
};

export const getThemeForRole = (role) => { // Función para obtener el tema basado en el rol del usuario
  const styles = roleStyles[role] || roleStyles.default;
  return styles.theme;
};

export default roleStyles;