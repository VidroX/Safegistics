import * as React from "react";
import {useTranslation} from "../i18n";
import {makeStyles} from "@material-ui/core/styles";
import useTitle from "../hooks/useTitle";
import {Grid, Paper, TextField, Typography} from "@material-ui/core";
import LoadingSubmitButton from "./loadingSubmitButton";
import {FormEvent} from "react";
import {useMutation} from "@apollo/react-hooks";
import {Token, User} from "../interfaces/appState";
import {USER_LOGIN} from "../apollo/queries/user";
import {config} from "../../config";
import Cookies from "js-cookie";
import {UserPayload} from "../interfaces/user";
import jwt from "jsonwebtoken";
import {GraphQLError} from "graphql";


interface AuthVariables {
    email: string;
    password: string;
}

interface AuthState {
    login: {
        user: User | null,
        token: Token | null
    }
}


const Auth = () => {
    const {t, i18n} = useTranslation();

    const [emailField, setEmailField] = React.useState({
        error: false,
        errorText: "",
        value: ""
    });
    const [passwordField, setPasswordField] = React.useState({
        error: false,
        errorText: "",
        value: ""
    });

    const [login, { data, loading, error }] = useMutation<AuthState, AuthVariables>(USER_LOGIN);

    useTitle(t('auth.login'));
    const classes = useStyles();

    React.useEffect(() => {
        if (!loading && !error && data != null) {
            const user = data.login.user;
            const token = data.login.token?.accessToken;

            if (token != null && user != null) {
                try {
                    const decodedSession = jwt.decode(token);
                    const sessionUser = (decodedSession as any).identity as UserPayload;

                    if (sessionUser != null) {
                        Cookies.set(config.general.sessionCookie, token, {
                            path: '/'
                        });
                        window.location.reload();
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        }
    }, [loading, error, data]);

    const resetFields = () => {
        setEmailField({
            error: false,
            errorText: "",
            value: emailField.value
        });
        setPasswordField({
            error: false,
            errorText: "",
            value: passwordField.value
        });
    };

    const checkFields = () => {
        if (emailField.value.length < 1) {
            setEmailField({
                error: true,
                errorText: t('common.fieldEmpty'),
                value: emailField.value
            });
        }
        if (passwordField.value.length < 1) {
            setPasswordField({
                error: true,
                errorText: t('common.fieldEmpty'),
                value: passwordField.value
            });
        }
        if (passwordField.value.length < 6 && passwordField.value.length > 0) {
            setPasswordField({
                error: true,
                errorText: t('auth.smallPassword'),
                value: passwordField.value
            });
        }
    };

    const onAuthSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        resetFields();
        checkFields();

        if(!loading && emailField.value.length > 0 && passwordField.value.length > 5) {
            try {
                await login({
                    variables: {
                        email: emailField.value,
                        password: passwordField.value
                    }
                });
            } catch (loginError) {
                loginError.graphQLErrors?.map((err: GraphQLError) => {
                    switch (err.extensions?.code) {
                        case 100: {
                            setEmailField({
                                error: true,
                                errorText: t('auth.errors.incorrectEmailOrPassword'),
                                value: emailField.value
                            });
                            setPasswordField({
                                error: true,
                                errorText: t('auth.errors.incorrectEmailOrPassword'),
                                value: passwordField.value
                            });
                            break;
                        }
                        default: {
                            setEmailField({
                                error: true,
                                errorText: t('auth.errors.incorrectEmailOrPassword'),
                                value: emailField.value
                            });
                            setPasswordField({
                                error: true,
                                errorText: t('auth.errors.incorrectEmailOrPassword'),
                                value: passwordField.value
                            });
                            break;
                        }
                    }
                });
            }
        }
    };

    return (
        <Grid
            container
            className={classes.authRoot}
            direction="column"
            alignItems="center"
            justify="center"
        >
            <Grid item xs={3} className={classes.authContainer}>
                <div className={classes.topBar}>
                    <Typography variant="h5">
                        { t("auth.login") } / { config.general.appName }
                    </Typography>
                </div>
                <Paper className={classes.authBody}>
                    <form method="POST" onSubmit={onAuthSubmit}>
                        <TextField
                            required
                            autoFocus
                            className={classes.field}
                            error={emailField.error}
                            value={emailField.value}
                            onChange={(e) => {
                                setEmailField({
                                    error: false,
                                    errorText: "",
                                    value: e.target.value
                                });
                            }}
                            color="secondary"
                            label="E-Mail"
                            type="email"
                            helperText={emailField.errorText}
                            variant="outlined"
                        />
                        <TextField
                            required
                            error={passwordField.error}
                            value={passwordField.value}
                            className={classes.field}
                            onChange={(e) => {
                                setPasswordField({
                                    error: false,
                                    errorText: "",
                                    value: e.target.value
                                });
                            }}
                            color="secondary"
                            label={t('auth.password')}
                            type="password"
                            helperText={passwordField.errorText}
                            variant="outlined"
                        />
                        <LoadingSubmitButton title={t('auth.signIn')} loadingStatus={loading} />
                    </form>
                </Paper>
            </Grid>
        </Grid>
    );
};


const useStyles = makeStyles((theme) => ({
    authRoot: {
        minHeight: '100vh'
    },
    authContainer: {
        minWidth: 400,
    },
    field: {
        width: '100%',
        marginBottom: 8
    },
    authBody: {
        width: '100%',
        background: theme.palette.background.paper,
        padding: 16,
        borderRadius: 6,
        elevation: 4
    },
    topBar: {
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
}));

export default Auth;
