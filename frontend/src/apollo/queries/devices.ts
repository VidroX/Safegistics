import {gql} from "apollo-boost";

export const GET_DEVICES = gql`
    query devices($userId: ID){
        devices(userId: $userId) {
            totalCount,
            edges {
                node {
                    id,
                    driver {
                        id,
                        firstName,
                        lastName,
                        patronymic
                    },
                    name,
                    deviceId
                }
                cursor
            },
            pageInfo {
                endCursor
                hasNextPage
            }
        }
    }
`;

export const REMOVE_DEVICE = gql`
    mutation removeDevice($deviceId: String!){
        removeDevice(deviceId: $deviceId) {
            result
        }
    }
`;

export const REGISTER_DEVICE = gql`
    mutation deviceRegister($deviceId: String!, $devicePass: String!, $name: String!, $driver: ID){
        deviceRegister(registerData: {deviceId: $deviceId, devicePass: $devicePass, name: $name, driver: $driver}) {
            device {
                id,
                driver {
                    id,
                    firstName,
                    lastName,
                    patronymic
                },
                name,
                deviceId,
            },
            token {
                accessToken,
                refreshToken
            }
        }
    }
`;
