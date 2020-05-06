import * as React from "react";
import {useMutation, useQuery} from "@apollo/react-hooks";
import {AppState} from "../interfaces/appState";
import {GET_LOADER, SET_LOADER} from "../apollo/queries/loader";

interface LoaderVariables {
    loading?: boolean
}

const useLoader = (loading?: boolean): boolean => {
    const [isLoading, setLoading] = React.useState(false);

    if (loading != null) {
        const [setLoader, {data}] = useMutation<AppState, LoaderVariables>(SET_LOADER, {
            variables: {loading}
        });

        React.useEffect(() => {
            setLoader();

            setLoading(data != null && data.loader.isLoading != null ? data.loader.isLoading : false);
        }, []);
    } else {
        const { data } = useQuery<AppState>(GET_LOADER);

        React.useEffect(() => {
            setLoading(data != null && data.loader.isLoading != null ? data.loader.isLoading : false);
        }, [data]);
    }

    return isLoading;
};

export default useLoader;
