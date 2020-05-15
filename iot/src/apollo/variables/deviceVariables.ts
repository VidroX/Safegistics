import {Device, Token} from "../../types/device";

export interface DeviceQuery {
    deviceLogin: {
        device: Device;
        token: Token;
    }
}

export interface DeviceVariables {
    deviceId: string;
    devicePass: string;
}

export interface AddWarningQuery {
    addWarning: {
        result: string;
        warning: {
            id: string;
            type: string;
            device: Device;
            dateIssued: string;
        }
    }
}

export interface AddWarningVariables {
    device: string;
    type: "other" | "sleeping";
}
