import * as React from "react";
import {TopNav} from "../interfaces/topNav";
import {defaultTopNav, TopNavContext} from "../contexts/TopNav";

const useTopNav = (): TopNavContext => {
    const [topNavList, setTopNavList] = React.useState<TopNav>(defaultTopNav);

    const setCurrentTopNav = React.useCallback((topNav: TopNav) => {
        setTopNavList(topNav);
    }, []);

    return {
        ...topNavList,
        setCurrentTopNav
    };
};

export default useTopNav;
