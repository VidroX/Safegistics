import * as React from "react";
import useTitle from "../../../hooks/useTitle";
import {useTranslation} from "../../../i18n";
import useUser from "../../../hooks/useUser";
import {canServerAdminOpenLink} from "../../../utils/userUtils";
import {NextPage} from "next";
import {config} from "../../../../config";
import Cookies from "universal-cookie";
import jwt from "jsonwebtoken";
import {UserData, UserPayload} from "../../../interfaces/user";
import Error from "../../_error";
import {useQuery} from "@apollo/react-hooks";
import {GET_USERS} from "../../../apollo/queries/user";
import {makeStyles, Paper, Typography} from "@material-ui/core";
import {Skeleton} from "@material-ui/lab";
import { MdDone, MdClose } from "react-icons/md";
import {localizedFormat} from "../../../utils/dateUtils";
import {useContext} from "react";
import TopNav from "../../../contexts/TopNav";

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

    if (props.error) {
        return <Error statusCode={405}/>;
    }

    const { data, loading, error } = useQuery<UserData>(GET_USERS, {
        variables: {
            userId: slug
        }
    });

    React.useEffect(() => {
        setCurrentTopNav({
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
        });
    }, [loading, error, slug]);

    useTitle(t("users.information"));

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

    const queriedUser = data?.allUsers.edges[0].node;

    return (
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
