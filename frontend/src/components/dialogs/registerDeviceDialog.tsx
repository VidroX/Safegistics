import * as React from "react";
import { useTranslation } from "../../i18n";
import {GraphQLError} from "graphql";
import {useMutation} from "@apollo/react-hooks";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Theme,
    useMediaQuery
} from "@material-ui/core";
import theme from "../../theme";
import {FormEvent} from "react";
import { makeStyles } from '@material-ui/core/styles';
import LoadingSubmitButton from "../loadingSubmitButton";
import {REGISTER_DEVICE} from "../../apollo/queries/devices";
import {DeviceRegisterState, DeviceRegisterVariables} from "../../interfaces/devices";
import DriverSearcher from "../searchers/driverSearcher";

interface RegisterDeviceDialogProps {
    open: boolean;
    onOpen?(): void;
    onClose?(shouldRefresh: boolean): void;
    userId?: string | null;
}

const RegisterDeviceDialog = (props: RegisterDeviceDialogProps) => {
    const { open, onOpen, onClose, userId } = props;

    const { t } = useTranslation();
    const classes = useStyles();

    const [
        registerDevice,
        {
            data,
            loading,
            error
        }
    ] = useMutation<DeviceRegisterState, DeviceRegisterVariables>(REGISTER_DEVICE);

    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [deviceName, setDeviceName] = React.useState({
        error: false,
        errorText: "",
        value: ""
    });

    const [driver, setDriver] = React.useState({
        error: false,
        errorText: "",
        value: "",
        id: userId != null ? userId : ""
    });

    const [deviceId, setDeviceId] = React.useState({
        error: false,
        errorText: "",
        value: ""
    });

    const [password, setPassword] = React.useState({
        error: false,
        errorText: "",
        value: ""
    });

    const [repeatPassword, setRepeatPassword] = React.useState({
        error: false,
        errorText: "",
        value: ""
    });

    React.useEffect(() => {
        clearFields();
    }, [open, userId]);

    React.useEffect(() => {
        if (!loading && !error && data != null) {
            if (onClose) {
                onClose(true);
            }
        }
    }, [data, loading, error]);

    const clearFields = () => {
        setDeviceName({
            error: false,
            errorText: "",
            value: ""
        });
        setDeviceId({
            error: false,
            errorText: "",
            value: ""
        });
        if (userId != null && userId.length > 0) {
            setDriver({
                error: false,
                errorText: "",
                value: "",
                id: userId
            });
        } else {
            setDriver({
                error: false,
                errorText: "",
                value: "",
                id: ""
            });
        }
        setPassword({
            error: false,
            errorText: "",
            value: ""
        });
        setRepeatPassword({
            error: false,
            errorText: "",
            value: ""
        });
    };

    const clearErrors = () => {
        setDeviceId({
            error: false,
            errorText: "",
            value: deviceId.value
        });
        setDeviceName({
            error: false,
            errorText: "",
            value: deviceName.value
        });
        setDriver({
            error: false,
            errorText: "",
            value: driver.value,
            id: driver.id
        });
        setPassword({
            error: false,
            errorText: "",
            value: password.value
        });
        setRepeatPassword({
            error: false,
            errorText: "",
            value: repeatPassword.value
        });
    };

    const checkFields = () => {
        if (deviceId.value.length < 1) {
            setDeviceId({
                error: true,
                errorText: t('common.fieldEmpty'),
                value: deviceId.value
            });
        }
        if (deviceName.value.length < 1) {
            setDeviceName({
                error: true,
                errorText: t('common.fieldEmpty'),
                value: deviceName.value
            });
        }
        if (driver.id.length < 1) {
            setDriver({
                error: true,
                errorText: t('common.fieldEmpty'),
                value: driver.value,
                id: driver.id
            });
        }
        if (password.value.length < 6) {
            setPassword({
                error: true,
                errorText: t('auth.smallPassword'),
                value: password.value
            });
        }
        if (repeatPassword.value.length < 6) {
            setRepeatPassword({
                error: true,
                errorText: t('auth.smallPassword'),
                value: repeatPassword.value
            });
        }
        if (repeatPassword.value !== password.value) {
            setPassword({
                error: true,
                errorText: t('auth.passwordsNotMatch'),
                value: password.value
            });
            setRepeatPassword({
                error: true,
                errorText: t('auth.passwordsNotMatch'),
                value: repeatPassword.value
            });
        }
    };

    const everythingOk = (): boolean =>
        deviceId.value.length > 0 &&
        deviceName.value.length > 0 &&
        driver.id.length > 0 &&
        password.value.length >= 6 &&
        repeatPassword.value.length >= 6 &&
        password.value === repeatPassword.value;

    const handleDeviceRegister = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        await clearErrors();
        await checkFields();

        if (!loading && everythingOk()) {
            try {
                await registerDevice({
                    variables: {
                        deviceId: deviceId.value,
                        devicePass: password.value,
                        name: deviceName.value,
                        driver: driver.id
                    }
                });
            } catch (updateError) {
                updateError.graphQLErrors?.map((err: GraphQLError) => {
                    switch (err.extensions?.code) {
                        case 202: { // ID already exists
                            setDeviceId({
                                error: true,
                                errorText: t('users.deviceAlreadyExists'),
                                value: deviceId.value
                            });
                            break;
                        }
                        case 203: { // Unknown driver
                            setDriver({
                               error: true,
                               errorText: t('users.unknownDriver'),
                               value: driver.value,
                               id: driver.id
                            });
                            break;
                        }
                        default: {
                            alert(t('common.smtWentWrong'));
                            break;
                        }
                    }
                });
            }
        }
    };

    return (
        <Dialog
            fullScreen={fullScreen}
            open={open}
            onClose={() => onClose != null ? onClose(false) : {}}
            onBackdropClick={() => onClose != null ? onClose(false) : {}}
            onEnter={onOpen}
            aria-labelledby="form-dialog-title"
            scroll="body"
        >
            <form className={classes.form} onSubmit={handleDeviceRegister} method="post">
                <DialogTitle>{ t('users.registerDevice') }</DialogTitle>
                <DialogContent className={classes.content}>
                    { (userId == null || userId.length < 1) &&
                        <DriverSearcher
                            required={userId == null || userId.length < 1}
                            error={driver.error}
                            helperText={driver.errorText}
                            onSelect={value => {
                                if (value != null) {
                                    setDriver({
                                        error: false,
                                        errorText: "",
                                        value: value.label,
                                        id: value.id
                                    });
                                } else {
                                    setDriver({
                                        error: false,
                                        errorText: "",
                                        value: "",
                                        id: userId != null ? userId : ""
                                    });
                                }
                            }}
                        />
                    }
                    <TextField
                        className={classes.textField}
                        label={t('users.deviceName')}
                        variant="outlined"
                        value={deviceName.value}
                        color="secondary"
                        required
                        error={deviceName.error}
                        helperText={deviceName.errorText}
                        onChange={(e) => {
                            setDeviceName({
                                error: false,
                                errorText: "",
                                value: e.target.value
                            });
                        }}
                    />
                    <TextField
                        className={classes.textField}
                        label={t('users.deviceId')}
                        variant="outlined"
                        color="secondary"
                        value={deviceId.value}
                        required
                        error={deviceId.error}
                        helperText={deviceId.errorText}
                        onChange={(e) => {
                            setDeviceId({
                                error: false,
                                errorText: "",
                                value: e.target.value
                            });
                        }}
                    />
                    <TextField
                        className={classes.textField}
                        label={t('auth.password')}
                        variant="outlined"
                        value={password.value}
                        required
                        type="password"
                        color="secondary"
                        error={password.error}
                        helperText={password.errorText}
                        onChange={(e) => {
                            setPassword({
                                error: false,
                                errorText: "",
                                value: e.target.value
                            });
                        }}
                    />
                    <TextField
                        className={classes.textField}
                        label={t('auth.repeatPassword')}
                        variant="outlined"
                        value={repeatPassword.value}
                        required
                        type="password"
                        color="secondary"
                        error={repeatPassword.error}
                        helperText={repeatPassword.errorText}
                        onChange={(e) => {
                            setRepeatPassword({
                                error: false,
                                errorText: "",
                                value: e.target.value
                            });
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        autoFocus
                        onClick={() => onClose != null ? onClose(false) : {}}
                        color="secondary">
                        { t('common.cancel') }
                    </Button>
                    <LoadingSubmitButton
                        fullWidth={false}
                        loadingStatus={loading}
                        disabled={!everythingOk()}
                        title={t('common.register')}
                        color="secondary"
                        variant="text"
                    />
                </DialogActions>
            </form>
        </Dialog>
    );
};

const useStyles = makeStyles((theme: Theme) => ({
    content: {
        [theme.breakpoints.down('sm')]: {
            flex: 1
        }
    },
    visible: {
        display: 'flex',
    },
    notVisible: {
        display: 'none',
    },
    form: {
        [theme.breakpoints.down('sm')]: {
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            height: '100%'
        }
    },
    textField: {
        display: 'flex',
        marginBottom: theme.spacing(2),
        width: 300,
        [theme.breakpoints.down('sm')]: {
            width: 'auto',
            flex: 1
        }
    }
}));

export default RegisterDeviceDialog;
