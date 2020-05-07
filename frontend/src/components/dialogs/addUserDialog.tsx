import * as React from "react";
import { useTranslation } from "../../i18n";
import {UserTypes} from "../../utils/userUtils";
import {GraphQLError} from "graphql";
import {useMutation} from "@apollo/react-hooks";
import {USER_REGISTER} from "../../apollo/queries/user";
import {Token, User} from "../../interfaces/appState";
import {format, subYears} from "date-fns";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, FormControl, InputLabel, MenuItem, Select,
    TextField,
    Theme,
    useMediaQuery
} from "@material-ui/core";
import theme from "../../theme";
import {FormEvent} from "react";
import {KeyboardDatePicker} from "@material-ui/pickers";
import {BsFillCalendarFill} from "react-icons/bs";
import {MaterialUiPickersDate} from "@material-ui/pickers/typings/date";
import PhoneMask from "../phoneMask";
import { makeStyles } from '@material-ui/core/styles';
import LoadingSubmitButton from "../loadingSubmitButton";
import ManagerSearcher from "../searchers/managerSearcher";

interface AddUserDialogProps {
    open: boolean;
    onOpen?(): void;
    onClose?(shouldRefresh: boolean): void;
}

interface RegisterUserVariables {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    patronymic: string;
    birthday: string;
    mobilePhone: string;
    type?: string;
    isStaff?: boolean;
    isActive?: boolean;
    manager?: string;
}

interface RegisterUserState {
    register: {
        user: User | null,
        token: Token | null
    }
}

