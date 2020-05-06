import * as React from "react";
import {
    Breadcrumbs,
    Button,
    CircularProgress,
    Grid,
    IconButton,
    makeStyles,
    Popover,
    Typography
} from "@material-ui/core";
import Link from "./link";
import * as MaterialIcon from "react-icons/md";
import {Router} from "../i18n";
import {Breadcrumb, TopNavButtons} from "../interfaces/topNav";
import TopNav from "../contexts/TopNav";
import LoadingSubmitButton from "./loadingSubmitButton";

const BreadcrumbsList = (props: BreadcrumbProps) => {
    const { locations, className } = props;

    const topNavContext = React.useContext(TopNav);
    const [buttons, setButtons] = React.useState<TopNavButtons[]>([]);
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

    const classes = useStyles();

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const popoverOpened = Boolean(anchorEl);

    let list: Breadcrumb[] = [];
    if (locations != null && locations.length > 0) {
        list = locations;
    } else if (topNavContext.breadcrumbs != null && topNavContext.breadcrumbs.length > 0){
        list = topNavContext.breadcrumbs;
    }


    React.useEffect(() => {
        if (topNavContext != null && topNavContext.buttons != null) {
            setButtons(topNavContext.buttons);
        }
    }, [topNavContext]);

    if (list.length <= 0) {
        return null;
    }

    return (
        <Grid direction="row" alignItems="center" justify="space-between" container className={className}>
            <Grid item>
                <Breadcrumbs aria-label="breadcrumb">
                    {
                        list.map((loc, index) => {
                            if (index < list.length - 1) {
                                return <Link color="secondary" href={loc.url} key={'breadcrumb-' + index}>{ loc.name }</Link>;
                            }

                            return <Typography color="textPrimary" key={'breadcrumb-' + index}>{ loc.name }</Typography>;
                        })
                    }
                </Breadcrumbs>
            </Grid>
            <Grid item className={classes.right}>
                {
                    buttons.map((button, index) => {
                        if (button.type === 'IconButton' && button.icon != null) {
                            const icon = (MaterialIcon as any)[button.icon];

                            return (
                                <React.Fragment key={"popover-block-" + index}>
                                    <IconButton
                                        disabled={button.loading}
                                        key={"top-nav-btn-" + index}
                                        color="secondary"
                                        onClick={() => {
                                            setAnchorEl(null);
                                            if (button.onPress) {
                                                button.onPress();
                                            }
                                            if (button.route) {
                                                const as = button.route.url.replace(/\[(.*?)]/gmi,
                                                    (fullMatch: string, group: string) => {
                                                        if (button.route?.params != null) {
                                                            return button.route?.params[group];
                                                        }
                                                        return fullMatch;
                                                    });

                                                const url = {
                                                    pathname: button.route.url,
                                                    query: button.route.params,
                                                };

                                                Router.push(url, as);
                                            }
                                        }}
                                        aria-owns={popoverOpened ? 'mouse-over-popover-' + index : undefined}
                                        aria-haspopup="true"
                                        onMouseEnter={handlePopoverOpen}
                                        onMouseLeave={handlePopoverClose}
                                    >
                                        { !button.loading && icon != undefined && React.createElement(icon) }
                                        { button.loading && <CircularProgress className={classes.spinner} /> }
                                    </IconButton>
                                    <Popover
                                        key={"popover-" + index}
                                        id={"mouse-over-popover-" + index}
                                        className={classes.popover}
                                        classes={{
                                            paper: classes.paper,
                                        }}
                                        open={!button.loading && popoverOpened}
                                        anchorEl={anchorEl}
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'left',
                                        }}
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'left',
                                        }}
                                        onClose={handlePopoverClose}
                                        disableRestoreFocus
                                    >
                                        <Typography>{ button.text }</Typography>
                                    </Popover>
                                </React.Fragment>
                            );
                        }

                        return (
                            <LoadingSubmitButton
                                key={"top-nav-btn-" + index}
                                loadingStatus={button.loading ? button.loading : false}
                                onButtonClick={button.onPress}
                                title={button.text}
                            />
                        );
                    })
                }
            </Grid>
        </Grid>
    );
};

const useStyles = makeStyles(theme => ({
    popover: {
        pointerEvents: 'none',
    },
    paper: {
        padding: theme.spacing(1),
    },
    right: {
        marginLeft: 'auto'
    },
    spinner: {
        width: '24px!important',
        height: '24px!important'
    }
}));

export default BreadcrumbsList;
