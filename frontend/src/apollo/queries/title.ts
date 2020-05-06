import {gql} from "apollo-boost";

export const GET_TITLE = gql`
    {
        title @client
    }
`;

export const SET_TITLE = gql`
    mutation setTitle($title: String) {
        setTitle(title: $title) @client {
          title @client
        }
    }
`;
