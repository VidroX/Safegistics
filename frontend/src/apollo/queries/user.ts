import {gql} from "apollo-boost";

export const GET_USERS = gql`
    query allUsers($rowsPerPage: Int, $cursor: String, $orderBy: String, $userId: ID, $search: String){
        allUsers (first: $rowsPerPage, after: $cursor, orderBy: $orderBy, userId: $userId, search: $search) {
            totalCount
            edges {
                node {
                    id,
                    type: Cls,
                    email,
                    mobilePhone,
                    firstName,
                    lastName,
                    patronymic,
                    birthday,
                    dateJoined,
                    isStaff,
                    isActive,
                    manager {
                        id,
                        type: Cls,
                        email,
                        mobilePhone,
                        firstName,
                        lastName,
                        patronymic,
                        birthday,
                        dateJoined,
                        isStaff,
                        isActive
                    }
                }
                cursor
            }
            pageInfo {
                endCursor
                hasNextPage
            }
        }
    }
`;

export const GET_MANAGERS = gql`
    query users($rowsPerPage: Int, $cursor: String, $orderBy: String, $userId: ID, $search: String){
        users (first: $rowsPerPage, after: $cursor, orderBy: $orderBy, userId: $userId, search: $search) {
            totalCount
            edges {
                node {
                    id,
                    type: Cls,
                    email,
                    mobilePhone,
                    firstName,
                    lastName,
                    patronymic,
                    birthday,
                    dateJoined,
                    isStaff,
                    isActive
                }
                cursor
            }
            pageInfo {
                endCursor
                hasNextPage
            }
        }
    }
`;

export const GET_DRIVERS = gql`
    query drivers($rowsPerPage: Int, $cursor: String, $orderBy: String, $userId: ID, $search: String){
        drivers (first: $rowsPerPage, after: $cursor, orderBy: $orderBy, userId: $userId, search: $search) {
            totalCount
            edges {
                node {
                    id,
                    type: Cls,
                    email,
                    mobilePhone,
                    firstName,
                    lastName,
                    patronymic,
                    birthday,
                    dateJoined,
                    isActive,
                    manager {
                        id,
                        type: Cls,
                        email,
                        mobilePhone,
                        firstName,
                        lastName,
                        patronymic,
                        birthday,
                        dateJoined,
                        isStaff,
                        isActive
                    }
                }
                cursor
            }
            pageInfo {
                endCursor
                hasNextPage
            }
        }
    }
`;

export const GET_LOCAL_USER = gql`
    {
        user @client {
            id
            email
            mobilePhone
            firstName
            lastName
            patronymic
            birthday
            dateJoined
            isStaff
            isActive
        }
    }
`;

export const GET_CURRENT_USER = gql`
    {
        currentUser {
            edges {
                node {
                    id,
                    email,
                    mobilePhone,
                    firstName,
                    lastName,
                    patronymic,
                    birthday,
                    dateJoined,
                    isStaff,
                    isActive
                }
            }
        }
    }
`;

export const SET_LOCAL_USER = gql`
    mutation setUser($id: String, $email: String, $mobilePhone: String, $firstName: String, $lastName: String,
        $patronymic: String, $birthday: Date, $dateJoined: DateTime, $isStaff: Boolean, $isActive: Boolean) {
        
        setUser(input: {
            id: $id,
            email: $email,
            mobilePhone: $mobilePhone,
            firstName: $firstName,
            lastName: $lastName,
            patronymic: $patronymic,
            birthday: $birthday,
            dateJoined: $dateJoined,
            isStaff: $isStaff,
            isActive: $isActive
        }) @client {
            
            user @client {
                id
                email
                mobilePhone
                firstName
                lastName
                patronymic
                birthday
                dateJoined
                isStaff
                isActive
            }
            
        }
        
    }
`;

export const USER_LOGIN = gql`
    mutation login ($email: String!, $password: String!){
        login(loginData: {email: $email, password: $password}) {
            user {
                email,
                mobilePhone,
                firstName,
                lastName,
                patronymic,
                birthday,
                dateJoined,
                isActive,
                isStaff
            },
            token {
                accessToken
            }
        }
    }
`;

export const UPDATE_USER = gql`
    mutation updateUser ($updateUserId: ID, $email: String, $password: String, $firstName: String, $lastName: String, $patronymic: String,
        $mobilePhone: String, $birthday: Date, $type: String, $isStaff: Boolean, $isActive: Boolean, $manager: ID){
        updateUser(
            userUpdateId: $updateUserId,
            userData: {
                email: $email,
                password: $password,
                firstName: $firstName,
                lastName: $lastName,
                patronymic: $patronymic,
                mobilePhone: $mobilePhone,
                birthday: $birthday,
                type: $type, 
                isStaff: $isStaff,
                isActive: $isActive,
                manager: $manager
            }
        ) {
            user {
                id,
                email,
                mobilePhone,
                firstName,
                lastName,
                patronymic,
                birthday,
                dateJoined,
                isActive,
                isStaff
            },
            token {
                accessToken
            }
        }
    }
`;

export const USER_REGISTER = gql`
    mutation register ($email: String!, $password: String!, $firstName: String!, $lastName: String!,
        $patronymic: String, $mobilePhone: String!, $birthday: Date!, $type: String!, $manager: ID){
        register(registerData: {
            email: $email,
            password: $password, 
            firstName: $firstName,
            lastName: $lastName,
            patronymic: $patronymic,
            mobilePhone: $mobilePhone,
            birthday: $birthday, 
            type: $type, 
            manager: $manager
        }) {
            user {
                id,
                type: Cls,
                email,
                mobilePhone,
                firstName,
                lastName,
                patronymic,
                birthday,
                dateJoined,
                isActive,
                isStaff
            },
            token {
                accessToken,
                refreshToken
            }
        }
    }
`;

export const USER_DELETE = gql`
    mutation ($userId: ID!){
        deleteUser(userId: $userId) {
            result
        }
    }
`;
