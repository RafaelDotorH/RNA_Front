const baseColors = {
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

const roleStyles = {
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
  moderador: {
    theme: {
      appBackgroundColor: '#f0f7f0',
      appTextColor: '#2f3e2f',
      appPrimaryColor: baseColors.successGreen,
      appSecondaryColor: baseColors.warningYellow,
      buttonBackground: baseColors.successGreen,
      buttonText: baseColors.white,
    },
  },
  administrador: {
    theme: {
      appBackgroundColor: '#fdeeee',
      appTextColor: baseColors.black,
      appPrimaryColor: baseColors.dangerRed,
      appSecondaryColor: baseColors.black,
      buttonBackground: baseColors.dangerRed,
      buttonText: baseColors.white,
    },
  },
  default: {
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

export const getThemeForRole = (role) => {
  const styles = roleStyles[role] || roleStyles.default;
  return styles.theme;
};

export default roleStyles;