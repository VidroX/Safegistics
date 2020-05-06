import * as React from 'react';
import Head from "next/head";
import useTitle from "../hooks/useTitle";
import {config} from "../../config";
import { ReactNode } from "react";
import {CurrentUserData, UserPayload, UserVariables} from "../interfaces/user";
import useUser from "../hooks/useUser";
import {useMutation, useQuery} from "@apollo/react-hooks";
import {GET_CURRENT_USER, SET_LOCAL_USER} from "../apollo/queries/user";
import {AppState} from "../interfaces/appState";
import Cookies from "js-cookie";
import jwt from "jsonwebtoken";
import {isUserPayloadValid} from "../utils/userUtils";
import Auth from "./auth";

interface LayoutProps {
    className?: string | undefined;
    children: ReactNode;
}

const Layout = (props: LayoutProps) => {
    const [shouldLogin, setShouldLogin] = React.useState(false);
    const [shouldLoadUser, setShouldLoadUser] = React.useState(false);
    const [sessionUserData, setSessionUserData] = React.useState<UserPayload | null>(null);

    const title = useTitle();
    const localUser = useUser();
    const {data: remoteUser, loading, error} = useQuery<CurrentUserData>(GET_CURRENT_USER, {
        skip: shouldLogin || !shouldLoadUser
    });

    const [setUser] = useMutation<AppState, UserVariables>(SET_LOCAL_USER);

    let titleToShow = config.general.appName;
    if (title != null && title.length > 0) {
        titleToShow = title + " / " + config.general.appName;
    }

    React.useEffect(() => {
        const jssStyles = document.querySelector('#jss-server-side');
        if (jssStyles) {
            jssStyles.parentElement?.removeChild(jssStyles);
        }

        try {
            const session = Cookies.get(config.general.sessionCookie);

            if (session != null) {
                const decodedSession = jwt.decode(session);
                const sessionUser = (decodedSession as any).identity as UserPayload;

                if (sessionUser != null) {
                    if (!isUserPayloadValid(sessionUser) || localUser == null) {
                        setSessionUserData(sessionUser);
                        setShouldLoadUser(true);
                        setShouldLogin(false);
                    } else {
                        setShouldLogin(true);
                    }
                } else {
                    setShouldLogin(true);
                }
            } else {
                setShouldLogin(true);
            }
        } catch (e) {
            setShouldLogin(true);
        }
    }, []);

    React.useEffect(() => {
        if (shouldLoadUser && !loading && !error && sessionUserData != null && remoteUser != null) {
            const apiUser = remoteUser.currentUser.edges[0].node;

            setUser({
                variables: {
                    id: sessionUserData.id,
                    email: apiUser?.email,
                    mobilePhone: apiUser?.mobilePhone,
                    firstName: apiUser?.firstName,
                    lastName: apiUser?.lastName,
                    patronymic: apiUser?.patronymic,
                    birthday: apiUser?.birthday,
                    dateJoined: apiUser?.dateJoined,
                    isStaff: apiUser?.isStaff,
                    isActive: apiUser?.isActive,
                },
            }).then(() => {
                setShouldLoadUser(false);
            });
        }
    }, [loading, error, shouldLoadUser, remoteUser, sessionUserData]);

    return (
        <>
            <Head>
                <title>{ titleToShow }</title>
            </Head>
            <div className={props.className}>
                { !shouldLogin && props.children }
                { shouldLogin && <Auth /> }
            </div>
        </>
    );
};

export default Layout;
