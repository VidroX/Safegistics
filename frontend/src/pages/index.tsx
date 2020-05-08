import * as React from "react";
import {useTranslation} from "../i18n";
import useTitle from "../hooks/useTitle";
import {useContext} from "react";
import TopNav from "../contexts/TopNav";
import {Grid, Paper, Typography, useMediaQuery} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import useUser from "../hooks/useUser";
import { RiUser2Line } from "react-icons/ri";
import { TiWarningOutline } from "react-icons/ti";
import theme from "../theme";
import LineChart from "../components/LineChart";
import {Datum, Serie} from "@nivo/line";
import {useQuery} from "@apollo/react-hooks";
import {GET_WARNINGS} from "../apollo/queries/warnings";
import {WarningData, WarningEdge} from "../interfaces/warnings";
import {UserData} from "../interfaces/user";
import {GET_USERS} from "../apollo/queries/user";
import {addDays, format, subWeeks} from "date-fns";
import {Skeleton} from "@material-ui/lab";
import {localizedFormat} from "../utils/dateUtils";

const Main = () => {
    const { t, i18n } = useTranslation();
    const { setCurrentTopNav } = useContext(TopNav);
    const user = useUser();

    const classes = useStyles();
    const sm = useMediaQuery(theme.breakpoints.down('sm'));

    React.useEffect(() => {
        setCurrentTopNav({
            breadcrumbs: [
                {
                    name: t('dashboard.dashboard'),
                    url: '/',
                }
            ],
            buttons: []
        });
    }, [i18n.language]);


    useTitle(t('dashboard.dashboard'));

    const { data: usersData, loading: usersLoading, error: usersError } = useQuery<UserData>(GET_USERS, {
        skip: user?.isStaff == false,
        variables: {
            rowsPerPage: 0
        }
    });

    const { data: warningsData, loading: warningsLoading, error: warningsError } = useQuery<WarningData>(GET_WARNINGS, {
        variables: {
            fromDate: format(subWeeks(new Date(), 1), 'yyyy-MM-dd'),
            toDate: format(addDays(new Date(), 1), 'yyyy-MM-dd')
        }
    });

    const generateChartData = (warnings?: WarningEdge[]): Serie[] => {
        const data: Serie[] = [
            {
                "id": "warnings",
                "data": []
            },
        ];

        if (!warnings) {
            return data;
        }

        const points: Datum[] = [];
        const frequencies: {
            [date: string]: number
        } = {};

        for (const index in warnings) {
            if(warnings.hasOwnProperty(index)) {
                const warning = warnings[index].node;
                const date = localizedFormat(new Date(warning.dateIssued), 'P');

                frequencies[date] = frequencies[date] ? frequencies[date] + 1 : 1;
            }
        }

        const orderedFrequencies: {
            [date: string]: number
        } = {};
        Object.keys(frequencies).sort().forEach((key, value) => {
            orderedFrequencies[key] = value;
        });

        for (const date in orderedFrequencies) {
            if (orderedFrequencies.hasOwnProperty(date)) {
                points.push({
                    "x": date,
                    "y": frequencies[date]
                });
            }
        }

        data[0].data = points;

        return data;
    };

    return (
        <>
            <Grid container direction={sm ? "column" : "row"}>
                { user?.isStaff == true &&
                <Grid item className={classes.itemWrapper}>
                    <Paper className={classes.item}>
                        <Grid container>
                            <Grid item className={classes.wrapper}>
                                <Grid
                                    container
                                    className={classes.innerWrapper}
                                    direction="column"
                                    justify="center"
                                    alignItems="center">
                                    <RiUser2Line size={64} color={theme.palette.secondary.light} />
                                </Grid>
                            </Grid>
                            <Grid item className={classes.textGrid}>
                                <Grid container direction="column">
                                    <Typography
                                        noWrap
                                        className={classes.title}
                                        variant="subtitle2">
                                        {t('dashboard.amountOfRegisteredUsers')}
                                    </Typography>
                                    { usersLoading && <Skeleton animation="wave" /> }
                                    { !usersLoading &&
                                    <span className={classes.subTitle}>
                                        {usersData?.allUsers.totalCount}
                                    </span> }
                                </Grid>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid> }
                <Grid item className={classes.itemWrapper}>
                    <Paper className={classes.item}>
                        <Grid container spacing={sm ? 0 : 2}>
                            <Grid item className={classes.wrapper}>
                                <Grid
                                    container
                                    className={classes.innerWrapper}
                                    direction="column"
                                    justify="center"
                                    alignItems="center">
                                    <TiWarningOutline size={64} color={theme.palette.secondary.light} />
                                </Grid>
                            </Grid>
                            <Grid item className={classes.textGrid}>
                                <Grid container direction="column">
                                    <Typography
                                        noWrap
                                        className={classes.title}
                                        variant="subtitle2">
                                        {t('dashboard.warningCount')}
                                    </Typography>
                                    { warningsLoading && <Skeleton animation="wave" /> }
                                    { !warningsLoading &&
                                    <span className={classes.subTitle}>
                                        {warningsData?.warnings.totalCount}
                                    </span> }
                                </Grid>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
            <Typography className={classes.defMarginTop} variant="body1">
                {t('dashboard.warningCountChartTitle')}
            </Typography>
            <Paper className={classes.chartWrapper}>
                <LineChart data={generateChartData(warningsData?.warnings.edges)} />
            </Paper>
        </>
    );
};

const useStyles = makeStyles((theme) => ({
    wrapper: {
        [theme.breakpoints.down('xs')]: {
            width: '100%'
        },
    },
    innerWrapper: {
        height: '100%',
        width: '100%'
    },
    item: {
        width: '100%',
        padding: 16
    },
    textGrid: {
        flex: 1,
    },
    itemWrapper: {
        display: 'flex',
        height: '100%',
        flex: 1,
        [theme.breakpoints.down('sm')]: {
            width: '100%',
            marginRight: 0,
            marginTop: 8
        },
        '&:not(:last-child)': {
            marginRight: 8
        }
    },
    defMarginTop: {
        marginTop: 24,
    },
    title: {
        textAlign: 'center'
    },
    subTitle: {
        color: theme.palette.secondary.main,
        fontWeight: 500,
        fontSize: 24,
        textAlign: 'center',
        alignSelf: 'center'
    },
    fullWidth: {
        width: '100%'
    },
    chartWrapper: {
        marginTop: 16,
        padding: 16,
        display: 'block',
        width: '100%',
        height: 450
    }
}));

export default Main;
