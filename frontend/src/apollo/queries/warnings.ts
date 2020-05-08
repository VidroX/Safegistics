import {gql} from "apollo-boost";

export const GET_WARNINGS = gql`
    query warnings($rowsPerPage: Int, $cursor: String, $orderBy: String, $fromDate: Date, $toDate: Date, $device: ID){
        warnings (
            first: $rowsPerPage,
            after: $cursor,
            orderBy: $orderBy,
            fromDate: $fromDate,
            toDate: $toDate,
            device: $device
        ) {
            totalCount
            edges {
                node {
                    device {
                        id,
                        name,
                        deviceId,
                        driver {
                            id,
                            firstName,
                            lastName,
                            patronymic
                        }
                    }
                    id,
                    type,
                    dateIssued
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
                    name,
                    deviceId,
                    driver {
                        id,
                        firstName,
                        lastName,
                        patronymic
                    }
                }
                dateIssued
            }
        }
    }
`;
