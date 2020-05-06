import * as React from "react";
import {useMutation, useQuery} from "@apollo/react-hooks";
import {AppState} from "../interfaces/appState";
import {GET_TITLE, SET_TITLE} from "../apollo/queries/title";
import {ApolloClient, NormalizedCacheObject} from "apollo-boost";

interface TitleVariables {
    title: string
}

const useTitle = (title?: string | null, apollo?: ApolloClient<NormalizedCacheObject>): string => {
    const titleToSet = title != null ? title : "";

    const [setTitle, { data }] = useMutation<AppState, TitleVariables>(SET_TITLE, {
        variables: { title: titleToSet },
        client: apollo
    });

    let cacheTitle = "";

    if (titleToSet.length < 1) {
        const {data: localTitle} = useQuery<AppState>(GET_TITLE, { client: apollo });

        cacheTitle = localTitle != null ? localTitle.title : "";
    }

    React.useEffect(() => {
        if (titleToSet.length > 0) {
            setTitle();
        }
    }, [titleToSet]);

    if (data != null && data.title != null && data.title.length > 0) {
        return data.title;
    }

    return cacheTitle;
};

export default useTitle;
