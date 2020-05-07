export interface AppState {
    loader: {
        isLoading: boolean
    },
    title: string,
    user: User | null
}

export interface User {
    id: string;
    email: string;
    mobilePhone: string;
    firstName: string;
    lastName: string;
    patronymic: string;
    birthday: string;
    dateJoined: string;
    isStaff?: boolean;
    isActive: boolean;
    manager?: User | null;
    type?: string;
}

export interface Token {
    accessToken: string;
    refreshToken?: string;
}