const AddUserDialog = (props: AddUserDialogProps) => {
    const { open, onOpen, onClose } = props;

    const { t } = useTranslation();
    const classes = useStyles();

    const [
        registerUser,
        {
            data,
            loading,
            error
        }
    ] = useMutation<RegisterUserState, RegisterUserVariables>(USER_REGISTER);

    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [firstName, setFirstName] = React.useState({
        error: false,
        errorText: "",
        value: ""
    });

    const [lastName, setLastName] = React.useState({
        error: false,
        errorText: "",
        value: ""
    });

    const [patronymic, setPatronymic] = React.useState({
        error: false,
        errorText: "",
        value: ""
    });

    const [birthday, setBirthday] = React.useState({
        error: false,
        errorText: "",
        value: new Date()
    });

    const [emailField, setEmailField] = React.useState({
        error: false,
        errorText: "",
        value: ""
    });

    const [mobilePhone, setMobilePhone] = React.useState({
        error: false,
        errorText: "",
        value: "",
        clearValue: ""
    });

    const [type, setType] = React.useState({
        error: false,
        type: 0
    });

    const [manager, setManager] = React.useState({
        error: false,
        errorText: "",
        value: "",
        id: ""
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
    }, [open]);

    React.useEffect(() => {
        if (!loading && !error && data != null) {
            if (onClose) {
                onClose(true);
            }
        }
    }, [data, loading, error]);

    const clearFields = () => {
        setFirstName({
            error: false,
            errorText: "",
            value: ""
        });
        setLastName({
            error: false,
            errorText: "",
            value: ""
        });
        setPatronymic({
            error: false,
            errorText: "",
            value: ""
        });
        setBirthday({
            error: false,
            errorText: "",
            value: new Date()
        });
        setEmailField({
            error: false,
            errorText: "",
            value: ""
        });
        setMobilePhone({
            error: false,
            errorText: "",
            value: "",
            clearValue: ""
        });
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
        setType({
            error: false,
            type: 0
        });
        setManager({
            error: false,
            errorText: "",
            value: "",
            id: ""
        });
    };

    const clearErrors = () => {
        setFirstName({
            error: false,
            errorText: "",
            value: firstName.value
        });
        setLastName({
            error: false,
            errorText: "",
            value: lastName.value
        });
        setPatronymic({
            error: false,
            errorText: "",
            value: patronymic.value
        });
        setBirthday({
            error: false,
            errorText: "",
            value: birthday.value
        });
        setEmailField({
            error: false,
            errorText: "",
            value: emailField.value
        });
        setMobilePhone({
            error: false,
            errorText: "",
            value: mobilePhone.value,
            clearValue: mobilePhone.clearValue
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
        setType({
            error: false,
            type: type.type
        });
        setManager({
            error: false,
            errorText: "",
            value: manager.value,
            id: manager.id
        });
    };

    const checkFields = () => {
        if (firstName.value.length < 1) {
            setFirstName({
                error: true,
                errorText: t('common.fieldEmpty'),
                value: firstName.value
            });
        }
        if (lastName.value.length < 1) {
            setLastName({
                error: true,
                errorText: t('common.fieldEmpty'),
                value: lastName.value
            });
        }
        if (patronymic.value.length < 1) {
            setPatronymic({
                error: true,
                errorText: t('common.fieldEmpty'),
                value: patronymic.value
            });
        }
        if (birthday.value == null) {
            setBirthday({
                error: true,
                errorText: t('common.incorrectDate'),
                value: birthday.value
            });
        }
        if (emailField.value.length < 1) {
            setEmailField({
                error: true,
                errorText: t('common.fieldEmpty'),
                value: emailField.value
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
        if (mobilePhone.value.length < 13) {
            setMobilePhone({
                error: true,
                errorText: t('common.incorrectMobilePhone'),
                value: mobilePhone.value,
                clearValue: mobilePhone.clearValue
            });
        }
        if (type.type === UserTypes.DEFAULT || type.type === UserTypes.DRIVER) {
            if (type.type === UserTypes.DRIVER && (manager.id.length <= 0 || manager.value.length <= 0)) {
                setManager({
                    error: true,
                    errorText: t('users.specifyManager'),
                    value: manager.value,
                    id: manager.id
                });
            }
        } else {
            setType({
                error: true,
                type: type.type
            });
        }
    };

    const everythingOk = (): boolean =>
        firstName.value.length > 0 &&
        lastName.value.length > 0 &&
        patronymic.value.length > 0 &&
        birthday.value != null &&
        emailField.value.length > 0 &&
        mobilePhone.value.length === 13 &&
        password.value.length >= 6 &&
        repeatPassword.value.length >= 6 &&
        password.value === repeatPassword.value &&
        (
            (
                type.type === UserTypes.DRIVER &&
                manager.value.length > 0 &&
                manager.id.length > 0
            ) ||
            (
                type.type === UserTypes.DEFAULT &&
                manager.value.length <= 0 &&
                manager.id.length <= 0
            )
        );

    const handleUserRegister = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        await clearErrors();
        await checkFields();

        if (!loading && everythingOk()) {
            try {
                let registerVariables: RegisterUserVariables = {
                    email: emailField.value,
                    password: password.value,
                    firstName: firstName.value,
                    lastName: lastName.value,
                    patronymic: patronymic.value,
                    birthday: format(birthday.value, 'yyyy-MM-dd'),
                    mobilePhone: mobilePhone.value,
                    type: type.type === UserTypes.DRIVER ? 'driver' : 'user',
                    isStaff: false,
                    isActive: true
                };

                if (manager.id.length > 0 && manager.value.length > 0 && type.type === UserTypes.DRIVER) {
                    registerVariables.manager = manager.id;
                }

                await registerUser({
                    variables: registerVariables
                });
            } catch (updateError) {
                updateError.graphQLErrors?.map((err: GraphQLError) => {
                    switch (err.extensions?.code) {
                        case 101: {
                            setType({
                                error: true,
                                type: type.type
                            });
                            break;
                        }
                        case 102: {
                            setEmailField({
                                error: true,
                                errorText: t('common.alreadyExists'),
                                value: emailField.value
                            });
                            setMobilePhone({
                                error: true,
                                errorText: t('common.alreadyExists'),
                                value: mobilePhone.value,
                                clearValue: mobilePhone.clearValue
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
            <form className={classes.form} onSubmit={handleUserRegister} method="post">
                <DialogTitle>{ t('users.createNewUser') }</DialogTitle>
                <DialogContent className={classes.content}>
                    <FormControl variant="outlined" color="secondary" className={classes.textField}>
                        <InputLabel id="user-type-select-label">{t('users.userType')}</InputLabel>
                        <Select
                            labelId="user-type-select-label"
                            id="user-type-select"
                            value={type.type}
                            label={t('users.userType')}
                            required
                            error={type.error}
                            onChange={(e) => {
                                if (e.target != null && e.target.value != null) {
                                    setType({
                                        error: false,
                                        type: e.target.value as number
                                    })
                                }
                            }}
                        >
                            <MenuItem value={UserTypes.DEFAULT}>{t('users.user')}</MenuItem>
                            <MenuItem value={UserTypes.DRIVER}>{t('users.driver')}</MenuItem>
                        </Select>
                    </FormControl>
                    <ManagerSearcher
                        className={type.type === UserTypes.DRIVER ? classes.visible : classes.notVisible}
                        required={type.type === UserTypes.DRIVER}
                        error={manager.error}
                        helperText={manager.errorText}
                        onSelect={value => {
                            if (value != null) {
                                setManager({
                                    error: false,
                                    errorText: "",
                                    value: value.label,
                                    id: value.id
                                });
                            } else {
                                setManager({
                                    error: false,
                                    errorText: "",
                                    value: "",
                                    id: ""
                                });
                            }
                        }}
                    />
                    <TextField
                        className={classes.textField}
                        label={t('users.lastName')}
                        variant="outlined"
                        value={lastName.value}
                        color="secondary"
                        required
                        error={lastName.error}
                        helperText={lastName.errorText}
                        onChange={(e) => {
                            setLastName({
                                error: false,
                                errorText: "",
                                value: e.target.value
                            });
                        }}
                    />
                    <TextField
                        className={classes.textField}
                        label={t('users.firstName')}
                        variant="outlined"
                        color="secondary"
                        value={firstName.value}
                        required
                        error={firstName.error}
                        helperText={firstName.errorText}
                        onChange={(e) => {
                            setFirstName({
                                error: false,
                                errorText: "",
                                value: e.target.value
                            });
                        }}
                    />
                    <TextField
                        className={classes.textField}
                        label={t('users.patronymic')}
                        variant="outlined"
                        value={patronymic.value}
                        color="secondary"
                        error={patronymic.error}
                        helperText={patronymic.errorText}
                        onChange={(e) => {
                            setPatronymic({
                                error: false,
                                errorText: "",
                                value: e.target.value
                            });
                        }}
                    />
                    <TextField
                        className={classes.textField}
                        label={t('auth.email')}
                        variant="outlined"
                        color="secondary"
                        value={emailField.value}
                        required
                        type="email"
                        error={emailField.error}
                        helperText={emailField.errorText}
                        onChange={(e) => {
                            setEmailField({
                                error: false,
                                errorText: "",
                                value: e.target.value
                            });
                        }}
                    />
                    <KeyboardDatePicker
                        className={classes.textField}
                        label={t('users.birthday')}
                        format={'P'}
                        variant="dialog"
                        inputVariant="outlined"
                        color="secondary"
                        required
                        cancelLabel={t('common.cancel')}
                        okLabel={t('common.select')}
                        leftArrowButtonProps={{
                            color: "secondary"
                        }}
                        rightArrowButtonProps={{
                            color: "secondary"
                        }}
                        maxDate={new Date()}
                        minDate={subYears(new Date(), 130)}
                        value={new Date(birthday.value)}
                        error={birthday.error}
                        helperText={birthday.errorText}
                        keyboardIcon={<BsFillCalendarFill aria-label="Select Date" color={theme.palette.secondary.light} />}
                        onChange={(date: MaterialUiPickersDate | null) => {
                            try {
                                setBirthday({
                                    error: false,
                                    errorText: "",
                                    value: date != null ? new Date(date) : new Date()
                                });
                            } catch (e) {
                                setBirthday({
                                    error: false,
                                    errorText: "",
                                    value: new Date(birthday.value)
                                });
                            }
                        }}
                        KeyboardButtonProps={{
                            'aria-label': t('common.selectDate'),
                            color: 'secondary'
                        }}
                    />
                    <TextField
                        className={classes.textField}
                        label={t('users.mobilePhone')}
                        variant="outlined"
                        value={mobilePhone.clearValue}
                        required
                        color="secondary"
                        error={mobilePhone.error}
                        helperText={mobilePhone.errorText}
                        onChange={(e) => {
                            setMobilePhone({
                                error: false,
                                errorText: "",
                                value: e.target.value.replace(/[_()\-\s]/gi, ''),
                                clearValue: e.target.value
                            });
                        }}
                        InputProps={{
                            inputComponent: PhoneMask as any,
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
                        title={t('common.create')}
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

export default AddUserDialog;
