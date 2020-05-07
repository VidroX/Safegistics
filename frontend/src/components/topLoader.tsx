import * as React from "react";
import {LinearProgress} from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import useLoader from "../hooks/useLoader";
import Router from "next/router";

const TopLoader = () => {
    const [pageChanging, setPageChanging] = React.useState(false);

    const classes = useStyles();
    const isLoading = useLoader();

    React.useEffect(() => {
        Router.events.on('routeChangeStart', url => {
            setPageChanging(true);
        });
        Router.events.on('routeChangeComplete', () => {
            setPageChanging(false);
        });
        Router.events.on('routeChangeError', () => {
            setPageChanging(false);
        });
    }, []);

    return (
        <LinearProgress color="secondary" className={isLoading || pageChanging ? classes.loader : classes.hidden} />
    );
};

const useStyles = makeStyles((theme) => ({
    loader: {
        position: 'fixed',
        top: 0,
        display: 'flex',
        width: '100%',
        zIndex: theme.zIndex.drawer + 2,
    },
    hidden: {
        display: 'none'
    }
}));

export default TopLoader;
