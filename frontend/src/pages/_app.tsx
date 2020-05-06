import * as React from "react";
import Head from "next/head";
import { ApolloProvider } from "@apollo/react-common";
import withApollo from "../apollo/client";
import { ApolloClient, NormalizedCacheObject } from "apollo-boost";
import {appWithTranslation, localeMap} from "../i18n";
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from "../theme";
import App, {AppContext, AppProps} from "next/app";
import Header from "../components/header";
import {Grid, Toolbar} from "@material-ui/core";
import { IconContext } from "react-icons";
import TopLoader from "../components/topLoader";
import { config } from "../../config";
import BreadcrumbsList from "../components/breadcrumbsList";
import Layout from "../components/layout";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { useTranslation } from "../i18n";
import TopNav from "../contexts/TopNav";
import useTopNav from "../hooks/useTopNav";

interface IAppProps {
    apollo: ApolloClient<NormalizedCacheObject>;
}

const MyApp = (props: AppProps & IAppProps) => {
    const { Component, pageProps, apollo } = props;
    const classes = useStyles();
    const { i18n } = useTranslation();
    const topNav = useTopNav();

    return (
        <>
            <Head>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
            </Head>
            <ApolloProvider client={apollo}>
                <ThemeProvider theme={theme}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={localeMap[i18n.language]}>
                        <IconContext.Provider value={config.icons}>
                            <TopNav.Provider value={topNav}>
                                <CssBaseline />
                                <Layout className={classes.root}>
                                    <TopLoader />
                                    <Header />
                                    <main className={classes.mainContent}>
                                        <Toolbar className={classes.toolbar}/>
                                        <BreadcrumbsList className={classes.breadcrumbs} />
                                        <Grid container direction="column" className={classes.content}>
                                            <Component {...pageProps} />
                                        </Grid>
                                    </main>
                                </Layout>
                            </TopNav.Provider>
                        </IconContext.Provider>
                    </MuiPickersUtilsProvider>
                </ThemeProvider>
            </ApolloProvider>
        </>
    );
};

MyApp.getInitialProps = async (appContext: any) => {
    const appProps = await App.getInitialProps(appContext);
    const Component = appContext.Component;
    let pageProps = {};
    if(Component.getInitialProps){
        pageProps = await Component.getInitialProps(appContext.ctx);
    }
    return { ...appProps, pageProps }
};

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    '@global': {
        'html, body': {
            height: '100%',
        }
    },
    mainContent: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    content: {
        flexWrap: 'wrap',
        wordBreak: 'break-all'
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        ...theme.mixins.toolbar,
    },
    breadcrumbs: {
        marginBottom: 16
    }
}));

export default appWithTranslation(withApollo(MyApp));
