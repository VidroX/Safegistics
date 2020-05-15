export interface User {
    id: string;
    Cls: string;
    email: string;
    mobilePhone: string;
    firstName: string;
    lastName: string;
    patronymic: string;
    birthday: string;
    dateJoined: string;
    isActive: boolean;
    manager?: User
}

export interface Device {
    id: string;
    driver: User,
    name: string;
    deviceId: string;
}

export interface Token {
    accessToken: string;
    refreshToken?: string;
}
