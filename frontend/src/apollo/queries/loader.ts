import {gql} from "apollo-boost";

export const GET_LOADER = gql`
    {
        loader @client {
            isLoading
        }
    }
`;

export const SET_LOADER = gql`
    mutation setLoader($loading: Boolean) {
        setLoader(input: {loading: $loading}) @client {
          isLoading @client
        }
    }
`;
