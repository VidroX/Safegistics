import {LocalStorage} from "node-localstorage";
import {Device, Token} from "../types/device";
import CryptoUtils from "./cryptoUtils";
import jwt from "jsonwebtoken";

global.localStorage = new LocalStorage("./session");

export interface DeviceInterface {
    device: string | Device;
    token: string | Token;
}

class DeviceUtils {
    device?: Device;
    token?: Token;

    constructor(device?: Device, token?: Token) {
        this.device = device;
        this.token = token;
    }

    save() {
        if (this.device == null || this.token == null) {
            return;
        }

        const user: DeviceInterface = {
            device: CryptoUtils.encodeJSON(this.device),
            token: CryptoUtils.encodeJSON(this.token)
        };

        global.localStorage.setItem("DeviceData", CryptoUtils.encodeJSON(user));
    }

    isTokenExpired(): boolean {
        if (this.token == null) {
            return true;
        }

        try {
            const decodedSession = jwt.decode(this.token.accessToken);
            const expired = ( (decodedSession as any).exp ) * 1000 <= new Date().getTime();

            if (!expired) {
                return false;
            }
        } catch (e) {
            console.warn("Your session signature is invalid.");
        }

        return true;
    }

    static clear() {
        global.localStorage.removeItem("DeviceData");
    }

    static get(): DeviceUtils | null {
        const deviceObj = global.localStorage.getItem("DeviceData");
        if (deviceObj == null) {
            return null;
        }

        try {
            const parsedDeviceObject = CryptoUtils.decodeJSON(deviceObj) as DeviceInterface;
            const device = CryptoUtils.decodeJSON(parsedDeviceObject.device as string) as Device;
            const token = CryptoUtils.decodeJSON(parsedDeviceObject.token as string) as Token;

            return new DeviceUtils(device, token);
        } catch (e) {
            if (process.env.NODE_ENV === 'development') {
                console.error(e);
            }

            return null;
        }
    }
}

export default DeviceUtils;
