import * as React from "react";
import useTitle from "../../../../hooks/useTitle";
import {useTranslation} from "../../../../i18n";
import useUser from "../../../../hooks/useUser";
import {canServerAdminOpenLink, getParsedUserType, UserTypes} from "../../../../utils/userUtils";
import {NextPage, NextPageContext} from "next";
import {config} from "../../../../../config";
import Cookies from "universal-cookie";
import jwt from "jsonwebtoken";
import {UserData, UserPayload} from "../../../../interfaces/user";
import Error from "../../../_error";
import {useMutation, useQuery} from "@apollo/react-hooks";
import {GET_USERS, UPDATE_USER} from "../../../../apollo/queries/user";
import {Checkbox, FormControlLabel, Paper, TextField, Typography} from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import {Skeleton} from "@material-ui/lab";
import {useContext} from "react";
import TopNav from "../../../../contexts/TopNav";
import {Token, User} from "../../../../interfaces/appState";
import PhoneMask from "../../../../components/phoneMask";
import {KeyboardDatePicker} from "@material-ui/pickers";
import {MaterialUiPickersDate} from "@material-ui/pickers/typings/date";
import {subYears, format} from "date-fns";
import {GraphQLError} from "graphql";
import {BsFillCalendarFill} from "react-icons/bs";
import theme from "../../../../theme";
import ManagerSearcher from "../../../../components/searchers/managerSearcher";
import { TopNav as ITopNav } from "../../../../interfaces/topNav";

interface UserEditProps {
    error?: boolean;
    slug: string;
    userData?: UserData;
}

interface UpdateVariables {
    updateUserId?: string;
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
    manager?: string | null;
}

interface UpdateState {
    updateUser: {
        user: User | null,
        token: Token | null
    }
}

