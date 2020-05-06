import * as React from "react";
import {useQuery} from "@apollo/react-hooks";
import {AppState, User} from "../interfaces/appState";
import {GET_LOCAL_USER} from "../apollo/queries/user";
import {ApolloClient, NormalizedCacheObject} from "apollo-boost";

const useUser = (apollo?: ApolloClient<NormalizedCacheObject>): User | null => {
    const { data } = useQuery<AppState>(GET_LOCAL_USER, { client: apollo });

    return data != null ? data.user : null;
};

export default useUser;
