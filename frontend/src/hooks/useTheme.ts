import {createTheme} from '@mui/material/styles';

const theme: ReturnType<typeof createTheme> = createTheme({
    typography: {
        fontFamily: 'Poppins, sans-serif',
    },
});

export default theme;