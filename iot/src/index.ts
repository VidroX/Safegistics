import 'cross-fetch/polyfill';
import ApolloClient from "apollo-boost";
import {Message, showLoginPrompt, showMainMenu, terminate} from "./utils/terminalUtils";
import DeviceUtils from "./utils/deviceUtils";
import {AddWarningQuery, AddWarningVariables} from "./apollo/variables/deviceVariables";
import {ADD_WARNING} from "./apollo/queries";

let deviceObj = DeviceUtils.get();

const apolloClient = new ApolloClient({
    uri: "http://192.168.1.62:5000/graphql",
    request: async (operation) => {
        let device = DeviceUtils.get();

        if (device != null && !device.isTokenExpired()) {
            const token = device.token?.accessToken;

            operation.setContext({
                headers: {
                    authorization: token ? `Bearer ${token}` : ''
                }
            });
        } else if (device?.isTokenExpired()) {
            DeviceUtils.clear();
            device = null;
            await showLoginPrompt(apolloClient);
            device = DeviceUtils.get();
            deviceObj = device;
        }
    },
    onError: () => {},
});

const app = async () => {
    if (deviceObj == null || deviceObj.isTokenExpired()) {
        deviceObj = null;
        await showLoginPrompt(apolloClient);
        deviceObj = DeviceUtils.get();
    }

    const driver = deviceObj?.device?.driver;

    const defaultMessageSet: Message[] = [
        {
            type: "info",
            message: "Device: " + deviceObj?.device?.deviceId
        },
        {
            type: "info",
            message: "Driver: " + driver?.firstName + " " + driver?.lastName + " " + driver?.patronymic
        },
    ];

    const mainMenuCallback = async (selectedIndex: number, selectedText: string) => {
        switch (selectedIndex) {
            case 0: {
                let messages = [
                    ...defaultMessageSet,
                    {
                        type: "error",
                        message: "Unable to emit warning"
                    }
                ];

                if (deviceObj?.device?.id != null) {
                    await apolloClient.mutate<AddWarningQuery, AddWarningVariables>({
                        mutation: ADD_WARNING,
                        variables: {
                            device: deviceObj.device.id,
                            type: "sleeping"
                        }
                    }).then(() => {
                        messages = [
                            ...defaultMessageSet,
                            {
                                type: "success",
                                message: "Successfully emitted warning"
                            }
                        ];
                    });
                }

                await showMainMenu(messages, mainMenuCallback);
                break;
            }
            case 1: {
                let messages = [
                    ...defaultMessageSet,
                    {
                        type: "error",
                        message: "Unable to emit warning"
                    }
                ];

                if (deviceObj?.device?.id != null) {
                    await apolloClient.mutate<AddWarningQuery, AddWarningVariables>({
                        mutation: ADD_WARNING,
                        variables: {
                            device: deviceObj.device.id,
                            type: "other"
                        }
                    }).then(() => {
                        messages = [
                            ...defaultMessageSet,
                            {
                                type: "success",
                                message: "Successfully emitted warning"
                            }
                        ];
                    });
                }

                await showMainMenu(messages, mainMenuCallback);
                break;
            }
            case 2: {
                DeviceUtils.clear();
                deviceObj = null;
                await app();
                break;
            }
            case 3: {
                terminate();
                break;
            }
            default: {
                await showMainMenu(defaultMessageSet, mainMenuCallback);
                break;
            }
        }
    };

    await showMainMenu(defaultMessageSet, mainMenuCallback);
};

app();