const UserEdit: NextPage<UserEditProps> = (props) => {
    const currentUser = useUser();
    const classes = useStyles();

    const { setCurrentTopNav } = useContext(TopNav);
    const { slug } = props;
    const { t, i18n } = useTranslation();

    const [firstName, setFirstName] = React.useState({
        error: false,
        errorText: "",
        value: ""
    });
    const encodedFirstName = JSON.stringify(firstName);

    const [lastName, setLastName] = React.useState({
        error: false,
        errorText: "",
        value: ""
    });
    const encodedLastName = JSON.stringify(lastName);

    const [patronymic, setPatronymic] = React.useState({
        error: false,
        errorText: "",
        value: ""
    });
    const encodedPatronymic = JSON.stringify(patronymic);

    const [birthday, setBirthday] = React.useState({
        error: false,
        errorText: "",
        value: new Date()
    });
    const encodedBirthday = JSON.stringify(birthday);

    const [emailField, setEmailField] = React.useState({
        error: false,
        errorText: "",
        value: ""
    });
    const encodedEmailField = JSON.stringify(emailField);

    const [mobilePhone, setMobilePhone] = React.useState({
        error: false,
        errorText: "",
        value: "",
        clearValue: ""
    });
    const encodedMobilePhone = JSON.stringify(mobilePhone);

    const [manager, setManager] = React.useState({
        error: false,
        errorText: "",
        value: "",
        id: ""
    });
    const encodedManager = JSON.stringify(manager);

    const [isUserAdmin, setUserAdmin] = React.useState(false);
    const [isActive, setActive] = React.useState(false);

    if (props.error) {
        return <Error statusCode={405}/>;
    }

    const { data, loading, error } = useQuery<UserData>(GET_USERS, {
        variables: {
            userId: slug
        }
    });

    const [
        updateUser,
        {
            data: updateData,
            loading: updateLoading,
            error: updateError
        }
    ] = useMutation<UpdateState, UpdateVariables>(UPDATE_USER);

    React.useEffect(() => {
        let topNav: ITopNav = {
            breadcrumbs: [
                {
                    name: data != null ?
                        data.allUsers.edges[0].node.firstName + ' ' +
                        data.allUsers.edges[0].node.lastName + ' ' +
                        data.allUsers.edges[0].node.patronymic :
                        t('users.information'),
                    url: '/users/' + slug + '/',
                },
                {
                    name: t('common.edit'),
                    url: '/users/' + slug + '/edit',
                }
            ],
            buttons: [
                {
                    type: 'IconButton',
                    icon: 'MdSave',
                    loading: updateLoading,
                    text: t('common.save'),
                    onPress: handleSavePress
                }
            ]
        };

        if (currentUser?.isStaff) {
            topNav = {
                breadcrumbs: [
                    {
                        name: t('users.users'),
                        url: '/users',
                    },
                    {
                        name: data != null ?
                            data.allUsers.edges[0].node.firstName + ' ' +
                            data.allUsers.edges[0].node.lastName + ' ' +
                            data.allUsers.edges[0].node.patronymic :
                            t('users.information'),
                        url: '/users/' + slug + '/',
                    },
                    {
                        name: t('common.edit'),
                        url: '/users/' + slug + '/edit',
                    }
                ],
                buttons: [
                    {
                        type: 'IconButton',
                        icon: 'MdSave',
                        loading: updateLoading,
                        text: t('common.save'),
                        onPress: handleSavePress
                    }
                ]
            };
        }

        setCurrentTopNav(topNav);
    }, [loading, error, slug, updateLoading, isActive, isUserAdmin, encodedBirthday, encodedEmailField,
        encodedFirstName, encodedLastName, encodedMobilePhone, encodedPatronymic, encodedManager, currentUser,
        i18n.language]);

    const isStaffChecked = Boolean(isUserAdmin);
    const isActiveChecked = Boolean(isActive);

    useTitle(t("users.information"));

    const queriedUser = data?.allUsers.edges[0].node;
    const userType = queriedUser != null && queriedUser.type != null ? getParsedUserType(queriedUser.type) : null;

    React.useEffect(() => {
        if (!updateLoading && !updateError && updateData != null) {
            const user = updateData.updateUser.user;
            const token = updateData.updateUser.token?.accessToken;

            if (token != null && user != null) {
                try {
                    const decodedSession = jwt.decode(token);
                    const sessionUser = (decodedSession as any).identity as UserPayload;

                    if (sessionUser != null && currentUser?.id === queriedUser?.id) {
                        new Cookies().set(config.general.sessionCookie, token, {
                            path: '/'
                        });
                    }

                    window.location.href = '/users/' + slug;
                } catch (e) {
                    console.log(e);
                }
            }
        }
    }, [updateLoading, updateError, updateData, currentUser]);

    React.useEffect(() => {
        if (queriedUser != null) {
            setFirstName({
                error: false,
                errorText: "",
                value: queriedUser.firstName
            });
            setLastName({
                error: false,
                errorText: "",
                value: queriedUser.lastName
            });
            setPatronymic({
                error: false,
                errorText: "",
                value: queriedUser.patronymic
            });
            setBirthday({
                error: false,
                errorText: "",
                value: new Date(queriedUser.birthday)
            });
            setEmailField({
                error: false,
                errorText: "",
                value: queriedUser.email
            });
            setMobilePhone({
                error: false,
                errorText: "",
                value: queriedUser.mobilePhone.replace(/[_()\-\s]/gi, ''),
                clearValue: queriedUser.mobilePhone
            });

            if (currentUser?.isStaff && queriedUser.manager != null) {
                setManager({
                    error: false,
                    errorText: "",
                    value: queriedUser.manager.firstName + ' ' +
                        queriedUser.manager.lastName + ' ' +
                        queriedUser.manager.patronymic,
                    id: queriedUser.manager.id
                });
            }
            setActive(queriedUser.isActive);
            setUserAdmin(queriedUser.isStaff != null ? queriedUser.isStaff : false);
        }
    }, [queriedUser]);

    if (loading) {
        return (
            <Paper className={classes.contentWrapper}>
                <div className={classes.infoBlock}>
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                </div>
                <div className={classes.infoBlock}>
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                </div>
                <div className={classes.infoBlock}>
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                </div>
                <div className={classes.infoBlock}>
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                </div>
                <div className={classes.infoBlock}>
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                </div>
                <div className={classes.infoBlock}>
                    <Skeleton variant="text" />
                    <Skeleton variant="circle" width={24} height={24} />
                </div>
                <div className={classes.infoBlock}>
                    <Skeleton variant="text" />
                    <Skeleton variant="circle" width={24} height={24} />
                </div>
            </Paper>
        );
    }

    if (!loading && error) {
        return (
            <Paper className={classes.contentWrapper}>
                <Typography variant="inherit">{t('auth.userNotFound')}</Typography>
            </Paper>
        );
    }

    const handleSavePress = async () => {
        await clearErrors();
        await checkFields();

        if (!updateLoading && !loading && queriedUser != null && checkFieldsForErrors()) {
            try {
                let userUpdateVariables: UpdateVariables = {
                    updateUserId: queriedUser.id,
                    email: emailField.value,
                    firstName: firstName.value,
                    lastName: lastName.value,
                    patronymic: patronymic.value,
                    mobilePhone: mobilePhone.value,
                    birthday: format(birthday.value, 'yyyy-MM-dd')
                };

                if (currentUser?.isStaff) {
                    if (queriedUser?.isStaff != null) {
                        userUpdateVariables = {
                            updateUserId: queriedUser.id,
                            email: emailField.value,
                            firstName: firstName.value,
                            lastName: lastName.value,
                            patronymic: patronymic.value,
                            mobilePhone: mobilePhone.value,
                            birthday: format(birthday.value, 'yyyy-MM-dd'),
                            isActive: isActiveChecked,
                            isStaff: isStaffChecked
                        };
                    } else {
                        userUpdateVariables = {
                            updateUserId: queriedUser.id,
                            email: emailField.value,
                            firstName: firstName.value,
                            lastName: lastName.value,
                            patronymic: patronymic.value,
                            mobilePhone: mobilePhone.value,
                            birthday: format(birthday.value, 'yyyy-MM-dd'),
                            isActive: isActiveChecked
                        };

                        if (userType === UserTypes.DRIVER && manager.id.length > 0) {
                            userUpdateVariables.manager = manager.id;
                        }
                    }
                }

                await updateUser({
                    variables: userUpdateVariables
                });
            } catch (updateError) {
                updateError.graphQLErrors?.map((err: GraphQLError) => {
                    switch (err.extensions?.code) {
                        case 2: {
                            alert(t('common.notEnoughRights'));
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

    const checkFieldsForErrors = () =>
        firstName.value.length > 0 &&
        lastName.value.length > 0 &&
        patronymic.value.length > 0 &&
        birthday.value != null &&
        emailField.value.length > 0 &&
        mobilePhone.value.length === 13 &&
        (
            (userType === UserTypes.DRIVER && currentUser?.isStaff == true && manager.id.length > 0) ||
            (userType === UserTypes.DRIVER && (currentUser?.isStaff == false || currentUser?.isStaff == null)) ||
            (userType !== UserTypes.DRIVER)
        );

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
        if (mobilePhone.value.length < 13) {
            setMobilePhone({
                error: true,
                errorText: t('common.incorrectMobilePhone'),
                value: mobilePhone.value,
                clearValue: mobilePhone.clearValue
            });
        }
        if (currentUser?.isStaff && userType === UserTypes.DRIVER) {
            if (manager.id.length <= 0) {
                setManager({
                    error: true,
                    errorText: t('common.fieldEmpty'),
                    value: manager.value,
                    id: manager.id
                });
            }
        }
    };

    const renderAdminPart = () => {
        if (currentUser?.isStaff) {
            return (
                <>
                    {userType === UserTypes.DRIVER && <div className={classes.infoBlock}>
                        <ManagerSearcher
                            className={classes.textField}
                            required={userType === UserTypes.DRIVER}
                            error={manager.error}
                            defaultValue={{
                                id: manager.id,
                                label: manager.value
                            }}
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
                    </div> }
                    { queriedUser?.isStaff != null && <div className={classes.infoBlock}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isStaffChecked}
                                    onChange={(event) => {
                                        setUserAdmin(event.target.checked);
                                    }}
                                />
                            }
                            label={t('users.isStaff')}
                        />
                    </div> }
                    <div className={classes.infoBlock}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isActiveChecked}
                                    onChange={(event) => {
                                        setActive(event.target.checked);
                                    }}
                                />
                            }
                            label={t('users.isActive')}
                        />
                    </div>
                </>
            );
        }

        return null;
    };

    return (
        <>
            <Paper className={classes.contentWrapper}>
                <div className={classes.infoBlock}>
                    <TextField
                        classes={{
                            root: classes.textField
                        }}
                        label={t('users.firstName')}
                        variant="outlined"
                        value={firstName.value}
                        required
                        color="secondary"
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
                </div>
                <div className={classes.infoBlock}>
                    <TextField
                        classes={{
                            root: classes.textField
                        }}
                        label={t('users.lastName')}
                        variant="outlined"
                        value={lastName.value}
                        required
                        color="secondary"
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
                </div>
                <div className={classes.infoBlock}>
                    <TextField
                        classes={{
                            root: classes.textField
                        }}
                        label={t('users.patronymic')}
                        variant="outlined"
                        value={patronymic.value}
                        required
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
                </div>
                <div className={classes.infoBlock}>
                    <TextField
                        classes={{
                            root: classes.textField
                        }}
                        label={t('auth.email')}
                        variant="outlined"
                        value={emailField.value}
                        required
                        color="secondary"
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
                </div>
                <div className={classes.infoBlock}>
                    <TextField
                        classes={{
                            root: classes.textField
                        }}
                        label={t('users.mobilePhone')}
                        variant="outlined"
                        value={mobilePhone.value}
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
                </div>
                <div className={classes.infoBlock}>
                    <KeyboardDatePicker
                        className={classes.textField}
                        label={t('users.birthday')}
                        format={'P'}
                        variant="dialog"
                        inputVariant="outlined"
                        required
                        color="secondary"
                        cancelLabel={t('common.cancel')}
                        okLabel={t('common.select')}
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
                        }}
                    />
                </div>
                { renderAdminPart() }
            </Paper>
        </>
    );
};

const useStyles = makeStyles(theme => ({
    contentWrapper: {
        padding: 12,
        flexDirection: 'column'
    },
    defMarginTop: {
        marginTop: 16
    },
    infoBlock: {
        "&:not(:last-child)": {
            marginBottom: 12
        }
    },
    textField: {
        width: '100%'
    },
    header: {
        marginTop: 16,
        marginBottom: 16
    }
}));

UserEdit.getInitialProps = async (ctx: NextPageContext) => {
    const { slug } = ctx.query;

    if (ctx && ctx.req && ctx.res) {
        const cookies = new Cookies(ctx.req.headers.cookie);
        const user = cookies.get(config.general.sessionCookie);
        try {
            const decodedSession = jwt.decode(user);
            const sessionUser = (decodedSession as any).identity as UserPayload;

            if (sessionUser == null || !canServerAdminOpenLink(sessionUser, slug as string)) {
                ctx.res.statusCode = 405;
                return {
                    error: true,
                    slug: slug as string,
                };
            }
        } catch (e) {
            ctx.res.statusCode = 405;
            return {
                error: true,
                slug: slug as string,
            };
        }
    }

    return {
        error: false,
        slug: slug as string,
    };
};

export default UserEdit;
