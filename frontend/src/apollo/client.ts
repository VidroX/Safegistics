import {config} from '../../config';
import fetch from 'cross-fetch';
import withApollo from "next-with-apollo"
import ApolloClient, { InMemoryCache } from "apollo-boost"
import {resolvers} from "./resolvers";
import typeDefs from './schemas/local-schema.graphql';
import Cookies from "js-cookie";
import jwt from "jsonwebtoken";

const defaultAppState = {
    loader: {
        __typename: 'Loader',
        isLoading: false
    },
    user: null,
    title: "",
};

export default withApollo(
    ({ initialState }) => {
        const cache = new InMemoryCache().restore(initialState || {});

        const getState = (query: any): any => {
            return cache.readQuery<any>({ query });
        };

        const writeState = (state: any) => {
            return cache.writeData({ data: {...state} });
        };

        writeState(defaultAppState);

        return new ApolloClient({
            uri: config.api.url,
            onError: ({ graphQLErrors, networkError }) => {
                if (!config.general.devMode) {
                    return;
                }
                if (graphQLErrors) {
                    graphQLErrors.forEach(({message, locations, path}) =>
                        console.warn(
                            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
                        ),
                    );
                }
                if (networkError) {
                    console.warn(`[Network error]: ${networkError}`);
                }
            },
            request: (operation) => {
                const token = Cookies.get(config.general.sessionCookie);
                operation.setContext({
                    headers: {
                        authorization: token ? `Bearer ${token}` : ''
                    }
                });

                if (token != null) {
                    try {
                        const decodedSession = jwt.decode(token);
                        const expired = ( (decodedSession as any).exp ) * 1000 <= new Date().getTime();

                        if (!expired) {
                            operation.setContext({
                                headers: {
                                    authorization: token ? `Bearer ${token}` : ''
                                }
                            });
                        } else {
                            console.warn("Your session time has expired. Please re-login.");
                            Cookies.remove(config.general.sessionCookie, { path: '/' });
                            window.location.reload();
                        }
                    } catch (e) {
                        console.warn("Your session signature is invalid.");
                        Cookies.remove(config.general.sessionCookie, { path: '/' });
                    }
                }
            },
            cache,
            typeDefs,
            fetch,
            resolvers: resolvers(writeState, getState)
        })
    }
)
