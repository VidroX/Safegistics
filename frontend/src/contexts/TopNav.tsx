import * as React from "react";
import {Breadcrumb, TopNav, TopNavButtons} from "../interfaces/topNav";

export interface TopNavContext {
    breadcrumbs: Breadcrumb[];
    buttons?: TopNavButtons[] | null;
    setCurrentTopNav: (topNav: TopNav) => void;
}

export const defaultTopNav: TopNav = {
    breadcrumbs: [],
    buttons: []
};

export const defaultTopNavContext: TopNavContext = {
    breadcrumbs: [],
    buttons: [],
    setCurrentTopNav: () => {}
};

export default React.createContext<TopNavContext>(defaultTopNavContext);
