import {Token, User} from "./appState";

export interface Device {
    id: string;
    driver?: User | null;
    name: string;
    deviceId: string;
}

export interface DeviceEdge {
    node: Device;
    cursor: string;
}

export interface DevicesData {
    devices: {
        __typename: string;
        totalCount: number;
        edges: DeviceEdge[];
        pageInfo: {
            endCursor: string;
            hasNextPage: boolean;
        }
    };
}

export interface RemoveDeviceVariables {
    deviceId?: string;
}

export interface RemoveDeviceState {
    removeDevice: {
        result: string;
    }
}

export interface DeviceRegisterVariables {
    deviceId: string;
    devicePass: string;
    name: string;
    driver?: string;
}

export interface DeviceRegisterState {
    deviceRegister: {
        device: Device;
        token: Token
    }
}
