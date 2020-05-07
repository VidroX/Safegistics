import * as React from "react";
import useTitle from "../../../hooks/useTitle";
import {useTranslation} from "../../../i18n";
import useUser from "../../../hooks/useUser";
import {canServerAdminOpenLink, getParsedUserType, UserTypes} from "../../../utils/userUtils";
import {NextPage} from "next";
import {config} from "../../../../config";
import Cookies from "universal-cookie";
import jwt from "jsonwebtoken";
import {UserData, UserPayload} from "../../../interfaces/user";
import Error from "../../_error";
import {useMutation, useQuery} from "@apollo/react-hooks";
import {GET_USERS} from "../../../apollo/queries/user";
import {Paper, Typography} from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import {Skeleton} from "@material-ui/lab";
import { MdDone, MdClose } from "react-icons/md";
import {localizedFormat} from "../../../utils/dateUtils";
import {useContext} from "react";
import {TopNav as ITopNav, TopNavButtons} from "../../../interfaces/topNav";
import TopNav from "../../../contexts/TopNav";
import {GET_DEVICES, REMOVE_DEVICE} from "../../../apollo/queries/devices";
import {DeviceEdge, DevicesData, RemoveDeviceState, RemoveDeviceVariables} from "../../../interfaces/devices";
import RemoveField, {RemoveFieldValue} from "../../../components/RemoveField";
import ConfirmationDialog, {CONFIRMATION_ACTIONS} from "../../../components/dialogs/confirmationDialog";
import RegisterDeviceDialog from "../../../components/dialogs/registerDeviceDialog";

interface UserPageProps {
    error?: boolean;
    slug: string;
}

