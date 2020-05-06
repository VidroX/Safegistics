import * as React from "react";
import {useTranslation} from "../i18n";
import clsx from "clsx";
import {makeStyles} from "@material-ui/core/styles";
import MaterialSwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {MdChevronLeft, MdChevronRight} from "react-icons/md";
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import {Avatar, IconButton, Menu, MenuItem, useMediaQuery} from "@material-ui/core";
import {FiMenu, FiUsers} from "react-icons/fi";
import theme from "../theme";
import useTitle from "../hooks/useTitle";
import Link from "../components/link";
import {useRouter} from "next/router";
import {GoDashboard} from "react-icons/go";
import LanguageSelector from "./languageSelector";
import { IoIosStar } from "react-icons/io";
import { MdAccountCircle } from "react-icons/md";
import useUser from "../hooks/useUser";
import {config} from "../../config";
import Cookies from "js-cookie";


const Header = () => {
    const {t, i18n} = useTranslation();
    const [open, setOpen] = React.useState(true);
    const [variant, setVariant] = React.useState<"temporary" | "permanent">("temporary");
    const [anchorEl, setAnchorEl] = React.useState(null);

    const isMenuOpened = Boolean(anchorEl);

    const title = useTitle();
    const router = useRouter();
    const classes = useStyles();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const user = useUser();

    const iOS = process.browser && /iPad|iPhone|iPod/.test(navigator.userAgent);

    React.useEffect(() => {
        if (isMobile) {
            setOpen(false);
            setVariant("temporary");
        } else {
            setVariant("permanent");
        }
    }, [isMobile]);

    const toggleDrawer = () => {
        setOpen(!open);
    };

    const handleMenuOpen = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleLogout = () => {
        setAnchorEl(null);
        Cookies.remove(config.general.sessionCookie, { path: '/' });
        window.location.reload();
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const renderMenu = () => {
        return (
            <List>
                <Link href="/" passHref noDecoration={true}>
                    <ListItem
                        selected={router.pathname === '/'}
                        button
                        className={classes.drawerItem}
                        color="secondary"
                        onClick={isMobile ? toggleDrawer : () => {}}
                    >
                        <ListItemIcon><GoDashboard color={theme.palette.secondary.light} /></ListItemIcon>
                        <ListItemText>{t('dashboard.dashboard')}</ListItemText>
                    </ListItem>
                </Link>
                { user?.isStaff && <Link href="/users/" passHref noDecoration={true}>
                    <ListItem
                        selected={router.pathname === '/users' || router.pathname === '/users/'}
                        button
                        className={classes.drawerItem}
                        color="secondary"
                        onClick={isMobile ? toggleDrawer : () => {}}
                    >
                        <ListItemIcon><FiUsers color={theme.palette.secondary.light} /></ListItemIcon>
                        <ListItemText>{t('users.users')}</ListItemText>
                    </ListItem>
                </Link> }
            </List>
        );
    };

    return (
        <>
            <AppBar
                position="fixed"
                className={classes.appBar}
            >
                <Toolbar>
                    <IconButton
                        color="secondary"
                        aria-label="open drawer"
                        onClick={toggleDrawer}
                        edge="start"
                        className={classes.menuButton}
                    >
                        <FiMenu />
                    </IconButton>
                    <Link href="/" noDecoration={true} className={classes.noWrap}>
                        <Typography variant="h6" noWrap>
                            {title}
                        </Typography>
                    </Link>
                    <div className={classes.rightAlign}>
                        <LanguageSelector type="IconButton" />
                        <div>
                            <IconButton
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleMenuOpen}
                                color="secondary"
                                className={classes.lastButton}
                            >
                                <Avatar className={classes.avatar} color="secondary">
                                    {user != null && user.lastName.length > 0 ?
                                        user.lastName.substr(0, 1) :
                                        <MdAccountCircle />
                                    }
                                </Avatar>
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={isMenuOpened}
                                onClose={handleMenuClose}
                            >
                                <MenuItem disabled={true}>
                                    {user?.isStaff && <ListItemIcon className={classes.adminIcon}><IoIosStar /></ListItemIcon>}
                                    <Typography variant="inherit" noWrap className={classes.menuItem}>
                                        {user != null && user.lastName} {user != null && user.firstName}
                                    </Typography>
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>{t('auth.signOut')}</MenuItem>
                            </Menu>
                        </div>
                    </div>
                </Toolbar>
            </AppBar>
            <MaterialSwipeableDrawer
                variant={variant}
                disableBackdropTransition={!iOS}
                disableDiscovery={iOS}
                onClose={toggleDrawer}
                onOpen={toggleDrawer}
                open={open}
                className={
                    clsx(classes.drawer, {
                        [classes.drawerOpen]: open,
                        [classes.drawerClose]: !open,
                        [classes.fixedDrawer]: !open,
                    })
                }
                classes={{
                        paper: clsx(classes.drawer, {
                            [classes.drawerOpen]: open,
                            [classes.drawerClose]: !open,
                            [classes.fixedDrawer]: !open,
                        })
                }}
            >
                <Toolbar className={classes.toolbar}>
                    <IconButton onClick={toggleDrawer}>
                        {theme.direction === 'rtl' ? <MdChevronRight/> : <MdChevronLeft/>}
                    </IconButton>
                </Toolbar>
                <div className={classes.drawerContainer}>
                    { renderMenu() }
                </div>
            </MaterialSwipeableDrawer>
        </>
    );
};

const drawerWidth = 240;
const closedDrawerWidth = 10;

const useStyles = makeStyles((theme) => ({
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    fixedDrawer: {
        position: 'fixed',
    },
    drawer: {
        zIndex: theme.zIndex.drawer,
        width: closedDrawerWidth,
        flexShrink: 0,
        overflow: 'hidden',
        '&:hover': {
            width: drawerWidth
        },
    },
    drawerContainer: {
        overflow: 'hidden',
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        width: drawerWidth,
        [theme.breakpoints.up('sm')]: {
            width: closedDrawerWidth,
        },
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        ...theme.mixins.toolbar,
    },
    menuButton: {
        marginRight: 36,
    },
    hide: {
        display: 'none',
    },
    lastButton: {
        marginRight: -12
    },
    avatar: {
        width: 35,
        height: 35,
        backgroundColor: theme.palette.secondary.light
    },
    adminIcon: {
        minWidth: 36
    },
    menuItem: {
        maxWidth: 200
    },
    rightAlign: {
        display: 'flex',
        flexDirection: 'row',
        marginLeft: 'auto',
        alignItems: 'center'
    },
    noWrap: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    drawerItem: {
        margin: 8,
        borderRadius: 6
    }
}));

export default Header;
