import {User} from "./appState";

export interface UserVariables {
    id?: string,
    email?: string;
    mobilePhone?: string;
    firstName?: string;
    lastName?: string;
    patronymic?: string;
    birthday?: string;
    dateJoined?: string;
    isStaff?: boolean;
    isActive?: boolean;
}

export interface UserPayload {
    id?: string,
    email?: string;
    type?: string;
    is_staff?: boolean;
}

export interface CurrentUserData {
    currentUser: {
        edges: {
            node: User;
            cursor: string;
        }[]
    };
}

export interface UserEdge {
    node: User;
    cursor: string;
}

export interface UserData {
    allUsers: {
        __typename: string;
        totalCount: number;
        edges: UserEdge[];
        pageInfo: {
            endCursor: string;
            hasNextPage: boolean;
        }
    };
}
