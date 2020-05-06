export interface Breadcrumb {
    name: string;
    url: string;
}

export interface TopNavRoute {
    url: string,
    params?: {
        [key: string]: string
    }
}

export interface TopNavButtons {
    type: string,
    icon?: string,
    text: string,
    loading?: boolean,
    onPress?: () => void,
    route?: TopNavRoute | null
}

export interface TopNav {
    breadcrumbs: Breadcrumb[],
    buttons?: TopNavButtons[] | null
}
