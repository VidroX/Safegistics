import {gql} from "apollo-boost";

export const DEVICE_LOGIN = gql`
    mutation deviceLogin ($deviceId: String!, $devicePass: String!){
        deviceLogin(loginData: {deviceId: $deviceId, devicePass: $devicePass}) {
            device {
                id,
                name,
                deviceId,
                driver {
                    id,
                    Cls,
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
                        Cls,
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
            },
            token {
                accessToken,
                refreshToken
            }
        }
    }
`;

export const ADD_WARNING = gql`
    mutation addWarning ($device: ID!, $type: String!){
        addWarning(warningData: {
            device: $device,
            type: $type
        }) {
            result,
            warning {
                id,
                type,
                device {
                    id,
                    deviceId,
                    name,
                    driver {
                        id,
                        Cls,
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
                            Cls,
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
                dateIssued
            }
        }
    }
`;
