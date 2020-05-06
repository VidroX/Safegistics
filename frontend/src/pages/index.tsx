import * as React from "react";
import {useTranslation} from "../i18n";
import useTitle from "../hooks/useTitle";
import {useContext} from "react";
import TopNav from "../contexts/TopNav";

const Main = () => {
    const { t, i18n } = useTranslation();
    const { setCurrentTopNav } = useContext(TopNav);

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

    return (
        <>

        </>
    );
};



export default Main;
