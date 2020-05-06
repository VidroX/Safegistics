import { createMuiTheme } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#fff', // #7aafff
        },
        secondary: {
            main: '#e36374', // #2286c3 #4380cb #e36374
        },
        error: {
            main: red.A400,
        },
        background: {
            default: '#fafafa'
        },
    },
    overrides: {
        MuiButton: {
            textPrimary: {
                color: '#e36374'
            },
            root: {
                borderRadius: 6
            }
        },
    }
});

export default theme;