const UserPage: NextPage<UserPageProps> = (props) => {
    const user = useUser();
    const classes = useStyles();

    const { slug } = props;
    const { t } = useTranslation();
    const { setCurrentTopNav } = useContext(TopNav);

    const [removeDeviceOpen, setRemoveDeviceOpen] = React.useState(false);
    const [registerDialogOpen, setRegisterDialogOpen] = React.useState(false);
    const [deviceId, setDeviceId] = React.useState<string | null>(null);

    if (props.error) {
        return <Error statusCode={405}/>;
    }

    const { data, loading, error } = useQuery<UserData>(GET_USERS, {
        variables: {
            userId: slug
        }
    });

    const queriedUser = data?.allUsers.edges[0].node;
    const userType = queriedUser != null && queriedUser.type != null ? getParsedUserType(queriedUser.type) : null;

    const { data: devicesData, loading: devicesLoading, error: devicesError } = useQuery<DevicesData>(GET_DEVICES, {
        skip: userType !== UserTypes.DRIVER,
        variables: {
            userId: slug
        }
    });
    const [
        removeDevice,
        {
            data: removeDeviceData,
            loading: removeDeviceLoading,
            error: removeDeviceError
        }
    ] = useMutation<RemoveDeviceState, RemoveDeviceVariables>(REMOVE_DEVICE);

    React.useEffect(() => {
        if (!removeDeviceLoading && !removeDeviceError && removeDeviceData != null) {
            window.location.reload();
        } else if (!removeDeviceLoading && removeDeviceError) {
            setDeviceId(null);
            setRemoveDeviceOpen(false);
        }
    }, [removeDeviceData, removeDeviceError, removeDeviceLoading]);

    React.useEffect(() => {
        const openRegisterDialog = () => {
            setRegisterDialogOpen(true);
        };

        let topNav: ITopNav = {
            breadcrumbs: [
                {
                    name: data != null ?
                        data.allUsers.edges[0].node.firstName + ' ' +
                        data.allUsers.edges[0].node.lastName + ' ' +
                        data.allUsers.edges[0].node.patronymic :
                        t('users.information'),
                    url: '/users/' + slug + '/',
                }
            ],
            buttons: !loading && !error && slug != null ? [
                {
                    type: 'IconButton',
                    text: t('common.edit'),
                    icon: "MdEdit",
                    route: {
                        url: '/users/[slug]/edit',
                        params: {
                            slug
                        }
                    }
                }
            ] : null
        };

        if (user?.isStaff) {
            const buttons: TopNavButtons[] = [
                {
                    type: 'IconButton',
                    text: t('common.edit'),
                    icon: "MdEdit",
                    route: {
                        url: '/users/[slug]/edit',
                        params: {
                            slug
                        }
                    }
                }
            ];

            if (userType === UserTypes.DRIVER) {
                buttons.unshift({
                    type: 'IconButton',
                    text: t('users.registerDevice'),
                    icon: "MdDevicesOther",
                    onPress: openRegisterDialog
                });
            }

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
                    }
                ],
                buttons: !loading && !error && slug != null ? buttons : null
            };
        }

        setCurrentTopNav(topNav);
    }, [loading, error, slug, user, registerDialogOpen]);

    useTitle(t("users.information"));

    if (loading || devicesLoading) {
        return (
            <>
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
                { userType === UserTypes.DRIVER && <div className={classes.defMarginTop}>
                    <Typography color="textPrimary" className={classes.header}>
                        <Skeleton variant="text" width={150} />
                    </Typography>
                    <Paper className={classes.contentWrapper}>
                        <div className={classes.infoBlock}>
                            <Skeleton variant="text" />
                        </div>
                        <div className={classes.infoBlock}>
                            <Skeleton variant="text" />
                        </div>
                        <div className={classes.infoBlock}>
                            <Skeleton variant="text" />
                        </div>
                    </Paper>
                </div> }
            </>
        );
    }

    if (!loading && !devicesLoading && error) {
        return (
            <Paper className={classes.contentWrapper}>
                <Typography variant="inherit">{t('auth.userNotFound')}</Typography>
            </Paper>
        );
    }

    const onDeviceRemove = (value: RemoveFieldValue) => {
        if (value.id != null && value.id.length > 0) {
            setDeviceId(value.id);
            setRemoveDeviceOpen(true);
        }
    };

    const onDialogAction = async (action: number) => {
        if (action === CONFIRMATION_ACTIONS.CONFIRM) {
            if (deviceId != null && deviceId.length > 0) {
                await removeDevice({
                    variables: {
                        deviceId
                    }
                })
            }
        } else {
            setRemoveDeviceOpen(false);
            setDeviceId(null);
        }
    };

    const onRegisterDialogClose = (shouldRefresh: boolean) => {
        if (shouldRefresh) {
            window.location.reload();
        }

        setRegisterDialogOpen(false);
    };

    return (
        <>
            <ConfirmationDialog
                open={removeDeviceOpen}
                title={t('users.removeDevice')}
                onAction={onDialogAction} />
            <RegisterDeviceDialog
                open={registerDialogOpen}
                userId={queriedUser != null && queriedUser.id.length > 0 ? queriedUser.id : null}
                onClose={onRegisterDialogClose} />
            <Paper className={classes.contentWrapper}>
                <div className={classes.infoBlock}>
                    <Typography variant="subtitle2">{t('users.name')}:</Typography>
                    <span>{queriedUser?.firstName} {queriedUser?.lastName} {queriedUser?.patronymic}</span>
                </div>
                <div className={classes.infoBlock}>
                    <Typography variant="subtitle2">E-Mail:</Typography>
                    <span>{queriedUser?.email}</span>
                </div>
                <div className={classes.infoBlock}>
                    <Typography variant="subtitle2">{t('users.mobilePhone')}:</Typography>
                    <span>{queriedUser?.mobilePhone}</span>
                </div>
                <div className={classes.infoBlock}>
                    <Typography variant="subtitle2">{t('users.birthday')}:</Typography>
                    <span>{queriedUser != null ?
                        localizedFormat(new Date(queriedUser.birthday), 'P') :
                        t('common.unknown')
                    }</span>
                </div>
                <div className={classes.infoBlock}>
                    <Typography variant="subtitle2">{t('users.dateJoined')}:</Typography>
                    <span>{queriedUser != null ?
                        localizedFormat(new Date(queriedUser.dateJoined)) :
                        t('common.unknown')
                    }</span>
                </div>
                { queriedUser?.manager != null && <div className={classes.infoBlock}>
                    <Typography variant="subtitle2">{t('users.manager')}:</Typography>
                    <span>
                        {queriedUser?.manager.firstName} {queriedUser?.manager.lastName} {queriedUser?.manager.patronymic}
                    </span>
                </div> }
                {queriedUser?.isStaff != null && <div className={classes.infoBlock}>
                    <Typography variant="subtitle2">{t('users.isStaff')}</Typography>
                    {queriedUser?.isStaff ?
                        <MdDone className={classes.colorGreen} /> :
                        <MdClose className={classes.colorRed} />
                    }
                </div> }
                <div className={classes.infoBlock}>
                    <Typography variant="subtitle2">{t('users.isActive')}</Typography>
                    {queriedUser?.isActive ?
                        <MdDone className={classes.colorGreen} /> :
                        <MdClose className={classes.colorRed} />
                    }
                </div>
            </Paper>
            { (userType === UserTypes.DRIVER && devicesData != null && devicesData?.devices.edges.length > 0) &&
            <div className={classes.defMarginTop}>
                <Typography color="textPrimary" className={classes.header}>{ t('users.devices') }</Typography>
                <Paper className={classes.contentWrapper}>
                    {
                        devicesData?.devices.edges.map((edge: DeviceEdge) =>
                            <RemoveField
                                showRemoveButton={user?.isStaff}
                                key={edge.node.deviceId}
                                className={classes.textField}
                                onRemove={onDeviceRemove}
                                value={{
                                    id: edge.node.id,
                                    name: edge.node.name
                                }}
                                placeholder={t("users.device")}
                            />
                        )
                    }
                </Paper>
            </div> }
        </>
    );
};

const useStyles = makeStyles(theme => ({
    contentWrapper: {
        padding: 12
    },
    infoBlock: {
        marginBottom: 12
    },
    colorGreen: {
        color: theme.palette.success.light
    },
    colorRed: {
        color: theme.palette.error.light
    },
    defMarginTop: {
        marginTop: 16
    },
    textField: {
        width: '100%',
        '&:not(:last-child)': {
            marginBottom: 16
        }
    },
    header: {
        marginTop: 16,
        marginBottom: 16
    }
}));

UserPage.getInitialProps = async (ctx) => {
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

export default UserPage;
