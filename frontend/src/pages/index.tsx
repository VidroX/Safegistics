import * as React from "react";
import {useTranslation} from "../i18n";
import useTitle from "../hooks/useTitle";
import {useContext} from "react";
import TopNav from "../contexts/TopNav";
import {Grid, Paper} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import useUser from "../hooks/useUser";
import { RiUser2Line } from "react-icons/ri";
import { TiWarningOutline } from "react-icons/ti";
import theme from "../theme";
import LineChart from "../components/LineChart";
import { Serie } from "@nivo/line";

const Main = () => {
    const { t, i18n } = useTranslation();
    const { setCurrentTopNav } = useContext(TopNav);
    const user = useUser();

    const classes = useStyles();

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
    }, []);


    useTitle(t('dashboard.dashboard'));

    const renderChart = () => {
        const data: Serie[] = [
            {
                "id": "warning",
                "data": [
                    {
                        "x": "plane",
                        "y": 252
                    },
                    {
                        "x": "helicopter",
                        "y": 125
                    },
                    {
                        "x": "boat",
                        "y": 177
                    }
                ]
            }
        ];

        return (
            <LineChart data={data} />
        );
    };

    return (
        <>
            <Grid container spacing={2}>
                <Grid item>
                    <Paper className={classes.item}>
                        <Grid container spacing={2}>
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
                            <Grid item>
                                <Grid container direction="column">
                                    <span>123</span>
                                    <span>123</span>
                                    <span>123</span>
                                    <span>123</span>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
                <Grid item>
                    <Paper className={classes.item}>
                        <Grid container spacing={2}>
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
                            <Grid item>
                                <Grid container direction="column">
                                    <span>123</span>
                                    <span>123</span>
                                    <span>123</span>
                                    <span>123</span>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
            <Paper className={classes.chartWrapper}>
                {renderChart()}
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
        display: 'flex',
        padding: 16,
    },
    defMarginTop: {
        marginTop: 16,
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
