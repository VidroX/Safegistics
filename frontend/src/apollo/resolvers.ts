import {Resolvers} from "apollo-client";

export const resolvers = (writeState: any, readState: any): Resolvers | Resolvers[] => {
    return {
        Mutation: {
            setTitle(_root, variables) {
                const newState = {
                    __typename: 'Title',
                    title: variables.title,
                };

                writeState(newState);

                return newState;
            },
            setLoader(_root, variables) {
                const newState = {
                    __typename: 'Loader',
                    loader: {
                        __typename: 'Loader',
                        isLoading: variables.input.loading,
                    }
                };

                writeState(newState);

                return newState;
            },
            setUser(_root, variables) {
                const newState = {
                    __typename: 'LocalUser',
                    user: {
                        __typename: 'LocalUser',
                        id: variables.input.id,
                        email: variables.input.email,
                        mobilePhone: variables.input.mobilePhone,
                        firstName: variables.input.firstName,
                        lastName: variables.input.lastName,
                        patronymic: variables.input.patronymic,
                        birthday: variables.input.birthday,
                        dateJoined: variables.input.dateJoined,
                        isStaff: variables.input.isStaff,
                        isActive: variables.input.isActive,
                    }
                };

                writeState(newState);

                return newState;
            },
        }
    };
};
