import { terminal as term } from "terminal-kit";
import DefaultClient from "apollo-boost";
import {DEVICE_LOGIN} from "../apollo/queries";
import {DeviceQuery, DeviceVariables} from "../apollo/variables/deviceVariables";
import DeviceUtils from "./deviceUtils";

export interface Message {
    type: string,
    message: string;
}

export const mainMenuItems = [
    "Emit 'sleeping' warning",
    "Emit 'other' warning",
    "Logout",
    "Exit",
];

export const terminate = () => {
    term.grabInput( false ) ;
    setTimeout( () => {
        process.exit()
    }, 100 ) ;
};

export const showLoginPrompt = async (client: DefaultClient<unknown>) => {
    let deviceObj = DeviceUtils.get();
    let error: string | null = null;

    while (deviceObj == null) {
        term.clear();
        term.bgBrightWhite("Safegistics IoT Emulator > Login");
        term.moveTo(1, 3);

        if (error) {
            term.red(error);
            term.moveTo(1, 5);
        }

        term("Device ID: ");
        const deviceId = await term.inputField({}).promise;
        term.moveTo(1, error ? 6 : 4);
        term("Device Password: ");
        const devicePass = await term.inputField({echoChar: true}).promise;

        if (deviceId == null || devicePass == null) {
            error = "Some fields were empty";
            continue;
        }

        await client.mutate<DeviceQuery, DeviceVariables>({
            mutation: DEVICE_LOGIN,
            variables: {
                deviceId: deviceId as string,
                devicePass: devicePass as string
            }
        }).then((res) => {
            const loginObject = res.data?.deviceLogin;
            if (loginObject?.device != null && loginObject?.token != null && loginObject.token.accessToken != null) {
                const device = new DeviceUtils(loginObject.device, loginObject.token);
                device.save();
                deviceObj = device;
            } else {
                error = "Incorrect device id or password";
            }
        }).catch(() => {
            error = "Incorrect device id or password";
        });
    }
};

export const showMainMenu = (
    messages: Message[] | null,
    onItemSelected?: (selectedIndex: number, selectedText: string) => void
) => {
    term.clear();
    term.bgBrightWhite("Safegistics IoT Emulator");
    if (messages != null && messages.length > 0) {
        messages.forEach(((message, index) => {
            term.moveTo(1, index + 3);
            if (message.type === "error") {
                term.red(message.message);
            } else if (message.type === "success") {
                term.green(message.message);
            } else {
                term.cyan(message.message);
            }
        }));
    }
    term.moveTo(1, !messages ? 2 : messages.length + 3);
    term.singleColumnMenu(mainMenuItems, (_, { selectedIndex, selectedText }) => {
        if (onItemSelected) {
            onItemSelected(selectedIndex, selectedText);
        }
    });
};
