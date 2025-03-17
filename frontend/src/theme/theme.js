import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#1e1e1e',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          '&.asset-card': {
            backgroundColor: '#ffffff',
            '& .MuiTypography-root': {
              color: '#000000',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
        head: {
          backgroundColor: '#1e1e1e',
          fontWeight: 600,
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.page-title': {
            color: '#ffffff',
          },
          '&.section-title': {
            color: '#ffffff',
          },
        },
      },
    },
  },
}); 